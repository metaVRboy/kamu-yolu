import { prisma } from "@/lib/prisma";
import type { DenemeDers, EducationLevel } from "@/generated/prisma/client";
import { dersKarnesi, konuAnalizi, type KonuDurumu } from "@/lib/kpssDenemeAnaliz";
import { DERS_SIRASI, DERS_DAGILIMI, DERS_LABEL, DUZEY_LABEL, SINAV_SURESI_DK, type ExamSoru } from "@/lib/kpssDenemeSabitler";
import { KONU_DAGILIMI } from "@/lib/kpssDenemeKonular";

/** Turkiye takvim gunu (sunucu hangi saat diliminde calisirsa calissin). */
export function bugununTarihi(): Date {
  const parcalar = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).formatToParts(new Date());
  const y = parcalar.find((p) => p.type === "year")!.value;
  const m = parcalar.find((p) => p.type === "month")!.value;
  const d = parcalar.find((p) => p.type === "day")!.value;
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}

// sonKullanim: sorunun en son ciktigi gunun zamani (hic cikmadiysa 0).
type Aday = { id: string; sira: number; grupId: string | null; konu: string | null; kalip?: string | null; sonKullanim: number };

/**
 * Sorunun kalibi: sablon kimligi ya da sayilari silinmis metin + siklar. Yalniz sayilari farkli iki soru (sablon
 * varyanti, gonderilen kalip sorulari) ayni kalip sayilir; genel kokler ("hangisinde yazim yanlisi vardir?") siklarla ayrisir.
 */
export function kalipAnahtari(s: { sablon: string | null; soruMetni: string; secenekler: string[] }) {
  return s.sablon ?? [s.soruMetni, ...s.secenekler].join("|").toLocaleLowerCase("tr").replace(/\d+([.,]\d+)?/g, "#").replace(/\s+/g, " ").trim();
}

/**
 * Adaylardan tam `adet` soru secer: ortak metinli gruplar bolunmez, en uzun suredir cikmamis olan once,
 * esitler arasinda rastgele. Ayni kaliptan iki soru (yalniz sayilari farkli) birlikte secilmez. (Eskiden kullanim SAYISINA bakiliyordu: haftalarca tekrarlanan ilk parti
 * sayaci yuksek kaldigi icin her gun ayni ikinci parti seciliyor, ardisik gunler 120 sorunun ~100'unu
 * paylasiyordu - 2026-10-19.)
 * Grup boyutlari (ör. 4'lu sozel mantik + tekil soru) tam sayiyi tutturmayabilir: oncelik
 * sirasini koruyan geri izlemeli arama tam toplami bulur; bulamazsa sigan kadarini dondurur.
 */
export function enAzKullanilanlar(adaylar: Aday[], adet: number): Aday[] {
  const birimMap = new Map<string, Aday[]>();
  for (const a of adaylar) birimMap.set(a.grupId ?? a.id, [...(birimMap.get(a.grupId ?? a.id) ?? []), a]);
  const birimler = [...birimMap.values()]
    .map((b) => ({ b, kullanim: Math.max(...b.map((x) => x.sonKullanim)), r: Math.random() }))
    .sort((x, y) => x.kullanim - y.kullanim || x.r - y.r)
    .map((x) => x.b);
  const secim: Aday[][] = [];
  const kaliplar = new Set<string>();
  let adim = 0;
  const ara = (i: number, kalan: number): boolean => {
    if (kalan === 0) return true;
    for (let j = i; j < birimler.length && adim++ < 20_000; j++) {
      const kalip = birimler[j][0].kalip;
      if (birimler[j].length > kalan || (kalip && kaliplar.has(kalip))) continue;
      secim.push(birimler[j]);
      if (kalip) kaliplar.add(kalip);
      if (ara(j + 1, kalan - birimler[j].length)) return true;
      secim.pop();
      if (kalip) kaliplar.delete(kalip);
    }
    return false;
  };
  if (ara(0, adet)) return secim.flat();
  const secilen: Aday[] = [];
  for (const b of birimler) if (secilen.length + b.length <= adet) secilen.push(...b);
  return secilen;
}

/**
 * Bugunun (Turkiye gunu) sinavini dondurur; yoksa havuzdan olusturulur: her ders icin
 * KONU_DAGILIMI'ndaki sayilarla konu konu en uzun suredir cikmamis sorular secilir (gecmis gunluk
 * denemelerden), kullanimSayisi istatistik icin artirilir. Sonuc TUM kullanicilar icin ayni soru seti olur.
 */
