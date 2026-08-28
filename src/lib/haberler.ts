import { prisma } from "@/lib/prisma";

export async function getLatestHaberler(limit = 5) {
  return prisma.haber.findMany({ orderBy: { yayinTarihi: "desc" }, take: limit });
}

export async function getAllHaberler() {
  return prisma.haber.findMany({ orderBy: { yayinTarihi: "desc" } });
}
