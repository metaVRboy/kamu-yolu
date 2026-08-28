import { z } from "zod";
import { anthropic } from "@/lib/anthropic";

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
      }),
    )
    .max(6)
    .describe("Bulunan gerçek, doğrulanabilir haberlerin listesi. Hiçbir şey bulunamadıysa boş dizi."),
});

export type HaberResearchItem = z.infer<typeof HaberSchema>["haberler"][number];

const SYSTEM_PROMPT = `Turkiye'de kamu personeli/memur alimlariyla ilgili GUNCEL (son birkac
gun icindeki, en fazla son 1 hafta) haberleri web aramasi kullanarak arastir.
Aradigin haber turleri:
- Bakanliklarin/kamu kurumlarinin acikladigi toplu personel/memur/sozlesmeli
  personel alim ilanlari veya planlari
- KPSS, kamu istihdami ile ilgili gundemdeki tartismalar/kararlar
- Kamu calisanlarini (ozellikle saglik personeli, ogretmen, memur) ilgilendiren
  sendika aciklamalari/haberleri
- Kamuda yeni kadro, atama, ozluk haklariyla ilgili resmi/gazete haberleri

KRITIK KURAL: SADECE gercekten arama sonuclarinda bulup okudugun, gercek bir
kaynagi (URL) olan haberleri raporla. Hicbir haberi uydurma, tahmin etme veya
genellemeyle doldurma. Yeterli sayida gercek/guncel haber bulamazsan, bulduklarinla
yetin veya bos liste don - eksik sayida gercek haber, uydurma haberden iyidir.

Ardindan SADECE asagidaki JSON semasina uyan TEK bir JSON nesnesiyle cevap ver -
baska hicbir aciklama, yorum veya metin ekleme, sadece JSON:

{"haberler": [{"baslik": string, "ozet": string, "kaynakUrl": string}, ...]}`;

/**
 * Kamu personel alimlariyla ilgili guncel haberleri web aramasiyla arastirir.
 * Sadece gercek, kaynakli sonuclar doner; basarisiz olursa bos dizi doner.
 */
export async function researchHaberler(): Promise<HaberResearchItem[]> {
  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
          max_uses: 6,
          allowed_callers: ["direct"],
        },
      ],
      messages: [
        {
          role: "user",
          content: "Güncel kamu personel alımı haberlerini araştır ve JSON ile cevap ver.",
        },
      ],
    });

    let text = "";
    for (const block of res.content) {
      if (block.type === "text") text += block.text;
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];

    const result = HaberSchema.safeParse(JSON.parse(jsonMatch[0]));
    if (!result.success) return [];

    // Basit bir dogrulama: kaynakUrl gercekten bir URL gibi gorunmeli.
    return result.data.haberler.filter((h) => /^https?:\/\//.test(h.kaynakUrl));
  } catch (err) {
    console.error("Haber araştırması başarısız:", err);
    return [];
  }
}
