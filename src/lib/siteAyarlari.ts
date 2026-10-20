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
  // KPSS geri sayimi: OSYM takvimindeki sinav adi ve gunu (YYYY-MM-DD). Bos ya da gecmisse sayac gizli.
  kpssSinavAdi: z.string().trim().max(80).nullable(),
  kpssSinavTarihi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-AA-GG olmalı.").nullable(),
});
export type SiteAyarlari = z.infer<typeof siteAyarlariSchema>;

const VARSAYILAN: SiteAyarlari = { bakimModu: false, bakimMesaji: null, seritMetni: null, seritLink: null, seritTur: "bilgi", kpssSinavAdi: null, kpssSinavTarihi: null };

// Her sayfada okunur: 5 dk onbellek, admin degistirince aninda dusurulur.
const oku = unstable_cache(
  () => prisma.siteAyarlari.findUnique({ where: { id: 1 }, select: { bakimModu: true, bakimMesaji: true, seritMetni: true, seritLink: true, seritTur: true, kpssSinavAdi: true, kpssSinavTarihi: true } }),
  ["site-ayarlari"],
  { tags: ["site-ayarlari"], revalidate: 300 },
);

export async function getSiteAyarlari(): Promise<SiteAyarlari> {
  const a = await oku();
  // unstable_cache JSON saklar: tarih metin olarak doner.
  return a ? { ...a, kpssSinavTarihi: a.kpssSinavTarihi ? new Date(a.kpssSinavTarihi).toISOString().slice(0, 10) : null, seritTur: SERIT_TURLERI.includes(a.seritTur as never) ? (a.seritTur as SiteAyarlari["seritTur"]) : "bilgi" } : VARSAYILAN;
}

/** KPSS'ye kalan gun (Turkiye takvim gunuyle); tarih yoksa ya da gecmisse null. */
export function kpssKalanGun(a: SiteAyarlari, bugun: Date): number | null {
  if (!a.kpssSinavTarihi) return null;
  const gun = Math.round((new Date(`${a.kpssSinavTarihi}T00:00:00.000Z`).getTime() - bugun.getTime()) / 86_400_000);
  return gun >= 0 ? gun : null;
}

export async function siteAyarlariniKaydet(a: SiteAyarlari) {
  const veri = {
    ...a,
    bakimMesaji: a.bakimMesaji || null,
    seritMetni: a.seritMetni || null,
    seritLink: a.seritLink || null,
    kpssSinavAdi: a.kpssSinavAdi || null,
    // Takvim gunu: UTC gece yarisi (bugununTarihi ile ayni gosterim; geri okununca gun kaymaz).
    kpssSinavTarihi: a.kpssSinavTarihi ? new Date(`${a.kpssSinavTarihi}T00:00:00.000Z`) : null,
  };
  await prisma.siteAyarlari.upsert({ where: { id: 1 }, create: { id: 1, ...veri }, update: veri });
  revalidateTag("site-ayarlari", { expire: 0 });
  revalidatePath("/", "layout");
}
