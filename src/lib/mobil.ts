import type { Haber, Posting } from "@/generated/prisma/client";
import { INSTITUTION_TYPE_LABEL, LEVEL_LABEL } from "@/lib/labels";
import { duzgunHarf, kadroAdi, konumMetni, kurumLogolari, tekIlanKartlari, type IlanVitrinGrubu } from "@/lib/ilanVitrin";

/**
 * Mobil uygulamanin JSON uclari icin gorunum verisi. Sitedeki kartlarla AYNI
 * yardimcilar (duzgunHarf, kadroAdi, konumMetni, logo) kullanilir; uygulama
 * yalniz gosterir, hesaplamaz.
 */
export function ilanKarti(grup: IlanVitrinGrubu, logoUrl: string | null) {
  const { ilk } = grup;
  return {
    id: ilk.id,
    // Birden fazla ilan: ayni kurumun liste sayfasi acilir.
    kurumAdiHam: grup.ilanSayisi > 1 ? ilk.institutionName : null,
    ilanSayisi: grup.ilanSayisi,
    kadroFazlasi: Math.max(0, grup.kadroSayisi - 1),
    kurum: duzgunHarf(ilk.institutionName),
    kadro: kadroAdi(ilk.title, ilk.institutionName),
    kurumTuru: ilk.institutionType,
    kurumTuruAdi: INSTITUTION_TYPE_LABEL[ilk.institutionType] ?? "Kurum",
    yeni: grup.yeni,
    kalanGun: grup.kalanGun,
    duzeyler: ilk.educationLevels.map((d) => LEVEL_LABEL[d] ?? d).join(", "),
    konum: konumMetni(ilk.iller, ilk.institutionName),
    sonBasvuru: ilk.applicationEnd?.toISOString() ?? null,
    kaynak: ilk.sourceName,
    // Bos metin null olsun: uygulamada bos string Text disinda render edilirse ekran coker.
    nitelik: ilk.departmentRequirementRaw?.replace(/\s+/g, " ").trim().slice(0, 220) || null,
    logoUrl,
  };
}
export type MobilIlanKarti = ReturnType<typeof ilanKarti>;

/** Liste sayfalari: her ilan kendi karti (sitede tekIlanKartlari + kurumLogolari). */
export async function ilanKartlari(ilanlar: Posting[]) {
  const logolar = await kurumLogolari(ilanlar);
  return tekIlanKartlari(ilanlar).map((g) => ilanKarti(g, logolar.get(g.ilk.institutionName) ?? null));
}

export function haberKarti(h: Pick<Haber, "id" | "slug" | "baslik" | "ozet" | "gorselUrl" | "gorselLogoMu" | "yayinTarihi" | "kategori">) {
  return {
    slug: h.slug,
    baslik: h.baslik,
    ozet: h.ozet,
    gorselUrl: h.gorselUrl,
    gorselLogoMu: h.gorselLogoMu,
    kategori: h.kategori,
    yayinTarihi: h.yayinTarihi.toISOString(),
    // Sitedeki isYeni ile ayni esik: 3 gun.
    yeni: Date.now() - h.yayinTarihi.getTime() < 3 * 86_400_000,
  };
}
export type MobilHaberKarti = ReturnType<typeof haberKarti>;
