import { z } from "zod";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { toGeminiSchema, parseGeminiJson } from "@/lib/geminiSchema";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
};

const MAX_METIN_UZUNLUGU = 6000;

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_METIN_UZUNLUGU);
}

const DogrulamaSchema = z.object({
  destekliyor: z
    .boolean()
    .describe("Sayfa icerigi, verilen haber basligi/ozetini gercekten anlatiyor/destekliyor mu?"),
});

/**
 * resolveGroundingUrl teknik olarak calisan, gercek bir sayfaya ulasabilir -
 * ama Gemini'nin grounding'i bazen tamamen alakasiz bir sayfayi kaynak
 * olarak gosterebilir (ör. bir haberi "GSB antrenor alimi" olarak ozetleyip
 * kaynak olarak GSB'nin alakasiz bir "yurt sonuclari" sayfasini vermek gibi).
 * Bu fonksiyon, sayfanin GERCEK icerigini tekrar Gemini'ye gostererek iddia
 * edilen haberi gercekten destekleyip desteklemedigini dogrular. Sayfa
 * cekilemez, bos donerse veya Gemini karar veremezse guvenli tarafta kalip
 * false doner - dogrulanamayan bir kaynak hic kullanilmamali.
 */
export async function verifyHaberKaynak(params: {
  baslik: string;
  ozet: string;
  url: string;
}): Promise<boolean> {
  let metin: string;
  try {
    const res = await fetch(params.url, {
      signal: AbortSignal.timeout(8000),
      headers: BROWSER_HEADERS,
    });
    if (!res.ok) return false;
    metin = htmlToText(await res.text());
    if (metin.length < 100) return false;
  } catch {
    return false;
  }

  try {
    const res = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Haber başlığı: "${params.baslik}"\nHaber özeti: "${params.ozet}"\n\nWeb sayfası içeriği:\n"""${metin}"""`,
      config: {
        systemInstruction:
          "Sana bir haber basligi/ozeti ve bir web sayfasinin ham metni verilecek. Bu web sayfasi icerigi, " +
          "verilen haber basligi/ozetinde anlatilan olayi/duyuruyu GERCEKTEN anlatiyor mu, yoksa tamamen " +
          "alakasiz baska bir konu mu karar ver. Sayfa icerigi konuyla ilgili degilse, cok genel/anasayfa " +
          "niteligindeyse veya bir hata/bulunamadi mesajiysa 'destekliyor: false' don.",
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(DogrulamaSchema),
      },
    });

    const parsed = DogrulamaSchema.safeParse(parseGeminiJson(res.text));
    return parsed.success && parsed.data.destekliyor;
  } catch {
    return false;
  }
}
