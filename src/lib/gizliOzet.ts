import { createHmac } from "crypto";

/**
 * Sunucu anahtariyla HMAC. Kodlar/jetonlar db'de duz degil bununla saklanir: db ya da yedek sizsa
 * bile 10^6 olasilik denenerek kod cozulemez, sifirlama baglantisi kullanilamaz.
 */
export const gizliOzet = (amac: string, deger: string) => createHmac("sha256", process.env.SESSION_SECRET!).update(`${amac}:${deger}`).digest("hex");
