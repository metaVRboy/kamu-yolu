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
  kpssTuru: z.string().nullable().describe("İstenen KPSS puan türü (ör. 'KPSS P3'), metinde geçmiyorsa null."),
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
    .describe("Başvuru şartlarını (eğitim, yaş, deneyim vb.) SADECE metinde geçene dayanarak özetleyen kısa açıklama."),
  ozelSartlar: z.string().nullable().describe("Metinde belirtilen özel şartlar/nitelikler, yoksa null."),
  dikkatEdilmesiGerekenler: z
    .string()
    .nullable()
    .describe(
      "Adayların dikkat etmesi gereken, metinde AÇIKÇA belirtilen bir uyarı/not varsa kısa açıklama, " +
        "yoksa null - UYDURMA UYARI YAZMA.",
    ),
  sss: z
    .array(SssSchema)
    .max(4)
    .describe("Sadece metindeki bilgiye dayanan, gerçekten cevaplanabilir 0-4 soru-cevap. Uydurma soru sorma, yetersizse boş dizi."),
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
          "tekrar etme - her alan farklı, gerçek bir bilgi taşımalı.",
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
