import { prisma } from "@/lib/prisma";
import type { EducationLevel } from "@/generated/prisma/client";
import { DERS_SIRASI, DERS_DAGILIMI, DERS_LABEL, DUZEY_LABEL, SINAV_SURESI_DK, type ExamSoru } from "@/lib/kpssDenemeSabitler";

/** Turkiye takvim gunu (sunucu hangi saat diliminde calisirsa calissin). */
function bugununTarihi(): Date {
  const parcalar = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).formatToParts(new Date());
  const y = parcalar.find((p) => p.type === "year")!.value;
  const m = parcalar.find((p) => p.type === "month")!.value;
  const d = parcalar.find((p) => p.type === "day")!.value;
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}

/**
 * Bugunun (Turkiye gunu) sinavini dondurur; yoksa havuzdan orneklenerek
 * olusturulur. Ayni ders+duzey icin en az kullanilan sorular once secilir
 * (tekrar sikligini dusurmek icin), secilenlerin kullanimSayisi artirilir.
 * Sonuc TUM kullanicilar icin ayni (sabit) soru seti olur.
 */
export async function getBugununDenemesi(duzey: EducationLevel) {
  const tarih = bugununTarihi();

  const mevcut = await prisma.gunlukDeneme.findUnique({ where: { duzey_tarih: { duzey, tarih } } });
  if (mevcut) return mevcut;

  const soruIdler: string[] = [];
  for (const ders of DERS_SIRASI) {
    const adet = DERS_DAGILIMI[ders];
    // Gercek KPSS kitapciklarinda konu sirasi sabittir (ör. geometri her
    // zaman Matematik'in son sorulari) - bu yuzden havuzdan secilenler
    // RASTGELE degil, yazim sirasina (sira alanina) gore diziliyor. "En az
    // kullanilani sec" stratejisi yine kullanimSayisi'na gore calisir, o
    // sadece HANGI sorularin secilecegini belirler; sira'yi etkilemez.
    const havuz = await prisma.denemeSoru.findMany({
      where: { duzey, ders },
      orderBy: { kullanimSayisi: "asc" },
      take: adet,
      select: { id: true, sira: true },
    });
    if (havuz.length < adet) {
      throw new Error(
        `${DUZEY_LABEL[duzey]} / ${DERS_LABEL[ders]} icin havuzda yeterli soru yok (${havuz.length}/${adet}).`,
      );
    }
    const siraliIdler = [...havuz].sort((a, b) => a.sira - b.sira).map((s) => s.id);
    soruIdler.push(...siraliIdler);
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
  return sorular.map((s) => ({
    id: s.id,
    ders: s.ders,
    soruMetni: s.soruMetni,
    grupId: s.grupId,
    gorselSvg: s.gorselSvg,
    secenekler: s.secenekler,
  }));
}

/** Kullanicinin bu gunluk deneme icin kaydi var mi (olusturmadan sadece okur). */
export async function getKatilim(userId: string, gunlukDenemeId: string) {
  return prisma.denemeKatilim.findUnique({ where: { userId_gunlukDenemeId: { userId, gunlukDenemeId } } });
}

/** "Sınava Başla" tiklanince cagrilir - kaydi olusturur (sinav saati o an baslar). */
export async function girisVeyaDevamEt(userId: string, gunlukDenemeId: string) {
  return prisma.denemeKatilim.upsert({
    where: { userId_gunlukDenemeId: { userId, gunlukDenemeId } },
    update: {},
    create: { userId, gunlukDenemeId },
  });
}

export function sinavBitisZamani(baslangicZamani: Date): Date {
  return new Date(baslangicZamani.getTime() + SINAV_SURESI_DK * 60_000);
}

export function sinavSuresiDoldu(baslangicZamani: Date): boolean {
  return Date.now() >= sinavBitisZamani(baslangicZamani).getTime();
}

export async function cevapKaydet(katilimId: string, userId: string, soruId: string, secenekIndex: number | null) {
  const katilim = await prisma.denemeKatilim.findUnique({ where: { id: katilimId } });
  if (!katilim || katilim.userId !== userId) throw new Error("UNAUTHORIZED");
  if (katilim.bitisZamani || sinavSuresiDoldu(katilim.baslangicZamani)) {
    throw new Error("SINAV_BITTI");
  }
  const cevaplar = { ...(katilim.cevaplar as Record<string, number>) };
  if (secenekIndex === null) delete cevaplar[soruId];
  else cevaplar[soruId] = secenekIndex;
  await prisma.denemeKatilim.update({ where: { id: katilimId }, data: { cevaplar } });
}

export type DenemeSonucu = {
  dogruSayisi: number;
  yanlisSayisi: number;
  bosSayisi: number;
  net: number;
  puan: number;
};

function sonucuHesapla(cevaplar: Record<string, number>, sorular: { id: string; dogruCevap: number }[]): DenemeSonucu {
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
  return { dogruSayisi: dogru, yanlisSayisi: yanlis, bosSayisi: bos, net, puan };
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
  const sonuc = sonucuHesapla(katilim.cevaplar as Record<string, number>, sorular);

  return prisma.denemeKatilim.update({
    where: { id: katilimId },
    data: {
      bitisZamani: new Date(),
      dogruSayisi: sonuc.dogruSayisi,
      yanlisSayisi: sonuc.yanlisSayisi,
      bosSayisi: sonuc.bosSayisi,
      puan: sonuc.puan,
    },
  });
}
