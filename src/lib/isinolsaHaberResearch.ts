import { z } from "zod";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { toGeminiSchema, parseGeminiJson } from "@/lib/geminiSchema";
import { resolveGroundingUrl } from "@/lib/resolveGroundingUrl";

export type IsinolsaLead = {
  externalId: string;
  kurumAdi: string;
  baslik: string;
};

const SonucSchema = z.object({
  sonuclar: z.array(
    z.object({
      index: z.number().int().describe("Girdi listesindeki sira numarasi (0'dan baslar)."),
      dogrulandi: z
        .boolean()
        .describe("Bu alimi Resmi Gazete, kurumun/bakanligin kendi resmi web sitesi gibi BAGIMSIZ bir resmi kaynaktan gercekten dogrulayabildin mi?"),
      baslik: z.string().nullable().describe("Dogrulandiysa, resmi kaynaktaki bilgiye dayanan kisa baslik."),
      ozet: z.string().nullable().describe("Dogrulandiysa, 1-2 kisa cumlelik, sadece resmi kaynaktaki bilgiye dayanan ozet."),
      resmiKaynakUrl: z
        .string()
        .nullable()
        .describe("Dogrulandiysa, bulunan resmi kaynagin (Resmi Gazete, kurum/bakanlik sitesi vb.) GERCEK URL'si. isinolsa.com veya baska bir ucuncu taraf toplama sitesi OLAMAZ."),
    }),
  ),
});

export type IsinolsaHaberSonuc = {
  externalId: string;
  dogrulandi: boolean;
  baslik: string | null;
  ozet: string | null;
  resmiKaynakUrl: string | null;
};

const SYSTEM_PROMPT = `Sana bir kurum adi ve kisa bir konu basligi listesi verilecek. Bu
listedeki HER BIR madde icin, o kurumun gercekten boyle bir personel/memur
alimi yaptigini/yapacagini Google Search kullanarak BAGIMSIZ OLARAK
dogrulamaya calis.

KRITIK KURALLAR:
- SADECE resmi kaynaklari kabul et: Resmi Gazete (resmigazete.gov.tr),
  kurumun/universitenin/belediyenin kendi resmi web sitesi, ilgili
  bakanligin resmi web sitesi, YOK/OSYM/Kariyer Kapisi gibi resmi
  platformlar. Haber siteleri, is ilani toplama siteleri (ozellikle
  isinolsa.com) veya ucuncu taraf blog/forum kaynaklarini GECERLI KAYNAK
  OLARAK KULLANMA - bunlari sadece "arastirma ipucu" olarak
  gorebilirsin ama nihai kaynak/URL olarak asla verme.
- Bagimsiz, resmi bir kaynaktan dogrulayamadigin bir maddeyi
  "dogrulandi: false" olarak isaretle ve baslik/ozet/resmiKaynakUrl
  alanlarini null birak. Hicbir bilgiyi UYDURMA veya tahmin etme.
- Ozet, SADECE bulunan resmi kaynaktaki gercek bilgiye dayanmali.

Girdi listesindeki HER madde icin (atlamadan) bir sonuc satiri uret.`;

function beklet(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * isinolsa.com'dan gelen "lead"leri (sadece kurum adi + kisa konu)
 * BAGIMSIZ olarak resmi kaynaklardan arastirip dogrular. isinolsa.com'un
 * kendi sayfasina veya URL'sine asla referans vermez/donmez - sadece
 * "boyle bir alim var mi" sinyali olarak kullanilir.
 *
 * Gercek bir sonuc alinamazsa (API hatasi, gecici asiri yuk, model semaya
 * uymayan cikti uretmesi vb.) hata firlatir - "arastirilamadi" durumunu
 * "resmi kaynaktan dogrulanamadi" ile KARISTIRMAMAK icin. Cagiran taraf
 * (route), bu leadleri IsinolsaLeadIslendi'ye ISLENMEMIS olarak birakip bir
 * sonraki calistirmada tekrar denemeli.
 */
export async function researchIsinolsaLeads(
  leads: IsinolsaLead[],
): Promise<IsinolsaHaberSonuc[]> {
  if (leads.length === 0) return [];

  const girdiListesi = leads
    .map((l, i) => `${i}. Kurum: "${l.kurumAdi}" | Konu: "${l.baslik}"`)
    .join("\n");

  // maxDuration (120s) icinde kalmak icin en fazla 2 deneme: tek basarisiz
  // cagri bile ~50-100s surebiliyor.
  const DENEME_SAYISI = 2;
  let sonHata: unknown;

  for (let deneme = 1; deneme <= DENEME_SAYISI; deneme++) {
    try {
      const res = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: girdiListesi,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseJsonSchema: toGeminiSchema(SonucSchema),
        },
      });

      const parsedJson = parseGeminiJson(res.text);
      if (!parsedJson) throw new Error("Gemini yanitindan JSON cikarilamadi.");

      const parsed = SonucSchema.safeParse(parsedJson);
      if (!parsed.success) throw new Error("Gemini yaniti semaya uymuyor.");

      return Promise.all(
        leads.map(async (lead, i) => {
          const sonuc = parsed.data.sonuclar.find((s) => s.index === i);
          if (!sonuc || !sonuc.dogrulandi || !sonuc.resmiKaynakUrl) {
            return { externalId: lead.externalId, dogrulandi: false, baslik: null, ozet: null, resmiKaynakUrl: null };
          }

          // resmiKaynakUrl, Gemini'nin grounding yonlendirme linki - gercek
          // kaynak alan adini ancak coz(er)sek gorebiliriz. isinolsa.com
          // disleme kontrolu de bu yuzden COZULMUS url uzerinde yapilmali.
          const cozulmusUrl = await resolveGroundingUrl(sonuc.resmiKaynakUrl);
          if (!cozulmusUrl || cozulmusUrl.includes("isinolsa.com")) {
            return { externalId: lead.externalId, dogrulandi: false, baslik: null, ozet: null, resmiKaynakUrl: null };
          }

          return {
            externalId: lead.externalId,
            dogrulandi: true,
            baslik: sonuc.baslik,
            ozet: sonuc.ozet,
            resmiKaynakUrl: cozulmusUrl,
          };
        }),
      );
    } catch (err) {
      sonHata = err;
      console.error(`İşin Olsa lead araştırması denemesi ${deneme}/${DENEME_SAYISI} başarısız:`, err);
      if (deneme < DENEME_SAYISI) await beklet(deneme * 3000);
    }
  }

  throw sonHata;
}
