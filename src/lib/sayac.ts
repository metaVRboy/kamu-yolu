import { prisma } from "@/lib/prisma";

const ISTANBUL_GUNU = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }); // YYYY-MM-DD

/** Kisisel veri icermeyen gunluk sayaci (Istanbul gunu) bir artirir: "tanitim-gosterim", "eposta-hata". */
export async function gunlukSayacArtir(anahtar: string) {
  const gun = new Date(ISTANBUL_GUNU.format(new Date()));
  await prisma.gunlukSayac.upsert({
    where: { anahtar_gun: { anahtar, gun } },
    create: { anahtar, gun, adet: 1 },
    update: { adet: { increment: 1 } },
  });
}
