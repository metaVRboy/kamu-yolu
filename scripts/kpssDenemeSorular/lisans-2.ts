/** KPSS Lisans 2. parti (120 soru): ders dosyalari, KONU_DAGILIMI sirasiyla. */
import { SORULAR as TURKCE } from "./lisans-2-turkce";
import { SORULAR as MATEMATIK } from "./lisans-2-matematik";
import { SORULAR as TARIH } from "./lisans-2-tarih";
import { SORULAR as COGRAFYA_VATANDASLIK } from "./lisans-2-cografya-vatandaslik";
import { SORULAR as GUNCEL } from "./lisans-2-guncel";

export const LISANS_2 = [...TURKCE, ...MATEMATIK, ...TARIH, ...COGRAFYA_VATANDASLIK, ...GUNCEL];
