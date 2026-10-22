import { prisma } from "@/lib/prisma";
import { Prisma, type DenemeDers, type EducationLevel } from "@/generated/prisma/client";
import { bugununTarihi, getBugununDenemesi } from "@/lib/kpssDeneme";
import { proHediyeEt } from "@/lib/proHediye";
import { proAktifMi } from "@/lib/whatsapp";

const GUN_MS = 86_400_000;
/** Her gun her dersten bir soru (Guncel Bilgiler havuzu kucuk ve cabuk eskiyor: dahil degil). */
export const GUNLUK_DERSLER: DenemeDers[] = ["TURKCE", "MATEMATIK", "TARIH", "COGRAFYA", "VATANDASLIK"];
/** Seri bu kadar gunun katina ulasinca 1 gun Pro hediye. */
export const SERI_HEDIYE_GUN = 7;

/** Uyenin ogrenim duzeyine gore soru duzeyi (KPSS: Lise / Onlisans / Lisans). */
export function gunlukDuzey(level: EducationLevel | null | undefined): EducationLevel {
  if (level === "LISE" || level === "ILKOGRETIM") return "LISE";
  if (level === "ONLISANS") return "ONLISANS";
  return "LISANS";
}

/**
 * Gunun seti: duzey + gun icin sabit, herkes ayni 5 soruyu gorur. Gunun denemesindeki sorular (cevabi
 * denemeyi bozmasin) ve son 30 gunun setleri disarida; ortak metinli (grup) sorular tek soruluk karta sigmaz.
 */
export async function gununSeti(duzey: EducationLevel) {
  const tarih = bugununTarihi();
  const mevcut = await prisma.gunlukSoruSeti.findUnique({ where: { duzey_tarih: { duzey, tarih } } });
  if (mevcut) return mevcut;

  const [deneme, sonSetler] = await Promise.all([
    getBugununDenemesi(duzey),
    prisma.gunlukSoruSeti.findMany({ where: { duzey, tarih: { gte: new Date(tarih.getTime() - 30 * GUN_MS) } }, select: { soruIdler: true } }),
  ]);
  const haric = [...deneme.soruIdler, ...sonSetler.flatMap((s) => s.soruIdler)];
  const soruIdler: string[] = [];
  for (const ders of GUNLUK_DERSLER) {
    const adaylar = await prisma.denemeSoru.findMany({ where: { duzey, ders, grupId: null, id: { notIn: haric } }, select: { id: true } });
    if (adaylar.length) soruIdler.push(adaylar[Math.floor(Math.random() * adaylar.length)].id);
  }
  try {
    return await prisma.gunlukSoruSeti.create({ data: { duzey, tarih, soruIdler } });
  } catch (e) {
    // Ayni anda iki ziyaretci olusturduysa digerininki gecerli.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return prisma.gunlukSoruSeti.findUniqueOrThrow({ where: { duzey_tarih: { duzey, tarih } } });
    }
    throw e;
  }
}

/** Setin sorulari (cozumlu), setteki sirayla. */
export async function setSorulari(soruIdler: string[]) {
  const sorular = await prisma.denemeSoru.findMany({
    where: { id: { in: soruIdler } },
    select: { id: true, ders: true, soruMetni: true, secenekler: true, gorselSvg: true, grupId: true, geometri: true, dogruCevap: true, aciklama: true },
  });
  return soruIdler.flatMap((id) => sorular.filter((s) => s.id === id));
}

/** Cevaplamadan once tarayiciya giden hali: dogru cevap ve aciklama yok (devtools'tan okunamasin). */
export async function cozumsuzSetSorulari(soruIdler: string[]) {
  return (await setSorulari(soruIdler)).map((s) => ({
    id: s.id,
    ders: s.ders,
    soruMetni: s.soruMetni,
    secenekler: s.secenekler,
    gorselSvg: s.gorselSvg,
    grupId: s.grupId,
    geometri: s.geometri,
  }));
}

/** Her sorunun uyeler arasindaki dogru cevaplanma yuzdesi (gercek kayitlardan). */
async function dogruYuzdeleri(setId: string, sorular: { id: string; dogruCevap: number }[]) {
  const kayitlar = await prisma.gunlukSoruCevap.findMany({ where: { setId }, select: { cevaplar: true } });
  return Object.fromEntries(
    sorular.map((s) => {
      const dogru = kayitlar.filter((k) => (k.cevaplar as Record<string, number>)[s.id] === s.dogruCevap).length;
      return [s.id, kayitlar.length ? Math.round((dogru / kayitlar.length) * 100) : null];
    }),
  );
}

/** Pro ayricaligi: ayda bu kadar cozulmeyen gun seriyi bozmaz (otomatik kullanilir). */
export const SERI_DONDURMA_HAKKI = 2;

/** Bu takvim ayinda kullanilan dondurma sayisi (TR gunu, UTC gece yarisi gosterimi). */
function buAyKullanilan(dondurulan: number[], bugun: number) {
  const d = new Date(bugun);
  const ayBasi = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  return dondurulan.filter((t) => t >= ayBasi).length;
}

/**
 * Pro uye bir ya da birkac gun cozmeden donerse, son etkinlik gunu ile dun arasindaki bosluk kalan aylik hakla
 * kapanabiliyorsa otomatik dondurulur (seri bozulmaz). Idempotent: ayni gun iki kez yazilmaz. Eklenen gunler doner.
 */
