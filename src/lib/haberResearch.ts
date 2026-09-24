import { z } from "zod";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { toGeminiSchema, parseGeminiJson } from "@/lib/geminiSchema";
import { resolveGroundingUrl } from "@/lib/resolveGroundingUrl";
import { extractOgImage } from "@/lib/extractOgImage";
import { findInstitutionImage } from "@/lib/findInstitutionImage";
import { verifyHaberKaynak } from "@/lib/verifyHaberKaynak";
import { haberIcinBolumEslestir } from "@/lib/haberDepartmentMatch";

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
    .max(8)
    .describe("Bulunan gerçek, doğrulanabilir haberlerin listesi. Hiçbir şey bulunamadıysa boş dizi."),
});

export type HaberResearchItem = {
  baslik: string;
  ozet: string;
  kaynakUrl: string;
  gorselUrl: string | null;
  gorselLogoMu: boolean;
  departmentIds: string[];
};

const KRITIK_KURALLAR = `KRITIK KURALLAR:
- SADECE gercekten arama sonuclarinda bulup okudugun, gercek bir kaynagi
  (URL) olan haberleri raporla. Hicbir haberi uydurma, tahmin etme veya
  genellemeyle doldurma. Yeterli sayida gercek/guncel haber bulamazsan,
  bulduklarinla yetin veya bos liste don - eksik sayida gercek haber,
  uydurma haberden iyidir.
- isinolsa.com ve secmeyemektarifleri.net sitelerini kaynak olarak ASLA
  kullanma/gosterme - bunlar sadece diger sitelerin ilanlarini toplayan
  siteler, orijinal kaynak degiller. Bu siteleri bulursan, ayni haberin
  resmi/orijinal haber kaynagini (bakanlik, kurum sitesi, Resmi Gazete,
  buyuk bir haber ajansi/gazete vb.) ara.`;

// Tek, genis bir sorgu yerine kurum kategorisine gore ayri/hedefli
// sorgular calistirilir - her biri kendi alanina odaklandigi icin tek bir
// genel sorgudan cok daha fazla ve cesitli gercek haber buluyor. Sorgular
// paralel calisir, toplam sure buyumez.
const KATEGORI_PROMPTLARI = [
  `Turkiye'de bakanliklarin ve merkezi kamu kurumlarinin GUNCEL (son birkac
gun icindeki, en fazla son 1 hafta) personel/memur/sozlesmeli personel
alim haberlerini Google Search ile arastir. Ozellikle:
- Bakanliklarin acikladigi toplu personel/memur alim ilanlari veya planlari
- KPSS, kamu istihdami ile ilgili gundemdeki tartismalar/kararlar
- Kamu calisanlarini (saglik personeli, ogretmen, memur) ilgilendiren
  sendika aciklamalari/haberleri
- Kamuda yeni kadro, atama, ozluk haklariyla ilgili resmi/gazete haberleri
- Bu arastirma sirasinda secmeyemektarifleri.net sitesini de ara/kontrol et.

${KRITIK_KURALLAR}`,
  `Turkiye'deki UNIVERSITELERIN GUNCEL (son birkac gun icindeki, en fazla
son 1 hafta) akademik (ogretim uyesi/gorevlisi, arastirma gorevlisi) ve
idari personel alim ilanlarina dair haberleri Google Search ile arastir.
Devlet universitelerinin kendi ilan sayfalarindaki veya Resmi Gazete'deki
duyurulara ozellikle dikkat et.

${KRITIK_KURALLAR}`,
  `Turkiye'deki BELEDIYELERIN, il ozel idarelerinin, mahalli idare
birliklerinin ve kamu iktisadi tesekkullerinin (KIT) GUNCEL (son birkac
gun icindeki, en fazla son 1 hafta) personel/iscii alim haberlerini
Google Search ile arastir.

${KRITIK_KURALLAR}`,
] as const;

type HaberAdayi = {
  baslik: string;
  ozet: string;
  kaynakUrl: string;
  kurumAdi: string;
};

