import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Tum arastirma/siniflandirma cagrilari icin tek model: ucuz, Google Search
// grounding + yapilandirilmis JSON ciktisini ayni cagride destekliyor.
export const GEMINI_MODEL = "gemini-3.6-flash";
