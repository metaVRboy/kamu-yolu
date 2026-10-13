import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { proAktifMi, sessizSaatMi, smsGonder, sonSmsSayisi } from "@/lib/sms";
import { createBildirim } from "@/lib/notifications";

export async function createTalep(
  userId: string,
  data: {
    meslek: string;
    kurumTuru?: string | null;
    mevcutIl: string;
    mevcutIlce?: string | null;
    istenenIller: string[];
    aciklama?: string | null;
  },
) {
  return prisma.becayisTalep.create({
    data: {
      userId,
      meslek: data.meslek,
      kurumTuru: data.kurumTuru || null,
      mevcutIl: data.mevcutIl,
      mevcutIlce: data.mevcutIlce || null,
      istenenIller: data.istenenIller,
      aciklama: data.aciklama || null,
    },
  });
}

/**
 * Herkese acik becayis sayfalarinda ad kisaltilir ("Emirhan K."): ad + meslek + il bir kamu
 * calisanini tanimlar ve sayfa arama motorlarinda acik (KVKK m.4 veri minimizasyonu).
 */
export const kisaAd = (adSoyad: string) => {
  const [ad, ...digerleri] = adSoyad.trim().split(/\s+/);
  const soyad = digerleri.at(-1);
  return soyad ? `${ad} ${soyad.charAt(0).toLocaleUpperCase("tr-TR")}.` : ad;
};

export async function getAktifTalepler(filters?: { il?: string; meslek?: string }) {
  const talepler = await prisma.becayisTalep.findMany({
    where: {
      isActive: true,
      ...(filters?.il ? { mevcutIl: filters.il } : {}),
      ...(filters?.meslek ? { meslek: { contains: filters.meslek, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { adSoyad: true } } },
    // ponytail: ust sinir; ilan sayisi buna yaklasirsa sayfalama eklenir.
    take: 300,
  });
  return talepler.map((t) => ({ ...t, user: { adSoyad: kisaAd(t.user.adSoyad) } }));
}

export async function getTalepDetay(id: string) {
  const talep = await prisma.becayisTalep.findUnique({
    where: { id },
    include: { user: { select: { id: true, adSoyad: true } } },
  });
  return talep && { ...talep, user: { ...talep.user, adSoyad: kisaAd(talep.user.adSoyad) } };
}

export async function getTaleplerim(userId: string) {
  const talepler = await prisma.becayisTalep.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      mesajlar: {
        orderBy: { createdAt: "asc" },
        include: { gonderen: { select: { id: true, adSoyad: true } } },
      },
    },
  });

  return talepler.map((talep) => {
    const threadMap = new Map<string, typeof talep.mesajlar>();
    for (const m of talep.mesajlar) {
      const arr = threadMap.get(m.konusmaKarsiId) ?? [];
      arr.push(m);
      threadMap.set(m.konusmaKarsiId, arr);
    }
    const threads = Array.from(threadMap.entries()).map(([karsiId, mesajlar]) => ({
      karsiId,
      karsiAdSoyad:
        // Karsi taraf ilk mesaji hep kendisi atar; bulunamiyorsa hesabini silmistir.
        mesajlar.find((m) => m.gonderenId === karsiId)?.gonderen?.adSoyad ?? "Silinmiş kullanıcı",
      mesajlar,
      okunmamisSayisi: mesajlar.filter((m) => !m.okundu && m.gonderenId !== userId).length,
    }));
    return { ...talep, threads };
  });
}

export async function getOkunmamisMesajSayisi(userId: string): Promise<number> {
  return prisma.becayisMesaj.count({
    where: {
      okundu: false,
      gonderenId: { not: userId },
      talep: { userId },
    },
  });
}

// Kullanicinin BASKASININ talebine mesaj gonderdigi (ilgilendigi) ilanlar:
// konusmaKarsiId her zaman ilgilenen tarafin id'sini tuttugu icin, bu
// alanda kendi id'si gecen ama sahibi olmadigi talepleri bulmak yeterli.
export async function getIlgilendiklerim(userId: string) {
  const mesajlar = await prisma.becayisMesaj.findMany({
    where: { konusmaKarsiId: userId },
    orderBy: { createdAt: "asc" },
    // Istemciye giden veri: yalniz gereken alanlar (tum talep satiri ve kullanici id'leri degil).
    select: {
      id: true,
      talepId: true,
      gonderenId: true,
      mesaj: true,
      createdAt: true,
      okundu: true,
      sikayetEdildi: true,
      talep: { select: { id: true, userId: true, meslek: true, mevcutIl: true, mevcutIlce: true, istenenIller: true, isActive: true, user: { select: { adSoyad: true } } } },
    },
  });

  const talepMap = new Map<string, { talep: (typeof mesajlar)[number]["talep"]; mesajlar: typeof mesajlar }>();
  for (const m of mesajlar) {
    if (m.talep.userId === userId) continue;
    const entry = talepMap.get(m.talepId);
    if (entry) entry.mesajlar.push(m);
    else talepMap.set(m.talepId, { talep: m.talep, mesajlar: [m] });
  }

  return Array.from(talepMap.values())
    .map(({ talep, mesajlar: talepMesajlari }) => ({
      id: talep.id,
      meslek: talep.meslek,
      mevcutIl: talep.mevcutIl,
      mevcutIlce: talep.mevcutIlce,
      istenenIller: talep.istenenIller,
      isActive: talep.isActive,
      ilanSahibiAdSoyad: talep.user.adSoyad,
      mesajlar: talepMesajlari.map(({ id, gonderenId, mesaj, createdAt, okundu, sikayetEdildi }) => ({ id, gonderenId, mesaj, createdAt, okundu, sikayetEdildi })),
      okunmamisSayisi: talepMesajlari.filter((m) => !m.okundu && m.gonderenId !== userId).length,
      sonMesajTarihi: talepMesajlari[talepMesajlari.length - 1].createdAt,
    }))
    .sort((a, b) => b.sonMesajTarihi.getTime() - a.sonMesajTarihi.getTime());
}