/** Tek bir kategori sorgusunu calistirir. Basarisiz olursa (diger kategorileri etkilemeden) bos dizi doner. */
async function researchHaberKategorisi(systemPrompt: string): Promise<HaberAdayi[]> {
  try {
    const res = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Güncel kamu personel alımı haberlerini araştır ve JSON ile cevap ver.",
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(HaberSchema),
      },
    });

    const parsedJson = parseGeminiJson(res.text);
    if (!parsedJson) return [];

    const result = HaberSchema.safeParse(parsedJson);
    if (!result.success) return [];

    return result.data.haberler;
  } catch (err) {
    console.error("Haber kategori araştırması başarısız:", err);
    return [];
  }
}

/**
 * Kamu personel alimlariyla ilgili guncel haberleri web aramasiyla arastirir.
 * Tek genis sorgu yerine kurum kategorisine gore paralel, hedefli sorgular
 * calistirilir. Sadece gercek, kaynakli sonuclar doner; basarisiz olan
 * sorgular sessizce atlanir (diger kategoriler etkilenmez).
 */
export async function researchHaberler(): Promise<HaberResearchItem[]> {
  const kategoriSonuclari = await Promise.all(
    KATEGORI_PROMPTLARI.map((prompt) => researchHaberKategorisi(prompt)),
  );
  // Farkli kategori sorgulari ayni haberi (ayni ham grounding URL'siyle)
  // bulmus olabilir - pahali dogrulama adimindan once basitce tekillestir.
  const gorulenUrller = new Set<string>();
  const tumAdaylar = kategoriSonuclari.flat().filter((h) => {
    if (gorulenUrller.has(h.kaynakUrl)) return false;
    gorulenUrller.add(h.kaynakUrl);
    return true;
  });

  try {
    // kaynakUrl, Gemini'nin grounding yonlendirme linki - kalici saklamadan
    // once gercek/nihai kaynak URL'sine cozuyoruz. Cozulemeyen (linkin
    // olmedigi/gecersiz oldugu) haberler atlanir. Prompt talimati tek
    // basina yeterli olmayabilir (model yine de isinolsa.com'u kaynak
    // gosterebilir) - kod seviyesinde de kesin olarak eliyoruz.
    const cozulmus = await Promise.all(
      tumAdaylar.map(async (h): Promise<HaberResearchItem | null> => {
        const kaynakUrl = await resolveGroundingUrl(h.kaynakUrl);
        if (!kaynakUrl || kaynakUrl.includes("isinolsa.com") || kaynakUrl.includes("secmeyemektarifleri.net")) return null;

        // Sayfa teknik olarak acilsa bile tamamen alakasiz olabilir -
        // gercek icerigi tekrar dogrulanmadan hicbir kaynak kabul edilmez.
        const { destekliyor, metin } = await verifyHaberKaynak({ baslik: h.baslik, ozet: h.ozet, url: kaynakUrl });
        if (!destekliyor) return null;

        // Bolum eslesmesi SADECE kisa ozete degil, kaynagin tam metnine gore
        // yapilir - ozette gecmeyen ama haberin icinde gecen bir bolum adi
        // (ör. "diyetisyen alimi") da boylece yakalanir.
        const departmentIds = metin
          ? await haberIcinBolumEslestir({ baslik: h.baslik, ozet: h.ozet, tamMetin: metin })
          : [];

        // Once haberin kendi kaynagindan gercek bir gorsel dene; yoksa
        // kurumun Wikipedia'daki (acik lisansli) logosuna dus.
        const ogGorsel = await extractOgImage(kaynakUrl);
        if (ogGorsel) {
          return { baslik: h.baslik, ozet: h.ozet, kaynakUrl, gorselUrl: ogGorsel, gorselLogoMu: false, departmentIds };
        }

        const kurumGorseli = await findInstitutionImage(h.kurumAdi);
        return {
          baslik: h.baslik,
          ozet: h.ozet,
          kaynakUrl,
          gorselUrl: kurumGorseli,
          gorselLogoMu: !!kurumGorseli,
          departmentIds,
        };
      }),
    );

    return cozulmus.filter((h): h is HaberResearchItem => !!h);
  } catch (err) {
    console.error("Haber araştırması başarısız:", err);
    return [];
  }
}