export async function getBugununDenemesi(duzey: EducationLevel) {
  const tarih = bugununTarihi();

  const mevcut = await prisma.gunlukDeneme.findUnique({ where: { duzey_tarih: { duzey, tarih } } });
  if (mevcut) return mevcut;

  const dagilim = KONU_DAGILIMI[duzey as keyof typeof KONU_DAGILIMI];
  if (!dagilim) throw new Error(`${DUZEY_LABEL[duzey]} icin deneme yok.`);
  // Sorularin en son ciktigi gun: bu duzeyin gecmis gunluk denemeleri (eskiden yeniye, yeni ustune yazar).
  const gecmis = await prisma.gunlukDeneme.findMany({ where: { duzey, tarih: { lt: tarih } }, orderBy: { tarih: "asc" }, select: { tarih: true, soruIdler: true } });
  const sonKullanim = new Map<string, number>();
  for (const g of gecmis) for (const id of g.soruIdler) sonKullanim.set(id, g.tarih.getTime());
  const soruIdler: string[] = [];
  for (const ders of DERS_SIRASI) {
    const ham = (
      await prisma.denemeSoru.findMany({
        where: { duzey, ders },
        select: { id: true, sira: true, grupId: true, konu: true, sablon: true, soruMetni: true, secenekler: true },
      })
    ).map(({ id, sira, grupId, konu, ...m }) => ({ id, sira, grupId, konu, kalip: kalipAnahtari(m) }));
    // Bir kaliptan herhangi bir soru yakinda ciktiysa kaliptaki her soru o kadar yeni sayilir (dunku sorunun
    // sayilari degismis hali bugun gelmesin).
    const kalipSon = new Map<string, number>();
    for (const a of ham) kalipSon.set(a.kalip, Math.max(kalipSon.get(a.kalip) ?? 0, sonKullanim.get(a.id) ?? 0));
    const adaylar = ham.map((a) => ({ ...a, sonKullanim: kalipSon.get(a.kalip)! }));
    const secilen = dagilim[ders].flatMap(([konu, adet]) => enAzKullanilanlar(adaylar.filter((a) => a.konu === konu), adet));
    // Bir konunun havuzu eksikse ders yine tam sayida olsun: dersin kalan en az kullanilanlariyla tamamlanir.
    const eksik = DERS_DAGILIMI[ders] - secilen.length;
    if (eksik > 0) {
      const secilmis = new Set(secilen.map((s) => s.id));
      secilen.push(...enAzKullanilanlar(adaylar.filter((a) => !secilmis.has(a.id)), eksik));
    }
    if (secilen.length < DERS_DAGILIMI[ders]) {
      throw new Error(`${DUZEY_LABEL[duzey]} / ${DERS_LABEL[ders]} icin havuzda yeterli soru yok (${secilen.length}/${DERS_DAGILIMI[ders]}).`);
    }
    // Gercek kitapciktaki gibi: konu sirasi (ör. geometri en sonda), ortak metinli sorular bir arada, sonra yazim sirasi.
    const konuSirasi = (k: string | null) => {
      const i = dagilim[ders].findIndex(([x]) => x === k);
      return i < 0 ? dagilim[ders].length : i;
    };
    const grupSirasi = new Map<string, number>();
    for (const s of secilen) if (s.grupId) grupSirasi.set(s.grupId, Math.min(grupSirasi.get(s.grupId) ?? Infinity, s.sira));
    const birimSirasi = (s: Aday) => (s.grupId ? grupSirasi.get(s.grupId)! : s.sira);
    secilen.sort((a, b) => konuSirasi(a.konu) - konuSirasi(b.konu) || birimSirasi(a) - birimSirasi(b) || a.sira - b.sira);
    soruIdler.push(...secilen.map((s) => s.id));
  }

  await prisma.denemeSoru.updateMany({
    where: { id: { in: soruIdler } },
    data: { kullanimSayisi: { increment: 1 } },
  });

  // Ayni (duzey, tarih) icin yarisirsa (iki istek ayni anda) unique constraint
  // ikincisini reddeder - o durumda zaten olusmus satiri okuyup donuyoruz.
  try {
    return await prisma.gunlukDeneme.create({ data: { duzey, tarih, soruIdler } });
  } catch {
    const olusmus = await prisma.gunlukDeneme.findUnique({ where: { duzey_tarih: { duzey, tarih } } });
    if (!olusmus) throw new Error("Gunluk deneme olusturulamadi.");
    return olusmus;
  }
}

