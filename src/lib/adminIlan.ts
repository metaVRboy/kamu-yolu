import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/** Admin ilan formu (duzenleme ve elle ekleme ortak). */
export const ilanFormSchema = z.object({
  title: z.string().trim().min(3).max(300),
  institutionName: z.string().trim().min(2).max(200),
  institutionType: z.enum(["BAKANLIK", "UNIVERSITE", "HASTANE", "BELEDIYE", "MUZE", "KIT", "DIGER"]),
  // "YYYY-MM-DD" (Istanbul gunu sonu) ya da bos
  applicationEnd: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  educationLevels: z.array(z.enum(["LISE", "ONLISANS", "LISANS", "YUKSEK_LISANS", "ILKOGRETIM"])).min(1, "En az bir öğrenim düzeyi seç."),
  isDepartmentRestricted: z.boolean(),
  departmentIds: z.array(z.string().min(1)).max(200),
});

export const sonGun = (g: string | null) => (g ? new Date(`${g}T23:59:59+03:00`) : null);

/** Ilan degisince tum herkese acik listeler/ilan sayfalari yenilensin (admin islemleri seyrek). */
export function ilanSayfalariniYenile() {
  revalidatePath("/", "layout");
}

const GUN_MS = 86_400_000;

/**
 * Son 7 gunde calisan her tarama kaynaginin son BASARILI taramasi. Tek tek basarisiz denemeler
 * alarm degil (Kariyer Kapisi Vercel'den hep zaman asimina ugrar, asil taramayi yerel gorev yapar);
 * alarm = 24 saattir hic basarili tarama yok.
 */
export async function taramaKaynaklari(simdi = Date.now()) {
  const [kaynaklar, basarili] = await Promise.all([
    prisma.scrapeRun.findMany({ where: { startedAt: { gte: new Date(simdi - 7 * GUN_MS) } }, distinct: ["sourceName"], select: { sourceName: true } }),
    prisma.scrapeRun.findMany({ where: { status: "SUCCESS" }, orderBy: { startedAt: "desc" }, distinct: ["sourceName"], select: { sourceName: true, finishedAt: true, postingsFound: true } }),
  ]);
  return kaynaklar.map(({ sourceName }) => {
    const son = basarili.find((b) => b.sourceName === sourceName);
    const sonBasari = son?.finishedAt ?? null;
    return { sourceName, sonBasari, ilanSayisi: son?.postingsFound ?? null, gecikti: !sonBasari || simdi - sonBasari.getTime() > GUN_MS };
  });
}
