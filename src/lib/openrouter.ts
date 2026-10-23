/**
 * OpenRouter Batch API (yari fiyat, sonuc genelde dakikalar icinde, en gec 24 saat): KPSS soru uretimi ve dogrulamasi.
 * Model secimi 2026-10-23 karsilastirmasina gore (scripts/kpssYazarKarsilastir.ts): DeepSeek V4.1 Flash yazdigi
 * 12 sorunun 12'si dogru, tuzaklarin 7/8'ini yakaladi; en ucuz yol (~0,0004 $/soru).
 */
const OR = "https://openrouter.ai/api/v1";

export const YAZAR_MODEL = "deepseek/deepseek-v4.1-flash";
export const KONTROL_MODEL = "deepseek/deepseek-v4.1-flash";

export type SohbetIstegi = { sistem: string; icerik: string };

const basliklar = () => ({ Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" });

/** Istekleri tek batch olarak gonderir (custom_id = dizideki sira); batch kimligi doner. */
export async function topluGonder(model: string, istekler: SohbetIstegi[]): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY yok");
  const res = await fetch(`${OR}/batches`, {
    method: "POST",
    headers: basliklar(),
    signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      endpoint: "/v1/chat/completions",
      model,
      requests: istekler.map((r, i) => ({
        custom_id: String(i),
        body: { messages: [{ role: "system", content: r.sistem }, { role: "user", content: r.icerik }], response_format: { type: "json_object" }, max_tokens: 16_000 },
      })),
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.id) throw new Error(`openrouter batch ${res.status}: ${data?.error?.message ?? "yanıt okunamadı"}`);
  return String(data.id);
}

const SURUYOR = new Set(["validating", "in_progress", "finalizing"]);

/** Batch durumu; bittiyse her istegin metni (sira -> metin; hatali istek bos) ve toplam maliyet ($). */
export async function topluSonuc(id: string): Promise<{ durum: "suruyor" } | { durum: "hata"; mesaj: string } | { durum: "bitti"; metinler: string[]; maliyet: number }> {
  const res = await fetch(`${OR}/batches/${id}`, { headers: basliklar(), signal: AbortSignal.timeout(60_000) });
  // Yeni olusturulan batch bir sure 404 doner (2026-10-23); cok eskiyse cagiran zaman asimiyla kapatir.
  if (res.status === 404) return { durum: "suruyor" };
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error(`openrouter batch durum ${res.status}`);
  if (SURUYOR.has(data.status)) return { durum: "suruyor" };
  if (data.status !== "completed") return { durum: "hata", mesaj: `${data.status}: ${data.error?.message ?? ""}`.slice(0, 200) };
  const metinler: string[] = new Array(data.request_counts?.total ?? 0).fill("");
  for (const r of data.results ?? []) metinler[Number(r.custom_id)] = r.response?.body?.choices?.[0]?.message?.content ?? "";
  return { durum: "bitti", metinler, maliyet: data.usage?.cost ?? 0 };
}