export async function getDenemeSorulari(soruIdler: string[]) {
  const sorular = await prisma.denemeSoru.findMany({ where: { id: { in: soruIdler } } });
  const byId = new Map(sorular.map((s) => [s.id, s]));
  return soruIdler.map((id) => byId.get(id)!).filter(Boolean);
}

/** Sinav SÜRERKEN istemciye gonderilecek "guvenli" soru listesi - dogru
 * cevap ve aciklama ASLA buna dahil edilmez (RSC payload'ini inceleyerek
 * kopya cekmeyi onlemek icin). */
export function sinavaGuvenliHaleGetir(sorular: ExamSoru[]): ExamSoru[] {
  return sorular.map(({ id, ders, soruMetni, grupId, geometri, gorselSvg, secenekler }) => ({
    id,
    ders,
    soruMetni,
    grupId,
    geometri,
    gorselSvg,
    secenekler,
  }));
}

/** Kullanicinin bu gunluk deneme icin kaydi var mi (olusturmadan sadece okur). */
export async function getKatilim(userId: string, gunlukDenemeId: string) {
  return prisma.denemeKatilim.findUnique({ where: { userId_gunlukDenemeId: { userId, gunlukDenemeId } } });
}

type Plan = "UCRETSIZ" | "PRO" | "PRO_PLUS";

/** Plan basina haftalik deneme hakki (tum duzeyler toplam); null = her duzeyde her gun. */
export const HAFTALIK_DENEME_HAKKI: Record<Plan, number | null> = { UCRETSIZ: 1, PRO: 3, PRO_PLUS: null };

/** Bu haftanin pazartesisi, GunlukDeneme.tarih ile ayni bicimde (Istanbul gunu, UTC gece yarisi). */
function haftaBasi(): Date {
  const bugun = bugununTarihi();
  return new Date(bugun.getTime() - ((bugun.getUTCDay() + 6) % 7) * 86_400_000);
}

// Sayim denemenin kendi tarihine gore: uygulama ve veritabani saatleri karsilastirilmaz.
const buHaftakiKatilimlar = (userId: string) => ({ userId, gunlukDeneme: { tarih: { gte: haftaBasi() } } });

/** Kullanicinin bu haftaki deneme hakki; sinirsiz planda limit null. */
export async function haftalikHak(userId: string, plan: Plan) {
  const limit = HAFTALIK_DENEME_HAKKI[plan];
  const kullanilan = limit === null ? 0 : await prisma.denemeKatilim.count({ where: buHaftakiKatilimlar(userId) });
  return { limit, kullanilan, doldu: limit !== null && kullanilan >= limit };
}

/** Bu hafta (pazartesiden beri) tum kullanicilarin baslattigi deneme sayisi - yukseltme penceresindeki gercek sayi. */
export function buHaftakiDenemeSayisi() {
  return prisma.denemeKatilim.count({ where: { gunlukDeneme: { tarih: { gte: haftaBasi() } } } });
}

export class DenemeHakkiDolduError extends Error {}

/**
 * "Sınava Başla" tiklanince cagrilir - kaydi olusturur (sinav saati o an baslar).
 * Ayni gunun suren denemesine donmek hak harcamaz; yeni deneme haftalik hakka tabidir.
 */
