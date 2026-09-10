import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { toGeminiSchema, parseGeminiJson } from "@/lib/geminiSchema";

const Sema = z.object({
  bolumAdlari: z
    .array(z.string())
    .describe(
      "Bu haberde ACIKCA belirtilen bir meslek/unvanla dogrudan eslesen bolumlerin, verilen listeden " +
        "BIREBIR kopyalanmis tam adlari. Boyle somut bir eslesme yoksa bos dizi.",
    ),
});

/**
 * Bir haberin bolumle iliskisini basit kelime/alt-metin eslesmesi yerine
 * yapay zekaya karar verdirerek bulur. Nedeni: haberin TAM sayfa metni
 * (menu, alakasiz baslik onizlemeleri, altbilgi gibi) gurultu icerir ve
 * "tarih" (gun/ay/yil anlaminda) veya "Adalet Bakanligi" (Adalet bolumuyle
 * hicbir ilgisi olmayan bir kurum adi) gibi kelimeler basit alt-metin
 * kontroluyle Tarih/Adalet gibi bolumlerle YANLIS eslesmeye yol aciyordu.
 * Modelden, sadece metinde ACIKCA belirtilen somut bir meslek/unvana
 * dayanarak secim yapmasi istenir.
 */
export async function haberIcinBolumEslestir(params: {
  baslik: string;
  ozet: string;
  tamMetin: string;
}): Promise<string[]> {
  const bolumler = await prisma.department.findMany({ select: { id: true, name: true } });
  if (bolumler.length === 0) return [];

  try {
    const res = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents:
        `Haber başlığı: "${params.baslik}"\nHaber özeti: "${params.ozet}"\n` +
        `Haberin tam metni:\n"""${params.tamMetin.slice(0, 4000)}"""\n\n` +
        `Bölüm listesi:\n${bolumler.map((b) => b.name).join(", ")}`,
      config: {
        systemInstruction:
          "Sana bir kamu personeli alim haberinin tam metni ve bir universite bolumleri listesi " +
          "verilecek. Haberde ACIKCA belirtilen somut bir meslek/unvan/aranan nitelik varsa (ör. " +
          "'diyetisyen alinacak', 'bilisim personeli', 'mimar', 'hemsire' vb.), bu meslekle DOGRUDAN " +
          "eslesen bolum(ler)i listeden BIREBIR adiyla sec.\n" +
          "KRITIK: Sadece metinde gecen bir kelimenin bolum adiyla TESADUFEN ortusmesi YETERLI DEGIL. " +
          "Ornekler: metinde bir TARIH (gun/ay/yil, ör. 'son basvuru tarihi') geciyor diye 'Tarih' " +
          "bolumunu SECME; 'Adalet Bakanligi' kurum adi geciyor diye somut bir hukuk/adalet mezuniyet " +
          "sarti belirtilmeden 'Hukuk' veya 'Adalet' SECME. Haber genel/belirsizse (hangi mesleklerin " +
          "alinacagi belirtilmemisse, sadece 'X kurumu personel alacak' gibi) BOS DIZI don. Listede " +
          "olmayan bir bolum adi UYDURMA.",
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(Sema),
      },
    });

    const parsed = Sema.safeParse(parseGeminiJson(res.text));
    if (!parsed.success) return [];

    const adToId = new Map(bolumler.map((b) => [b.name, b.id]));
    return parsed.data.bolumAdlari
      .map((ad) => adToId.get(ad))
      .filter((id): id is string => !!id);
  } catch {
    return [];
  }
}
