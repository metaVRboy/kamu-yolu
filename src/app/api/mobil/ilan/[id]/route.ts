import { NextResponse } from "next/server";
import { getBenzerIlanlar, getPostingById } from "@/lib/matching";
import { INSTITUTION_TYPE_LABEL, LEVEL_LABEL } from "@/lib/labels";
import { SITE_URL } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { basvuruIlerlemesi, duzgunHarf, kadroAdi, kalanGunSayisi, konumMetni, kurumLogolari, nitelikMaddeleri, tekIlanKartlari } from "@/lib/ilanVitrin";
import { ilanKarti } from "@/lib/mobil";

/** Mobil ilan detayi: sitedeki /ilan/[id]/[slug] sayfasinin verisi. Uygunluk kutusu mevcut /api/ilan/[id]/uygunluk ucundan gelir. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPostingById(id);
  if (!p) return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
  const benzerler = await getBenzerIlanlar(p);
  const logolar = await kurumLogolari([p, ...benzerler]);
  return NextResponse.json({
    id: p.id,
    kadro: kadroAdi(p.title, p.institutionName),
    kurum: duzgunHarf(p.institutionName),
    kurumTuru: p.institutionType,
    kurumTuruAdi: INSTITUTION_TYPE_LABEL[p.institutionType] ?? "Kurum",
    ilanTuru: p.ilanTuru,
    bolumSartiYok: !p.isDepartmentRestricted,
    aktif: p.isActive,
    logoUrl: logolar.get(p.institutionName) ?? null,
    kalanGun: kalanGunSayisi(p.applicationEnd),
    sonBasvuru: p.applicationEnd?.toISOString() ?? null,
    basvuruBaslangici: p.applicationStart?.toISOString() ?? null,
    ilerleme: basvuruIlerlemesi(p.applicationStart, p.applicationEnd),
    konum: konumMetni(p.iller, p.institutionName),
    duzeyler: p.educationLevels.map((l) => LEVEL_LABEL[l] ?? l).join(", "),
    kaynak: p.sourceName,
    kaynakUrl: p.sourceUrl,
    takvimUrl: p.applicationEnd ? `${SITE_URL}/api/ilan/${p.id}/takvim` : null,
    paylasimUrl: `${SITE_URL}/ilan/${p.id}/${slugify(p.title)}`,
    maddeler: p.departmentRequirementRaw ? nitelikMaddeleri(p.departmentRequirementRaw) : [],
    bolumler: p.departments.map((d) => ({ slug: d.department.slug, ad: d.department.name })),
    benzerler: tekIlanKartlari(benzerler).map((g) => ilanKarti(g, logolar.get(g.ilk.institutionName) ?? null)),
  });
}
