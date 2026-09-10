import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { toGeminiSchema, parseGeminiJson } from "@/lib/geminiSchema";

const EslesmeSchema = z.object({
  eslesenId: z.string().nullable().describe("Ayni haberi anlatan mevcut haberin id'si, yoksa null."),
});

async function ayniHaberIdBul(
  yeni: { baslik: string; ozet: string },
  mevcutlar: { id: string; baslik: string; ozet: string }[],
): Promise<string | null> {
  if (mevcutlar.length === 0) return null;
  const liste = mevcutlar.map((m) => `- id=${m.id}: "${m.baslik}" — ${m.ozet}`).join("\n");
  try {
    const res = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Yeni haber: "${yeni.baslik}" — ${yeni.ozet}\n\nMevcut haberler:\n${liste}`,
      config: {
        systemInstruction:
          "Sana yeni bulunan bir haber ile mevcut haberlerin listesi verilecek. Yeni haber, " +
          "listedekilerden biriyle (farkli kaynaktan veya farkli tarihte yazilmis/guncellenmis olsa " +
          "bile) AYNI olayi/duyuruyu anlatiyorsa o haberin id'sini don. Hicbiri ayni konu degilse " +
          "eslesenId'yi null birak.",
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(EslesmeSchema),
      },
    });
    const parsed = EslesmeSchema.safeParse(parseGeminiJson(res.text));
    if (!parsed.success || !parsed.data.eslesenId) return null;
    const gecerliMi = mevcutlar.some((m) => m.id === parsed.data.eslesenId);
    return gecerliMi ? parsed.data.eslesenId : null;
  } catch {
    return null;
  }
}

/**
 * Yeni bulunan haberleri veritabanina ekler; ayni olayi/duyuruyu anlatan
 * eski bir haber varsa (baslik/kaynak farkli olsa bile) onu silip yerine
 * yeni bulunani ekler - boylece ayni haber gunler boyu farkli kaynaklarla
 * tekrar tekrar listelenmez, hep en guncel hali kalir.
 */
export async function haberleriEkleVeTekillestir(
  adaylar: {
    baslik: string;
    ozet: string;
    kaynakUrl: string | null;
    gorselUrl: string | null;
    gorselLogoMu: boolean;
    departmentIds: string[];
  }[],
): Promise<{ eklenen: number; degistirilen: number }> {
  if (adaylar.length === 0) return { eklenen: 0, degistirilen: 0 };

  let mevcutlar = await prisma.haber.findMany({
    select: { id: true, baslik: true, ozet: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  let eklenen = 0;
  let degistirilen = 0;

  for (const { departmentIds, ...aday } of adaylar) {
    const eslesenId = await ayniHaberIdBul(aday, mevcutlar);
    if (eslesenId) {
      // Haber kaydi silindiginde iliskili HaberDepartment satirlari da
      // (onDelete: Cascade) otomatik silinir.
      await prisma.haber.delete({ where: { id: eslesenId } });
      mevcutlar = mevcutlar.filter((m) => m.id !== eslesenId);
      degistirilen++;
    } else {
      eklenen++;
    }

    const olusturulan = await prisma.haber.create({ data: aday });
    if (departmentIds.length > 0) {
      await prisma.haberDepartment.createMany({
        data: departmentIds.map((departmentId) => ({ haberId: olusturulan.id, departmentId })),
        skipDuplicates: true,
      });
    }
    mevcutlar.push({ id: olusturulan.id, baslik: aday.baslik, ozet: aday.ozet });
  }

  return { eklenen, degistirilen };
}
