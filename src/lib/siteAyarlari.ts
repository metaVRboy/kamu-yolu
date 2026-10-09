import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const SERIT_TURLERI = ["bilgi", "uyari", "kampanya"] as const;

export const siteAyarlariSchema = z.object({
  bakimModu: z.boolean(),
  bakimMesaji: z.string().trim().max(500).nullable(),
  seritMetni: z.string().trim().max(200).nullable(),
  // Site ici yol ya da https baglanti.
  seritLink: z
    .string()
    .trim()
    .max(300)
    .regex(/^(\/(?!\/)|https:\/\/)/, "Bağlantı / ile ya da https:// ile başlamalı.")
    .nullable(),
  seritTur: z.enum(SERIT_TURLERI),
});
export type SiteAyarlari = z.infer<typeof siteAyarlariSchema>;

const VARSAYILAN: SiteAyarlari = { bakimModu: false, bakimMesaji: null, seritMetni: null, seritLink: null, seritTur: "bilgi" };

// Her sayfada okunur: 5 dk onbellek, admin degistirince aninda dusurulur.
const oku = unstable_cache(
  () => prisma.siteAyarlari.findUnique({ where: { id: 1 }, select: { bakimModu: true, bakimMesaji: true, seritMetni: true, seritLink: true, seritTur: true } }),
  ["site-ayarlari"],
  { tags: ["site-ayarlari"], revalidate: 300 },
);

export async function getSiteAyarlari(): Promise<SiteAyarlari> {
  const a = await oku();
  return a ? { ...a, seritTur: SERIT_TURLERI.includes(a.seritTur as never) ? (a.seritTur as SiteAyarlari["seritTur"]) : "bilgi" } : VARSAYILAN;
}

export async function siteAyarlariniKaydet(a: SiteAyarlari) {
  const veri = { ...a, bakimMesaji: a.bakimMesaji || null, seritMetni: a.seritMetni || null, seritLink: a.seritLink || null };
  await prisma.siteAyarlari.upsert({ where: { id: 1 }, create: { id: 1, ...veri }, update: veri });
  revalidateTag("site-ayarlari", { expire: 0 });
  revalidatePath("/", "layout");
}
