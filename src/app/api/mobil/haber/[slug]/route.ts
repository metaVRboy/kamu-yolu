import { NextResponse } from "next/server";
import { getHaberBySlug, getLatestHaberler } from "@/lib/haberler";
import { haberSuresiGectiMi } from "@/lib/haberYayin";
import { LEVEL_LABEL } from "@/lib/labels";
import { SITE_URL } from "@/lib/site";
import { haberKarti } from "@/lib/mobil";

type HaberDetaylar = {
  neAciklandi: string | null;
  basvuruTakvimi: string | null;
  kimlerBasvurabilir: string | null;
  ozelSartlar: string | null;
  dikkatEdilmesiGerekenler: string | null;
  sss: { soru: string; cevap: string }[];
};

const tarih = (d: Date) => d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

/** Mobil haber detayi: sitedeki /haberler/[slug] sayfasinin verisi. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const h = await getHaberBySlug((await params).slug);
  if (!h) return NextResponse.json({ error: "Haber bulunamadı." }, { status: 404 });
  const d = h.detaylar as HaberDetaylar | null;
  const egitim = h.egitimSeviyeleri.length ? h.egitimSeviyeleri.map((l) => LEVEL_LABEL[l] ?? l).join(" / ") : null;
  const kontenjan = h.kontenjan ? `${h.kontenjan} kişi` : null;
  const bitis = h.basvuruBitis ? tarih(h.basvuruBitis) : null;
  const dolu = <T extends { deger: string | null }>(x: T[]) => x.filter((k) => k.deger) as (T & { deger: string })[];
  const diger = (await getLatestHaberler(6)).filter((x) => x.id !== h.id).slice(0, 4);

  return NextResponse.json({
    ...haberKarti(h),
    kaynakUrl: h.kaynakUrl,
    paylasimUrl: `${SITE_URL}/haberler/${h.slug}`,
    suresiGecti: haberSuresiGectiMi(h),
    bilgiKutulari: dolu([
      { etiket: "Kurum", deger: h.kurumAdi, vurgu: false },
      { etiket: "Kontenjan", deger: kontenjan, vurgu: false },
      { etiket: "Eğitim", deger: egitim, vurgu: false },
      { etiket: "KPSS Şartı", deger: h.kpssTuru, vurgu: false },
      { etiket: "Son Başvuru", deger: bitis, vurgu: true },
    ]),
    tablo: dolu([
      { etiket: "Kurum", deger: h.kurumAdi },
      { etiket: "Kadro / Pozisyon", deger: h.kadroPozisyon },
      { etiket: "Kontenjan", deger: kontenjan },
      { etiket: "Kategori", deger: h.kategori },
      { etiket: "İstihdam Türü", deger: h.istihdamTuru },
      { etiket: "Eğitim", deger: egitim },
      { etiket: "KPSS Türü", deger: h.kpssTuru },
      { etiket: "Üst Yaş", deger: h.ustYas ? String(h.ustYas) : null },
      { etiket: "Başvuru Başlangıcı", deger: h.basvuruBaslangic ? tarih(h.basvuruBaslangic) : null },
      { etiket: "Son Başvuru", deger: bitis },
    ]),
    ayrintilar: [
      { baslik: "Ne Açıklandı?", metin: d?.neAciklandi },
      { baslik: "Başvuru Takvimi", metin: d?.basvuruTakvimi },
      { baslik: "Kimler Başvurabilir?", metin: d?.kimlerBasvurabilir },
      { baslik: "Özel Şartlar", metin: d?.ozelSartlar },
      { baslik: "Dikkat Edilmesi Gerekenler", metin: d?.dikkatEdilmesiGerekenler },
    ].filter((b) => b.metin),
    sss: d?.sss ?? [],
    benzerler: diger.map(haberKarti),
  });
}