export async function girisVeyaDevamEt(userId: string, plan: Plan, gunlukDenemeId: string) {
  return prisma.$transaction(async (tx) => {
    // Ayni kullanicinin es zamanli baslatmalari sirayla islenir; yoksa iki farkli
    // duzeyi ayni anda baslatip haftalik hakki asabilir.
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${userId}))`;
    const mevcut = await tx.denemeKatilim.findUnique({ where: { userId_gunlukDenemeId: { userId, gunlukDenemeId } } });
    if (mevcut) return mevcut;
    const limit = HAFTALIK_DENEME_HAKKI[plan];
    if (limit !== null && (await tx.denemeKatilim.count({ where: buHaftakiKatilimlar(userId) })) >= limit) {
      throw new DenemeHakkiDolduError("Bu haftaki deneme hakkını kullandın.");
    }
    return tx.denemeKatilim.create({ data: { userId, gunlukDenemeId } });
  });
}

/** Sunucu saatine gore sinavin kalan suresi (ms); <= 0 ise sure dolmustur. */
export function kalanSureMs(baslangicZamani: Date): number {
  return baslangicZamani.getTime() + SINAV_SURESI_DK * 60_000 - Date.now();
}

export async function cevapKaydet(katilimId: string, userId: string, soruId: string, secenekIndex: number) {
  const katilim = await prisma.denemeKatilim.findUnique({
    where: { id: katilimId },
    include: { gunlukDeneme: { select: { soruIdler: true } } },
  });
  // soruId istemciden gelir - gunun sorusu degilse yazilmaz, yoksa cevaplar
  // JSON'u keyfi anahtarlarla sinirsiz sisirilebilir.
  if (!katilim || katilim.userId !== userId || !katilim.gunlukDeneme.soruIdler.includes(soruId)) {
    throw new Error("UNAUTHORIZED");
  }
  if (katilim.bitisZamani || kalanSureMs(katilim.baslangicZamani) <= 0) {
    throw new Error("SINAV_BITTI");
  }
  // Oku-degistir-yaz DEGIL, tek atomik jsonb birlestirme: art arda hizli
  // cevaplarda es zamanli iki istek birbirinin uzerine yazip cevap kaybettiriyordu.
  await prisma.$executeRaw`UPDATE "DenemeKatilim" SET cevaplar = cevaplar || jsonb_build_object(${soruId}::text, ${secenekIndex}::int) WHERE id = ${katilimId}`;
}

function sonucuHesapla(cevaplar: Record<string, number>, sorular: { id: string; dogruCevap: number }[]) {
  let dogru = 0;
  let yanlis = 0;
  for (const s of sorular) {
    const verilen = cevaplar[s.id];
    if (verilen === undefined) continue;
    if (verilen === s.dogruCevap) dogru++;
    else yanlis++;
  }
  const bos = sorular.length - dogru - yanlis;
  const net = dogru - yanlis / 4;
  // Resmi ÖSYM "P puani" aday havuzunun istatistiksel (ortalama/std sapma)
  // dagilimina dayanir - bizde o havuz olmadigi icin burada SADECE net'in
  // 100 uzerinden basit bir olcegi hesaplaniyor; resmi puan DEGILDIR.
  const puan = Math.max(0, Math.round((net / sorular.length) * 10000) / 100);
  return { dogruSayisi: dogru, yanlisSayisi: yanlis, bosSayisi: bos, puan };
}

/** Sinavi bitirir (butonla veya sure dolunca) ve sonucu hesaplayip kaydeder. */
export async function denemeyiBitir(katilimId: string, userId: string) {
  const katilim = await prisma.denemeKatilim.findUnique({
    where: { id: katilimId },
    include: { gunlukDeneme: true },
  });
  if (!katilim || katilim.userId !== userId) throw new Error("UNAUTHORIZED");
  if (katilim.bitisZamani) return katilim;

  const sorular = await prisma.denemeSoru.findMany({
    where: { id: { in: katilim.gunlukDeneme.soruIdler } },
    select: { id: true, dogruCevap: true },
  });

  return prisma.denemeKatilim.update({
    where: { id: katilimId },
    data: { bitisZamani: new Date(), ...sonucuHesapla(katilim.cevaplar as Record<string, number>, sorular) },
  });
}

/**
 * Admin bir sorunun dogru cevabini duzeltince, o soruyu iceren bitmis denemeler
 * yeni cevap anahtariyla yeniden puanlanir (aksi halde eski net/puan yanlis kalir).
 */
export async function katilimlariYenidenPuanla(soruId: string) {
  const denemeler = await prisma.gunlukDeneme.findMany({
    where: { soruIdler: { has: soruId } },
    select: { soruIdler: true, katilimlar: { where: { bitisZamani: { not: null } }, select: { id: true, cevaplar: true } } },
  });
  let sayi = 0;
  for (const d of denemeler) {
    if (d.katilimlar.length === 0) continue;
    const sorular = await prisma.denemeSoru.findMany({ where: { id: { in: d.soruIdler } }, select: { id: true, dogruCevap: true } });
    await prisma.$transaction(
      d.katilimlar.map((k) => prisma.denemeKatilim.update({ where: { id: k.id }, data: sonucuHesapla(k.cevaplar as Record<string, number>, sorular) })),
    );
    sayi += d.katilimlar.length;
  }
  return sayi;
}

/** Bitmis denemelerde bir sorunun sik dagilimi: [A..E sayilari], bos sayisi. */
export async function soruSikDagilimi(soruId: string) {
  const katilimlar = await prisma.denemeKatilim.findMany({
    where: { bitisZamani: { not: null }, gunlukDeneme: { soruIdler: { has: soruId } } },
    select: { cevaplar: true },
  });
  const siklar = [0, 0, 0, 0, 0];
  let bos = 0;
  for (const k of katilimlar) {
    const c = (k.cevaplar as Record<string, number>)[soruId];
    if (c === undefined) bos++;
    else siklar[c]++;
  }
  return { siklar, bos, toplam: katilimlar.length };
}

/**
 * Sinav sonu "gecen denemene gore" karsilastirmasi: ayni duzeyde bitirilmis bir
 * onceki deneme varsa net/puan ve ders netleri ile konu durumlari doner.
 */
export async function oncekiDenemeOzeti(userId: string, duzey: EducationLevel, haricKatilimId: string) {
  const onceki = await prisma.denemeKatilim.findFirst({
    where: { userId, id: { not: haricKatilimId }, bitisZamani: { not: null }, gunlukDeneme: { duzey } },
    orderBy: { bitisZamani: "desc" },
    include: { gunlukDeneme: { select: { tarih: true, soruIdler: true } } },
  });
  if (!onceki) return null;
  const sorular = await prisma.denemeSoru.findMany({
    where: { id: { in: onceki.gunlukDeneme.soruIdler } },
    select: { id: true, ders: true, konu: true, dogruCevap: true },
  });
  const cevaplar = onceki.cevaplar as Record<string, number>;
  return {
    tarih: onceki.gunlukDeneme.tarih,
    net: (onceki.dogruSayisi ?? 0) - (onceki.yanlisSayisi ?? 0) / 4,
    puan: onceki.puan ?? 0,
    dersNetleri: Object.fromEntries(dersKarnesi(sorular, cevaplar).map((d) => [d.ders, d.net])) as Partial<Record<DenemeDers, number>>,
    konuDurumlari: Object.fromEntries(konuAnalizi(sorular, cevaplar).map((k) => [`${k.ders}|${k.konu}`, k.durum])) as Record<string, KonuDurumu>,
  };
}

export type OncekiDenemeOzeti = NonNullable<Awaited<ReturnType<typeof oncekiDenemeOzeti>>>;

/** Deneme ana sayfasindaki "Son denemelerin" listesi (bitirilmis olanlar, en yeni once). */
export async function sonDenemeler(userId: string, adet = 5) {
  const katilimlar = await prisma.denemeKatilim.findMany({
    where: { userId, bitisZamani: { not: null } },
    orderBy: { bitisZamani: "desc" },
    take: adet,
    include: { gunlukDeneme: { select: { duzey: true, tarih: true } } },
  });
  return katilimlar.map((k) => ({
    id: k.id,
    duzey: k.gunlukDeneme.duzey,
    tarih: k.gunlukDeneme.tarih,
    dogru: k.dogruSayisi ?? 0,
    yanlis: k.yanlisSayisi ?? 0,
    bos: k.bosSayisi ?? 0,
    net: (k.dogruSayisi ?? 0) - (k.yanlisSayisi ?? 0) / 4,
    puan: k.puan ?? 0,
  }));
}

/** Ana sayfadaki duzey kartlari: kullanicinin bugunku denemesi durumu (yok / suruyor / bitti + puan). */
export async function bugunkuDurumlar(userId: string) {
  const katilimlar = await prisma.denemeKatilim.findMany({
    where: { userId, gunlukDeneme: { tarih: bugununTarihi() } },
    select: { bitisZamani: true, baslangicZamani: true, puan: true, dogruSayisi: true, yanlisSayisi: true, gunlukDeneme: { select: { duzey: true } } },
  });
  return new Map(
    katilimlar.map((k) => [
      k.gunlukDeneme.duzey,
      k.bitisZamani || kalanSureMs(k.baslangicZamani) <= 0
        ? { durum: "bitti" as const, puan: k.puan, net: (k.dogruSayisi ?? 0) - (k.yanlisSayisi ?? 0) / 4 }
        : { durum: "suruyor" as const },
    ]),
  );
}
