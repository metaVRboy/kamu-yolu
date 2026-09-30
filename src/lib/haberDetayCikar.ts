import { z } from "zod";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { toGeminiSchema, parseGeminiJson } from "@/lib/geminiSchema";

const SssSchema = z.object({
  soru: z.string(),
  cevap: z.string(),
});

const DetaySchema = z.object({
  kurumAdi: z.string().nullable().describe("İlanı veren kurumun tam adı, metinde açıkça geçmiyorsa null."),
  kadroPozisyon: z
    .string()
    .nullable()
    .describe("Alınacak kadro/pozisyon unvanı (ör. 'Sözleşmeli Personel', 'Öğretim Üyesi'), yoksa null."),
  kontenjan: z.number().int().nullable().describe("Alınacak toplam kişi sayısı, metinde açık bir sayı yoksa null."),
  kategori: z
    .string()
    .nullable()
    .describe("İlanın kısa kategorisi (ör. 'Akademik Personel', 'İşçi Alımı', 'Sözleşmeli Personel'), yoksa null."),
  istihdamTuru: z
    .string()
    .nullable()
    .describe("İstihdam türü (ör. 'Memur', 'Sözleşmeli Personel', 'Sürekli İşçi'), yoksa null."),
  kpssTuru: z
    .string()
    .nullable()
    .describe(
      "İstenen KPSS puan türü, ÖĞRENİM SEVİYESİYLE BİRLİKTE (ör. 'Lisans KPSS P3', 'Önlisans KPSS P93', " +
        "'Lise KPSS P94') - metinde geçen ogrenim seviyesi ile ayni seviyedeki KPSS sinavina karsilik " +
        "gelir, bu ikisi birbirinden bagimsiz degildir. Metinde geçmiyorsa null.",
    ),
  ustYas: z.number().int().nullable().describe("Başvuru için belirtilen üst yaş sınırı, yoksa null."),
  egitimSeviyeleri: z
    .array(z.enum(["ILKOGRETIM", "LISE", "ONLISANS", "LISANS", "YUKSEK_LISANS"]))
    .describe("Metinde AÇIKÇA belirtilen öğrenim seviyeleri, belirsizse boş dizi."),
  basvuruBaslangic: z.string().nullable().describe("Başvuru başlangıç tarihi (YYYY-MM-DD formatında), yoksa null."),
  basvuruBitis: z.string().nullable().describe("Son başvuru tarihi (YYYY-MM-DD formatında), yoksa null."),
  neAciklandi: z
    .string()
    .nullable()
    .describe("Duyurunun ne olduğunu anlatan 2-3 cümlelik, SADECE metne dayalı açıklama."),
  basvuruTakvimi: z
    .string()
    .nullable()
    .describe("Başvuru tarihleri/süreciyle ilgili, SADECE metinde geçen bilgiye dayalı kısa açıklama."),
  kimlerBasvurabilir: z
    .string()
    .nullable()
    .describe(
      "Başvuru şartlarını (eğitim, yaş, deneyim vb.) SADECE metinde geçene dayanarak özetleyen kısa " +
        "açıklama. Bir KPSS şartından bahsediyorsan, hangi öğrenim seviyesinin KPSS'i olduğunu MUTLAKA " +
        "belirt (ör. 'Lisans KPSS'den ...' - asla sadece 'KPSS'den' veya 'KPSS puan türlerinin herhangi " +
        "birinden' gibi seviyesiz/belirsiz ifade kullanma).",
    ),
  ozelSartlar: z
    .string()
    .nullable()
    .describe(
      "Metinde belirtilen özel şartlar/nitelikler, yoksa null. Bir KPSS şartından bahsediyorsan, hangi " +
        "öğrenim seviyesinin KPSS'i olduğunu MUTLAKA belirt (ör. 'Lisans KPSS'den ...' - asla sadece " +
        "'KPSS'den' veya 'KPSS puan türlerinin herhangi birinden' gibi seviyesiz/belirsiz ifade kullanma).",
    ),
  dikkatEdilmesiGerekenler: z
    .string()
    .nullable()
    .describe(
      "Adayların dikkat etmesi gereken, metinde AÇIKÇA belirtilen bir uyarı/not varsa kısa açıklama, " +
        "yoksa null - UYDURMA UYARI YAZMA. KPSS'den bahsediyorsan burada da öğrenim seviyesini belirt " +
        "(ör. 'Lisans KPSS').",
    ),
  sss: z
    .array(SssSchema)
    .max(4)
    .describe(
      "Sadece metindeki bilgiye dayanan, gerçekten cevaplanabilir 0-4 soru-cevap. Uydurma soru sorma, " +
        "yetersizse boş dizi. Cevapta KPSS'den bahsediyorsan öğrenim seviyesini belirt (ör. 'Lisans KPSS').",
    ),
});

export type HaberDetayExtract = z.infer<typeof DetaySchema>;

/**
 * Bir haberin dogrulanmis kaynak metninden yapilandirilmis ayrintilari
 * (kurum, kontenjan, egitim sarti, basvuru tarihleri, SSS vb.) cikarir.
 * KRITIK: modelden sadece metinde ACIKCA yazan bilgiyi cikarmasi, eksik
 * alanlari uydurmadan null/bos birakmasi istenir - kismi bilgi, uydurma
 * bilgiden iyidir.
 */
export async function haberDetayCikar(params: {
  baslik: string;
  tamMetin: string;
}): Promise<HaberDetayExtract | null> {
  try {
    const res = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Haber başlığı: "${params.baslik}"\n\nHaberin tam metni:\n"""${params.tamMetin.slice(0, 6000)}"""`,
      config: {
        systemInstruction:
          "Sana bir kamu personel alımı/duyurusu haberinin tam metni verilecek. Görevin bu metinden " +
          "yapılandırılmış bilgi çıkarmak. KRİTİK KURAL: SADECE metinde AÇIKÇA yazan bilgiyi çıkar. Bir " +
          "alan metinde belirtilmemişse veya belirsizse o alanı null/boş bırak - ASLA tahmin etme, genel " +
          "geçer bir değer uydurma veya varsayılan bir sayı/tarih yazma. Aynı bilgiyi farklı alanlarda " +
          "tekrar etme - her alan farklı, gerçek bir bilgi taşımalı.\n\n" +
          "KPSS KURALI: KPSS öğrenim seviyesine göre ayrı sınavlardır (Lisans KPSS, Önlisans KPSS, Lise " +
          "KPSS - birbirinden bağımsız, farklı puan türleri). İlanın öğrenim şartı (ör. lisans mezunu) " +
          "hangi seviyeyse, o ilanda geçen KPSS puanı da OTOMATİK OLARAK O SEVİYENİN KPSS'idir - metinde " +
          "'lisans mezunu ... KPSS puan türlerinin herhangi birinden' gibi seviyesiz yazılmış olsa bile " +
          "sen çıktıda bunu ilandaki öğrenim şartına göre netleştirip 'Lisans KPSS puan türlerinin ...' " +
          "şeklinde yaz. Bu bir tahmin değil, KPSS sisteminin çalışma mantığından kaynaklanan zorunlu bir " +
          "eşleşmedir - asla seviyesiz/belirsiz 'KPSS'den X puan' ifadesi kullanma.",
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(DetaySchema),
      },
    });
    const parsed = DetaySchema.safeParse(parseGeminiJson(res.text));
    return parsed.success ? parsed.data : null;
  } catch (err) {
    console.error("Haber ayrıntı çıkarımı başarısız:", err);
    return null;
  }
}
