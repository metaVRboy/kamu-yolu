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
