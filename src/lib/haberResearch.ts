import { z } from "zod";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { toGeminiSchema, parseGeminiJson } from "@/lib/geminiSchema";
import { resolveGroundingUrl } from "@/lib/resolveGroundingUrl";
import { extractOgImage } from "@/lib/extractOgImage";
import { findInstitutionImage } from "@/lib/findInstitutionImage";

const HaberSchema = z.object({
  haberler: z
    .array(
      z.object({
        baslik: z.string().describe("Haberin kısa, net başlığı (Türkçe)."),
        ozet: z
          .string()
          .describe("En fazla 1-2 kısa cümle, yalnızca arama sonucundaki gerçek bilgiye dayanan öz bir özet."),
        kaynakUrl: z
          .string()
          .describe("Bu haberin bulunduğu GERÇEK, arama sonucundan alınmış kaynak URL'si."),
        kurumAdi: z
          .string()
          .describe("Haberin ilgili olduğu kurumun/kuruluşun tam, resmi adı (ör. \"Adalet Bakanlığı\", \"Pamukkale Üniversitesi\")."),
      }),
    )
    .max(6)
    .describe("Bulunan gerçek, doğrulanabilir haberlerin listesi. Hiçbir şey bulunamadıysa boş dizi."),
});

export type HaberResearchItem = {
  baslik: string;
  ozet: string;
  kaynakUrl: string;
  gorselUrl: string | null;
  gorselLogoMu: boolean;
};

const SYSTEM_PROMPT = `Turkiye'de kamu personeli/memur alimlariyla ilgili GUNCEL (son birkac
gun icindeki, en fazla son 1 hafta) haberleri Google Search ile arastir.
Aradigin haber turleri:
- Bakanliklarin/kamu kurumlarinin acikladigi toplu personel/memur/sozlesmeli
  personel alim ilanlari veya planlari
- KPSS, kamu istihdami ile ilgili gundemdeki tartismalar/kararlar
- Kamu calisanlarini (ozellikle saglik personeli, ogretmen, memur) ilgilendiren
  sendika aciklamalari/haberleri
- Kamuda yeni kadro, atama, ozluk haklariyla ilgili resmi/gazete haberleri

KRITIK KURALLAR:
- SADECE gercekten arama sonuclarinda bulup okudugun, gercek bir kaynagi
  (URL) olan haberleri raporla. Hicbir haberi uydurma, tahmin etme veya
  genellemeyle doldurma. Yeterli sayida gercek/guncel haber bulamazsan,
  bulduklarinla yetin veya bos liste don - eksik sayida gercek haber,
  uydurma haberden iyidir.
- isinolsa.com sitesini kaynak olarak ASLA kullanma/gosterme - bu site
  sadece diger sitelerin ilanlarini topluyor, orijinal kaynak degil. O
  siteyi bulursan, ayni haberin resmi/orijinal haber kaynagini (bakanlik,
  kurum sitesi, Resmi Gazete, buyuk bir haber ajansi/gazete vb.) ara.`;

/**
 * Kamu personel alimlariyla ilgili guncel haberleri web aramasiyla arastirir.
 * Sadece gercek, kaynakli sonuclar doner; basarisiz olursa bos dizi doner.
 */
export async function researchHaberler(): Promise<HaberResearchItem[]> {
  try {
    const res = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Güncel kamu personel alımı haberlerini araştır ve JSON ile cevap ver.",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(HaberSchema),
      },
    });

    const parsedJson = parseGeminiJson(res.text);
    if (!parsedJson) return [];

    const result = HaberSchema.safeParse(parsedJson);
    if (!result.success) return [];

    // kaynakUrl, Gemini'nin grounding yonlendirme linki - kalici saklamadan
    // once gercek/nihai kaynak URL'sine cozuyoruz. Cozulemeyen (linkin
    // olmedigi/gecersiz oldugu) haberler atlanir. Prompt talimati tek
    // basina yeterli olmayabilir (model yine de isinolsa.com'u kaynak
    // gosterebilir) - kod seviyesinde de kesin olarak eliyoruz.
    const cozulmus = await Promise.all(
      result.data.haberler.map(async (h): Promise<HaberResearchItem | null> => {
        const kaynakUrl = await resolveGroundingUrl(h.kaynakUrl);
        if (!kaynakUrl || kaynakUrl.includes("isinolsa.com")) return null;

        // Once haberin kendi kaynagindan gercek bir gorsel dene; yoksa
        // kurumun Wikipedia'daki (acik lisansli) logosuna dus.
        const ogGorsel = await extractOgImage(kaynakUrl);
        if (ogGorsel) return { baslik: h.baslik, ozet: h.ozet, kaynakUrl, gorselUrl: ogGorsel, gorselLogoMu: false };

        const kurumGorseli = await findInstitutionImage(h.kurumAdi);
        return {
          baslik: h.baslik,
          ozet: h.ozet,
          kaynakUrl,
          gorselUrl: kurumGorseli,
          gorselLogoMu: !!kurumGorseli,
        };
      }),
    );

    return cozulmus.filter((h): h is HaberResearchItem => !!h);
  } catch (err) {
    console.error("Haber araştırması başarısız:", err);
    return [];
  }
}
