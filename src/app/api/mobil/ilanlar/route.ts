import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAllActivePostings,
  getAvailableFiltersForAll,
  getAvailableFiltersForDepartment,
  getAvailableFiltersForLevel,
  getPostingsForDepartment,
  getPostingsForLevel,
  type PostingFilters,
} from "@/lib/matching";
import { getHaberlerForDepartment } from "@/lib/haberler";
import { LEVEL_SLUG_TO_ENUM } from "@/lib/levels";
import { INSTITUTION_TYPE_LABEL, LEVEL_LABEL } from "@/lib/labels";
import { yakindaBitenler } from "@/lib/ilanVitrin";
import { haberKarti, ilanKartlari } from "@/lib/mobil";

/**
 * Sitedeki uc liste sayfasi tek uctan: kapsam=tum (/ilanlar), seviye (/seviye/[level]),
 * bolum (/bolum/[slug]). Filtre parametreleri sitedekiyle ayni adlarda.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const kapsam = p.get("kapsam") ?? "tum";
  const deger = p.get("deger") ?? "";
  const bolumSarti = p.get("bolumSarti");
  const filtre: PostingFilters = {
    institutionType: p.get("kurum") || undefined,
    ilanTuru: p.get("ilanTuru") || undefined,
    il: p.get("il") || undefined,
    departmentRequirement: bolumSarti === "var" || bolumSarti === "yok" ? bolumSarti : undefined,
    kurumAdi: p.get("kurumAdi") || undefined,
  };

  let baslik: string;
  let aciklama: string;
  let tumIlanlar, secenekler;
  let haberler: ReturnType<typeof haberKarti>[] = [];
  if (kapsam === "bolum") {
    const bolum = await prisma.department.findUnique({ where: { slug: deger } });
    if (!bolum) return NextResponse.json({ error: "Bölüm bulunamadı." }, { status: 404 });
    let ilgili;
    [tumIlanlar, secenekler, ilgili] = await Promise.all([
      getPostingsForDepartment(bolum.id, filtre),
      getAvailableFiltersForDepartment(bolum.id),
      getHaberlerForDepartment(bolum),
    ]);
    haberler = ilgili.map(haberKarti);
    baslik = `${bolum.name} mezunları için ilanlar`;
    aciklama = "Sadece bu bölüme özel şart koşan güncel kamu ilanları listelenir.";
  } else if (kapsam === "seviye") {
    const duzey = LEVEL_SLUG_TO_ENUM[deger];
    if (!duzey) return NextResponse.json({ error: "Düzey bulunamadı." }, { status: 404 });
    [tumIlanlar, secenekler] = await Promise.all([getPostingsForLevel(duzey, filtre), getAvailableFiltersForLevel(duzey)]);
    const ad = LEVEL_LABEL[duzey] ?? duzey;
    baslik = `${ad} mezunları için ilanlar`;
    aciklama = `${ad} mezunlarının başvurabileceği güncel kamu ilanları. Bazı ilanlar belirli bir bölüm mezunu olmayı şart koşar, bazıları koşmaz.`;
  } else {
    [tumIlanlar, secenekler] = await Promise.all([getAllActivePostings(filtre), getAvailableFiltersForAll()]);
    baslik = "Tüm İlanlar";
    aciklama = "Sistemdeki tüm güncel kamu personeli ve memur ilanları; her ilan kartında bölüm şartını ve son başvuru tarihini görebilirsin.";
  }

  const bitecekler = yakindaBitenler(tumIlanlar);
  const gosterilen = p.get("yakinda") === "1" ? bitecekler : tumIlanlar;
  return NextResponse.json({
    baslik,
    aciklama,
    ilanSayisi: tumIlanlar.length,
    kurumSayisi: new Set(tumIlanlar.map((i) => i.institutionName)).size,
    biteceklerSayisi: bitecekler.length,
    filtreler: {
      kurumTurleri: secenekler.institutionTypes.map((k) => ({ deger: k, ad: INSTITUTION_TYPE_LABEL[k] ?? k })),
      ilanTurleri: secenekler.ilanTurleri,
      iller: secenekler.iller,
    },
    ilanlar: await ilanKartlari(gosterilen),
    haberler,
  });
}
