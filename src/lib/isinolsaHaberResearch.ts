import { z } from "zod";
import { anthropic } from "@/lib/anthropic";

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
alimi yaptigini/yapacagini web aramasi kullanarak BAGIMSIZ OLARAK
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

Arastirmayi bitirdiginde bulgularini "sonuclari_bildir" aracini
cagirarak bildir. Girdi listesindeki HER madde icin (atlamadan) bir
sonuc satiri uret.`;

const RAPOR_TOOL_NAME = "sonuclari_bildir";

/**
 * isinolsa.com'dan gelen "lead"leri (sadece kurum adi + kisa konu)
 * BAGIMSIZ olarak resmi kaynaklardan arastirip dogrular. isinolsa.com'un
 * kendi sayfasina veya URL'sine asla referans vermez/donmez - sadece
 * "boyle bir alim var mi" sinyali olarak kullanilir.
 */
export async function researchIsinolsaLeads(
  leads: IsinolsaLead[],
): Promise<IsinolsaHaberSonuc[]> {
  if (leads.length === 0) return [];

  const girdiListesi = leads
    .map((l, i) => `${i}. Kurum: "${l.kurumAdi}" | Konu: "${l.baslik}"`)
    .join("\n");

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
          max_uses: Math.min(30, leads.length * 2),
          allowed_callers: ["direct"],
        },
        {
          name: RAPOR_TOOL_NAME,
          description: "Her lead icin arastirma sonucunu bildirir.",
          input_schema: {
            type: "object",
            properties: {
              sonuclar: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    index: { type: "integer" },
                    dogrulandi: { type: "boolean" },
                    baslik: { type: ["string", "null"] },
                    ozet: { type: ["string", "null"] },
                    resmiKaynakUrl: { type: ["string", "null"] },
                  },
                  required: ["index", "dogrulandi", "baslik", "ozet", "resmiKaynakUrl"],
                },
              },
            },
            required: ["sonuclar"],
          },
        },
      ],
      messages: [{ role: "user", content: girdiListesi }],
    });

    const toolUse = res.content.find(
      (block): block is Extract<typeof block, { type: "tool_use" }> =>
        block.type === "tool_use" && block.name === RAPOR_TOOL_NAME,
    );
    if (!toolUse) {
      return leads.map((l) => ({
        externalId: l.externalId,
        dogrulandi: false,
        baslik: null,
        ozet: null,
        resmiKaynakUrl: null,
      }));
    }

    const parsed = SonucSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      return leads.map((l) => ({
        externalId: l.externalId,
        dogrulandi: false,
        baslik: null,
        ozet: null,
        resmiKaynakUrl: null,
      }));
    }

    return leads.map((lead, i) => {
      const sonuc = parsed.data.sonuclar.find((s) => s.index === i);
      const gecerliKaynak =
        sonuc?.resmiKaynakUrl && /^https?:\/\//.test(sonuc.resmiKaynakUrl) &&
        !sonuc.resmiKaynakUrl.includes("isinolsa.com");

      if (!sonuc || !sonuc.dogrulandi || !gecerliKaynak) {
        return { externalId: lead.externalId, dogrulandi: false, baslik: null, ozet: null, resmiKaynakUrl: null };
      }

      return {
        externalId: lead.externalId,
        dogrulandi: true,
        baslik: sonuc.baslik,
        ozet: sonuc.ozet,
        resmiKaynakUrl: sonuc.resmiKaynakUrl,
      };
    });
  } catch (err) {
    console.error("İşin Olsa lead araştırması başarısız:", err);
    return leads.map((l) => ({
      externalId: l.externalId,
      dogrulandi: false,
      baslik: null,
      ozet: null,
      resmiKaynakUrl: null,
    }));
  }
}