export async function getOkunmamisIlgilendiklerimSayisi(userId: string): Promise<number> {
  return prisma.becayisMesaj.count({
    where: {
      okundu: false,
      konusmaKarsiId: userId,
      gonderenId: { not: userId },
      talep: { userId: { not: userId } },
    },
  });
}

export async function sendMesaj(params: {
  talepId: string;
  gonderenId: string;
  konusmaKarsiId: string;
  mesaj: string;
}) {
  const talep = await prisma.becayisTalep.findUnique({ where: { id: params.talepId } });
  if (!talep) throw new Error("Talep bulunamadı.");

  const created = await prisma.becayisMesaj.create({ data: params });

  // Bildirim, mesaji ALAN tarafa gider: eger gonderen talep sahibiyse
  // karsi taraf (konusmaKarsiId) alici olur, degilse talep sahibi alici olur.
  const aliciId = params.gonderenId === talep.userId ? params.konusmaKarsiId : talep.userId;
  // Link, alicinin bu talepteki rolune gore degisir: talep sahibi icin
  // konusma "Mevcut Taleplerim"de, ilgilenen taraf icin "İlgilendiğim
  // İlanlar"da yer alir - aksi halde alici kendi konusmasini bulamaz.
  const link = aliciId === talep.userId ? "/becayis/taleplerim" : "/becayis/ilgilendiklerim";
  // Kisisel bildirimler Pro ozelligi; ucretsiz alici mesaji Taleplerim'de gorur.
  const alici = await prisma.user.findUnique({ where: { id: aliciId }, select: { abonelikPlani: true, abonelikBitis: true } });
  if (alici && proAktifMi(alici)) {
    await createBildirim({
      userId: aliciId,
      tur: "BECAYIS_MESAJ",
      baslik: "Yeni becayiş mesajınız var",
      icerik: params.mesaj.slice(0, 120),
      link,
    });
  }
  // Yanit bekletilmesin diye SMS yanit gonderildikten sonra denenir.
  after(() => becayisSmsGonder(aliciId));

  return created;
}

export async function markThreadOkundu(talepId: string, karsiId: string, forUserId: string) {
  await prisma.becayisMesaj.updateMany({
    // Yalniz sohbetin taraflari (ilgilenen ya da talep sahibi) okundu yapabilir.
    where: { talepId, konusmaKarsiId: karsiId, gonderenId: { not: forUserId }, okundu: false, OR: [{ konusmaKarsiId: forUserId }, { talep: { userId: forUserId } }] },
    data: { okundu: true },
  });
}

/** Admin incelemesini bekleyen sikayetli mesaj: taraflar silemez (delil kaybolmasin). */
const BEKLEYEN_SIKAYET = { sikayetEdildi: { not: null }, sikayetIncelendi: null };

// konusmaKarsiId verilirse sadece o sohbet, verilmezse talebe ait tum sohbetler silinir.
export async function deleteMesajlar(talepId: string, konusmaKarsiId?: string) {
  await prisma.becayisMesaj.deleteMany({
    where: { talepId, ...(konusmaKarsiId ? { konusmaKarsiId } : {}), NOT: BEKLEYEN_SIKAYET },
  });
}

/** Incelenmemis sikayet varsa talep silinmez (mesajlar cascade ile giderdi), yayindan kaldirilir. */
export async function deleteTalep(talepId: string, userId: string) {
  const sikayetli = await prisma.becayisMesaj.count({ where: { talepId, ...BEKLEYEN_SIKAYET } });
  if (sikayetli) await prisma.becayisTalep.updateMany({ where: { id: talepId, userId }, data: { isActive: false } });
  else await prisma.becayisTalep.deleteMany({ where: { id: talepId, userId } });
}

const BECAYIS_SMS_ARALIGI_MS = 30 * 60 * 1000;

/**
 * Pro + telefonu dogrulanmis + becayis SMS'ini acmis aliciya kisa bildirim.
 * Gece (21-09) ve son 30 dk icinde zaten SMS gittiyse atlanir - site ici bildirim yine durur.
 */
async function becayisSmsGonder(aliciId: string) {
  const alici = await prisma.user.findUnique({
    where: { id: aliciId },
    select: { abonelikPlani: true, abonelikBitis: true, telefon: true, telefonDogrulandi: true, smsBecayisBildirimi: true },
  });
  if (!alici?.telefon || !alici.telefonDogrulandi || !alici.smsBecayisBildirimi || !proAktifMi(alici) || sessizSaatMi()) return;
  if (await sonSmsSayisi(aliciId, "BECAYIS", BECAYIS_SMS_ARALIGI_MS)) return;
  await smsGonder({ userId: aliciId, telefon: alici.telefon, tur: "BECAYIS", metin: "Kamu Yolu: Yeni bir becayiş mesajın var. Siteye girip yanıtlayabilirsin." });
}
