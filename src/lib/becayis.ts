import { prisma } from "@/lib/prisma";
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

export async function getAktifTalepler(filters?: { il?: string; meslek?: string }) {
  return prisma.becayisTalep.findMany({
    where: {
      isActive: true,
      ...(filters?.il ? { mevcutIl: filters.il } : {}),
      ...(filters?.meslek ? { meslek: { contains: filters.meslek, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { adSoyad: true } } },
  });
}

export async function getTalepDetay(id: string) {
  return prisma.becayisTalep.findUnique({
    where: { id },
    include: { user: { select: { id: true, adSoyad: true } } },
  });
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
        mesajlar.find((m) => m.gonderenId === karsiId)?.gonderen.adSoyad ?? "Kullanıcı",
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
    include: {
      gonderen: { select: { id: true, adSoyad: true } },
      talep: { include: { user: { select: { id: true, adSoyad: true } } } },
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
      mesajlar: talepMesajlari,
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
  await createBildirim({
    userId: aliciId,
    tur: "BECAYIS_MESAJ",
    baslik: "Yeni becayiş mesajınız var",
    icerik: params.mesaj.slice(0, 120),
    link,
  });

  return created;
}

export async function markThreadOkundu(talepId: string, karsiId: string, forUserId: string) {
  await prisma.becayisMesaj.updateMany({
    where: { talepId, konusmaKarsiId: karsiId, gonderenId: { not: forUserId }, okundu: false },
    data: { okundu: true },
  });
}

// konusmaKarsiId verilirse sadece o sohbet, verilmezse talebe ait tum sohbetler silinir.
export async function deleteMesajlar(talepId: string, konusmaKarsiId?: string) {
  await prisma.becayisMesaj.deleteMany({
    where: { talepId, ...(konusmaKarsiId ? { konusmaKarsiId } : {}) },
  });
}
