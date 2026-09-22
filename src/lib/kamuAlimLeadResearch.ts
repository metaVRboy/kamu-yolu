import { z } from "zod";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { toGeminiSchema, parseGeminiJson } from "@/lib/geminiSchema";
import { resolveGroundingUrl } from "@/lib/resolveGroundingUrl";
import { extractOgImage } from "@/lib/extractOgImage";
import { findInstitutionImage } from "@/lib/findInstitutionImage";
import { verifyHaberKaynak } from "@/lib/verifyHaberKaynak";
import { haberIcinBolumEslestir } from "@/lib/haberDepartmentMatch";

// Guvenilmeyen "toplama" siteleri - bunlar sadece arastirma ipucu (lead)
// kaynagi olarak kullanilir, nihai haber kaynagi olarak ASLA gosterilmez.
const TOPLAMA_SITELERI = ["isinolsa.com", "secmeyemektarifleri.net"];

export type KamuAlimLead = {
  externalId: string;
  kurumAdi?: string;
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
        .describe("Dogrulandiysa, bulunan resmi kaynagin (Resmi Gazete, kurum/bakanlik sitesi vb.) GERCEK URL'si. Ucuncu taraf bir toplama sitesi OLAMAZ."),
    }),
  ),
});

export type KamuAlimHaberSonuc = {
  externalId: string;
  dogrulandi: boolean;
  baslik: string | null;
  ozet: string | null;
  resmiKaynakUrl: string | null;
  gorselUrl: string | null;
  gorselLogoMu: boolean;
  departmentIds: string[];
};

const SYSTEM_PROMPT = `Sana bir kurum adi ve/veya kisa bir konu basligi listesi verilecek. Bu
listedeki HER BIR madde icin, o kurumun gercekten boyle bir personel/memur
alimi yaptigini/yapacagini Google Search kullanarak BAGIMSIZ OLARAK
dogrulamaya calis.

KRITIK KURALLAR:
- SADECE resmi kaynaklari kabul et: Resmi Gazete (resmigazete.gov.tr),
  kurumun/universitenin/belediyenin kendi resmi web sitesi, ilgili
  bakanligin resmi web sitesi, YOK/OSYM/Kariyer Kapisi gibi resmi
  platformlar. Haber siteleri, is ilani toplama siteleri (ozellikle
  ${TOPLAMA_SITELERI.join(", ")}) veya ucuncu taraf blog/forum kaynaklarini
  GECERLI KAYNAK OLARAK KULLANMA - bunlari sadece "arastirma ipucu" olarak
  gorebilirsin ama nihai kaynak/URL olarak asla verme.
- Bagimsiz, resmi bir kaynaktan dogrulayamadigin bir maddeyi
  "dogrulandi: false" olarak isaretle ve baslik/ozet/resmiKaynakUrl
  alanlarini null birak. Hicbir bilgiyi UYDURMA veya tahmin etme.
- Ozet, SADECE bulunan resmi kaynaktaki gercek bilgiye dayanmali.

Girdi listesindeki HER madde icin (atlamadan) bir sonuc satiri uret.`;

function beklet(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toplamaSitesiMi(url: string): boolean {
  return TOPLAMA_SITELERI.some((site) => url.includes(site));
}

/**
 * Bir toplama/haber sitesinden gelen "lead"leri (kurum adi ve/veya kisa
 * konu basligi) BAGIMSIZ olarak resmi kaynaklardan arastirip dogrular.
 * Lead'in geldigi sitenin kendi sayfasina/URL'sine asla referans
 * vermez/donmez - sadece "boyle bir alim var mi" sinyali olarak kullanilir.
 *
 * Gercek bir sonuc alinamazsa (API hatasi, gecici asiri yuk, model semaya
 * uymayan cikti uretmesi vb.) hata firlatir - "arastirilamadi" durumunu
 * "resmi kaynaktan dogrulanamadi" ile KARISTIRMAMAK icin. Cagiran taraf
 * (route), bu leadleri *LeadIslendi tablosuna ISLENMEMIS olarak birakip bir
 * sonraki calistirmada tekrar denemeli.
 */
export async function researchKamuAlimLeads(
  leads: KamuAlimLead[],
): Promise<KamuAlimHaberSonuc[]> {
  if (leads.length === 0) return [];

  const girdiListesi = leads
    .map((l, i) =>
      l.kurumAdi
        ? `${i}. Kurum: "${l.kurumAdi}" | Konu: "${l.baslik}"`
        : `${i}. Konu: "${l.baslik}"`,
    )
    .join("\n");

  // maxDuration (290s) icinde kalmak icin en fazla 3 deneme: tek basarisiz
  // cagri bile ~50-100s surebiliyor.
  const DENEME_SAYISI = 3;
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
        leads.map(async (lead, i): Promise<KamuAlimHaberSonuc> => {
          const bos = {
            externalId: lead.externalId,
            dogrulandi: false,
            baslik: null,
            ozet: null,
            resmiKaynakUrl: null,
            gorselUrl: null,
            gorselLogoMu: false,
            departmentIds: [],
          };

          const sonuc = parsed.data.sonuclar.find((s) => s.index === i);
          if (!sonuc || !sonuc.dogrulandi || !sonuc.resmiKaynakUrl || !sonuc.baslik || !sonuc.ozet) return bos;

          // resmiKaynakUrl, Gemini'nin grounding yonlendirme linki - gercek
          // kaynak alan adini ancak coz(er)sek gorebiliriz. Toplama sitesi
          // disleme kontrolu de bu yuzden COZULMUS url uzerinde yapilmali.
          const cozulmusUrl = await resolveGroundingUrl(sonuc.resmiKaynakUrl);
          if (!cozulmusUrl || toplamaSitesiMi(cozulmusUrl)) return bos;

          // Sayfa teknik olarak acilsa bile tamamen alakasiz olabilir -
          // gercek icerigi tekrar dogrulanmadan hicbir kaynak kabul edilmez.
          const { destekliyor, metin } = await verifyHaberKaynak({
            baslik: sonuc.baslik,
            ozet: sonuc.ozet,
            url: cozulmusUrl,
          });
          if (!destekliyor) return bos;

          // Bolum eslesmesi SADECE kisa ozete degil, kaynagin tam metnine
          // gore yapilir - ozette gecmeyen ama haberin icinde gecen bir
          // bolum adi da boylece yakalanir.
          const departmentIds = metin
            ? await haberIcinBolumEslestir({ baslik: sonuc.baslik, ozet: sonuc.ozet, tamMetin: metin })
            : [];

          // Once haberin kendi kaynagindan gercek bir gorsel dene; yoksa
          // kurumun Wikipedia'daki (acik lisansli) logosuna dus.
          const ogGorsel = await extractOgImage(cozulmusUrl);
          const kurumGorseli = ogGorsel ? null : await findInstitutionImage(lead.kurumAdi ?? lead.baslik);

          return {
            externalId: lead.externalId,
            dogrulandi: true,
            baslik: sonuc.baslik,
            ozet: sonuc.ozet,
            resmiKaynakUrl: cozulmusUrl,
            gorselUrl: ogGorsel ?? kurumGorseli,
            gorselLogoMu: !ogGorsel && !!kurumGorseli,
            departmentIds,
          };
        }),
      );
    } catch (err) {
      sonHata = err;
      console.error(`Kamu alimi lead arastirmasi denemesi ${deneme}/${DENEME_SAYISI} basarisiz:`, err);
      if (deneme < DENEME_SAYISI) await beklet(deneme * 3000);
    }
  }

  throw sonHata;
}