async function seriyiKoru(userId: string, cozulen: number[], dondurulan: number[], bugun: number): Promise<number[]> {
  const son = Math.max(...cozulen, ...dondurulan);
  if (!Number.isFinite(son)) return [];
  const eksik: number[] = [];
  for (let t = son + GUN_MS; t < bugun; t += GUN_MS) eksik.push(t);
  if (!eksik.length || eksik.length > SERI_DONDURMA_HAKKI - buAyKullanilan(dondurulan, bugun)) return [];
  await prisma.seriDondurma.createMany({ data: eksik.map((t) => ({ userId, tarih: new Date(t) })), skipDuplicates: true });
  return eksik;
}

/**
 * Ardisik gun serisi: bugun cozulmediyse dunden geriye sayilir (gun bitene kadar seri yasar). Pro uyede dondurulan
 * gunler seriyi surdurur; dondurmaKalan Pro'da bu ayki kalan hak, ucretsizde null.
 */
export async function seriDurumu(userId: string) {
  const [kayitlar, dondurmalar, uye] = await Promise.all([
    prisma.gunlukSoruCevap.findMany({ where: { userId }, orderBy: { tarih: "desc" }, select: { tarih: true }, take: 400 }),
    prisma.seriDondurma.findMany({ where: { userId }, orderBy: { tarih: "desc" }, select: { tarih: true }, take: 60 }),
    prisma.user.findUnique({ where: { id: userId }, select: { abonelikPlani: true, abonelikBitis: true } }),
  ]);
  const cozulen = kayitlar.map((k) => k.tarih.getTime());
  const bugun = bugununTarihi().getTime();
  const pro = !!uye && proAktifMi(uye);
  let dondurulan = dondurmalar.map((d) => d.tarih.getTime());
  if (pro) dondurulan = [...dondurulan, ...(await seriyiKoru(userId, cozulen, dondurulan, bugun))];
  const gunler = [...new Set([...cozulen, ...dondurulan])].sort((a, b) => b - a);
  const bugunCozuldu = cozulen[0] === bugun;
  let gun = 0;
  let beklenen = bugunCozuldu ? bugun : bugun - GUN_MS;
  for (const t of gunler) {
    if (t !== beklenen) break;
    gun++;
    beklenen -= GUN_MS;
  }
  // En uzun seri (rozet icin): ardisik gun kosulari.
  let enIyi = 0;
  let kosu = 0;
  for (let i = 0; i < gunler.length; i++) {
    kosu = i > 0 && gunler[i - 1] - gunler[i] === GUN_MS ? kosu + 1 : 1;
    enIyi = Math.max(enIyi, kosu);
  }
  return {
    gun,
    bugunCozuldu,
    enIyi,
    toplamGun: cozulen.length,
    dondurmaKalan: pro ? Math.max(0, SERI_DONDURMA_HAKKI - buAyKullanilan(dondurulan, bugun)) : null,
  };
}

export class GecersizCevapError extends Error {}

/**
 * Cevaplari degerlendirir. Uyeyse kaydeder (gunde bir kez; ikinci gonderimde ilk kayit gecerli), seriyi gunceller ve
 * seri SERI_HEDIYE_GUN'un katina ulastiysa 1 gun Pro hediye eder. Misafir sonucunu gorur, kayit/seri yok.
 */
export async function gunlukCevapla(duzey: EducationLevel, gelen: Record<string, number>, userId: string | null) {
  const set = await gununSeti(duzey);
  // Istemciden gelen anahtarlar yalniz bu setin sorulari olabilir.
  if (Object.keys(gelen).some((id) => !set.soruIdler.includes(id)) || Object.values(gelen).some((v) => !Number.isInteger(v) || v < 0 || v > 4)) {
    throw new GecersizCevapError();
  }
  const sorular = await setSorulari(set.soruIdler);
  let cevaplar = gelen;
  if (userId) {
    const tarih = set.tarih;
    const dogru = sorular.filter((s) => gelen[s.id] === s.dogruCevap).length;
    try {
      await prisma.gunlukSoruCevap.create({ data: { userId, setId: set.id, tarih, cevaplar: gelen, dogru } });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
      // Bugun zaten cozulmus (baska duzeyde ya da ikinci sekmede): ilk kayit gecerli.
      const ilk = await prisma.gunlukSoruCevap.findUniqueOrThrow({ where: { userId_tarih: { userId, tarih } } });
      if (ilk.setId === set.id) cevaplar = ilk.cevaplar as Record<string, number>;
    }
  }
  const [yuzdeler, seri] = await Promise.all([dogruYuzdeleri(set.id, sorular), userId ? seriDurumu(userId) : null]);
  let hediye = false;
  if (userId && seri && seri.gun > 0 && seri.gun % SERI_HEDIYE_GUN === 0) {
    hediye = await proHediyeEt(userId, `seri:${set.tarih.toISOString().slice(0, 10)}`, 1, `${seri.gun} günlük seri: 1 gün Pro hediye`);
  }
  return {
    sorular: sorular.map((s) => ({ ...s, secilen: cevaplar[s.id] ?? null, dogruYuzde: yuzdeler[s.id] })),
    dogru: sorular.filter((s) => cevaplar[s.id] === s.dogruCevap).length,
    seri,
    hediye,
  };
}
