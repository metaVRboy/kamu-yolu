import { z } from "zod";
import { anthropic } from "@/lib/anthropic";

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
(gerekirse web aramasi kullan). Ardindan SADECE asagidaki JSON semasina uyan
TEK bir JSON nesnesiyle cevap ver - baska hicbir aciklama, yorum veya metin
ekleme, sadece JSON:

{"isRealField": boolean, "canonicalName": string|null, "level": "ILKOGRETIM"|"LISE"|"ONLISANS"|"LISANS"|"YUKSEK_LISANS"|null, "aliases": string[]}

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
    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: RESEARCH_SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
          max_uses: 2,
          allowed_callers: ["direct"],
        },
      ],
      messages: [
        {
          role: "user",
          content: `"${query}" ifadesini araştır ve JSON ile cevap ver.`,
        },
      ],
    });

    let text = "";
    for (const block of res.content) {
      if (block.type === "text") text += block.text;
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const result = ResearchSchema.safeParse(JSON.parse(jsonMatch[0]));
    return result.success ? result.data : null;
  } catch (err) {
    console.error("Bölüm araştırması başarısız:", err);
    return null;
  }
}
