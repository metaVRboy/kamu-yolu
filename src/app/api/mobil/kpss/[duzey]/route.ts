import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  denemeyiBitir,
  getBugununDenemesi,
  getDenemeSorulari,
  getKatilim,
  haftalikHak,
  kalanSureMs,
  oncekiDenemeOzeti,
  sinavaGuvenliHaleGetir,
} from "@/lib/kpssDeneme";
import { gecerliDenemeDuzeyiMi } from "@/lib/kpssDenemeSabitler";

const KISA_GUN = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", timeZone: "UTC" }); // GunlukDeneme.tarih UTC gece yarisi

/**
 * Mobil duzey ekrani: sitedeki /kpss-denemesi/[duzey] sayfasinin durum makinesi.
 * Gizlilik kurallari sayfayla AYNI: sinav surerken dogru cevap gitmez; ucretsizde rapor
 * ornek veriyle (gercek cevap/aciklama gitmez); konu bilgisi yalniz Pro+.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ duzey: string }> }) {
  const duzey = (await params).duzey.toUpperCase();
  if (!gecerliDenemeDuzeyiMi(duzey)) return NextResponse.json({ error: "Düzey bulunamadı." }, { status: 404 });

  let gunluk;
  try {
    gunluk = await getBugununDenemesi(duzey);
  } catch {
    return NextResponse.json({ durum: "hazir-degil" });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ durum: "giris-yok" });
  const plan = user.abonelikPlani;

  let katilim = await getKatilim(user.id, gunluk.id);
  // Sure dolmus ama bitirilmemis (uygulama kapandi): otomatik sonuclandir.
  if (katilim && !katilim.bitisZamani && kalanSureMs(katilim.baslangicZamani) <= 0) {
    katilim = await denemeyiBitir(katilim.id, user.id);
  }
  if (!katilim) return NextResponse.json({ durum: "baslamadi", plan, hak: await haftalikHak(user.id, plan) });

  const sorular = await getDenemeSorulari(gunluk.soruIdler);
  if (!katilim.bitisZamani) {
    return NextResponse.json({
      durum: "suruyor",
      katilimId: katilim.id,
      kalanMs: kalanSureMs(katilim.baslangicZamani),
      sorular: sinavaGuvenliHaleGetir(sorular),
      cevaplar: katilim.cevaplar,
    });
  }

  const ucretsiz = plan === "UCRETSIZ";
  const raporSorulari = sinavaGuvenliHaleGetir(sorular).map((s, i) => ({
    ...s,
    konu: plan === "PRO_PLUS" ? sorular[i].konu : null,
    dogruCevap: ucretsiz ? i % 5 : sorular[i].dogruCevap,
    aciklama: ucretsiz ? null : sorular[i].aciklama,
  }));
  const raporCevaplari = ucretsiz
    ? Object.fromEntries(sorular.flatMap((s, i) => (i % 6 === 5 ? [] : [[s.id, i % 4 === 3 ? (i + 1) % 5 : i % 5]])))
    : katilim.cevaplar;
  const onceki = plan === "PRO_PLUS" ? await oncekiDenemeOzeti(user.id, duzey, katilim.id) : null;
  return NextResponse.json({
    durum: "bitti",
    plan,
    sorular: raporSorulari,
    cevaplar: raporCevaplari,
    dogru: katilim.dogruSayisi ?? 0,
    yanlis: katilim.yanlisSayisi ?? 0,
    bos: katilim.bosSayisi ?? 0,
    puan: katilim.puan ?? 0,
    onceki: onceki && { tarihMetni: KISA_GUN.format(onceki.tarih), net: onceki.net, puan: onceki.puan, dersNetleri: onceki.dersNetleri, konuDurumlari: onceki.konuDurumlari },
  });
}
