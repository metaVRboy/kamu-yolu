import { z } from "zod";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { toGeminiSchema, parseGeminiJson } from "@/lib/geminiSchema";

const EDUCATION_LEVELS = [
  "ILKOGRETIM",
  "LISE",
  "ONLISANS",
  "LISANS",
  "YUKSEK_LISANS",
] as const;

const ResearchSchema = z.object({
  isRealField: z
    .boolean()
    .describe(
      "Kullanıcının bahsettiği alan Türkiye'de gerçekten var olan, tanınan bir eğitim programı/bölüm mü?",
    ),
  canonicalName: z
    .string()
    .nullable()
    .describe("Gerçekse, bu bölümün yaygın/resmi Türkçe adı."),
  level: z
    .enum(EDUCATION_LEVELS)
    .nullable()
    .describe("Bu programın öğrenim derecesi."),
  aliases: z
    .array(z.string())
    .max(4)
    .describe("Bu bölümün bilinen alternatif/eş anlamlı adları (varsa)."),
});

export type DepartmentResearch = z.infer<typeof ResearchSchema>;

const RESEARCH_SYSTEM_PROMPT = `Turkiye'deki egitim sistemi baglaminda verilen ifadeyi arastir
(gerekirse Google Search kullan).

- isRealField: ifade Turkiye'de gercekten var olan, taninan bir egitim
  programi/bolum mu (lise alani, onlisans, lisans veya yuksek lisans olabilir)?
  Uydurma/kurgusal/anlamsizsa false.
- canonicalName: gercekse yaygin/resmi Turkce adi, degilse null.
- level: gercekse ogrenim derecesi, degilse null.
- aliases: bilinen 2-4 alternatif/es anlamli yazilis (yoksa bos dizi).`;

/**
 * Veritabanimizda karsiligi olmayan bir bolum/meslek alani hakkinda internet
 * arastirmasi yapip yapilandirilmis bilgiye donusturur. Web aramasi + JSON
 * cikti tek bir cagrida istenir (ayri bir "yapilandirma" cagrisi eklenip
 * gecikmeyi ikiye katlamaktan kacinilir). Basarisiz olursa null doner.
 */
export async function researchDepartment(
  query: string,
): Promise<DepartmentResearch | null> {
  try {
    const res = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `"${query}" ifadesini araştır ve JSON ile cevap ver.`,
      config: {
        systemInstruction: RESEARCH_SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(ResearchSchema),
      },
    });

    const parsedJson = parseGeminiJson(res.text);
    if (!parsedJson) return null;

    const result = ResearchSchema.safeParse(parsedJson);
    return result.success ? result.data : null;
  } catch (err) {
    console.error("Bölüm araştırması başarısız:", err);
    return null;
  }
}
