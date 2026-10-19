import { z } from "zod";

/**
 * Zod semasini Gemini'nin responseJsonSchema alaninin kabul ettigi bicime
 * cevirir. Gemini yalnizca belirli JSON Schema alanlarini destekliyor;
 * $schema anahtari desteklenmedigi icin ayikliyoruz.
 */
export function toGeminiSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema;
  return json;
}

/**
 * Gemini responseMimeType: "application/json" ile bile bazen yaniti
 * ```json ... ``` gibi kod bloguna sarabiliyor; once dogrudan JSON.parse
 * dener, olmazsa metindeki ilk { ... } bloguna duser.
 */
export function parseGeminiJson(text: string | undefined): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

type JsonSema = { type?: string; enum?: unknown[]; properties?: Record<string, JsonSema>; required?: string[]; items?: JsonSema; minItems?: number; maxItems?: number; minimum?: number; maximum?: number };

/**
 * Zod semasini OpenAPI bicimli responseSchema'ya cevirir. Batch API responseJsonSchema'yi yok sayiyor
 * (2026-10-19 testi: alan adlari tutmadi), responseSchema'ya uyuyor.
 */
export function toGeminiResponseSchema(schema: z.ZodType) {
  const cevir = (j: JsonSema): Record<string, unknown> => ({
    ...(j.type && { type: j.type.toUpperCase() }),
    ...(j.enum && { type: "STRING", enum: j.enum }),
    ...(j.properties && {
      properties: Object.fromEntries(Object.entries(j.properties).map(([k, v]) => [k, cevir(v)])),
      required: j.required,
      propertyOrdering: Object.keys(j.properties),
    }),
    ...(j.items && { items: cevir(j.items) }),
    ...(j.minItems != null && { minItems: String(j.minItems) }),
    ...(j.maxItems != null && { maxItems: String(j.maxItems) }),
    ...(j.minimum != null && { minimum: j.minimum }),
    ...(j.maximum != null && { maximum: j.maximum }),
  });
  return cevir(z.toJSONSchema(schema) as JsonSema);
}
