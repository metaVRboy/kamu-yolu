import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { kisiselOzet } from "@/lib/kisiselOzet";
import { KAYIT_HEDIYE_GUN } from "@/lib/proHediye";

export type BantMesaji = {
  /** Kapatma anahtari: ayni tur mesaj kapatilinca 24 saat gorunmez, farkli tur gelirse gorunur. */
  tur: string;
  once: string;
  vurgu: string;
  sonra: string;
  cta: { etiket: string; eylem: "kayit" | "yukselt" | "link"; href?: string; plan?: "PRO" | "PRO_PLUS" };
} | null;

const GUN_MS = 86_400_000;

/**
 * Header altindaki Pro bandinin mesaji, uyenin gercek durumundan. Iddialar dogrulanabilir olmali: SMS saglayicisi
 * canliya alinana kadar "SMS" vaat edilmez ("anında haberin olur" = site/uygulama bildirimi). Pro+ uyeye bant yok.
 */
export async function GET() {
  const user = await getCurrentUser();
  const yanit = (m: BantMesaji) => NextResponse.json({ mesaj: m }, { headers: { "Cache-Control": "private, no-store" } });

  if (!user) {
    return yanit({
      tur: "misafir",
      once: "Bölümüne uygun kamu ilanlarını kaçırma. Ücretsiz üye ol, ",
      vurgu: `${KAYIT_HEDIYE_GUN} gün Pro`,
      sonra: " hediye.",
      cta: { etiket: "Ücretsiz üye ol", eylem: "kayit" },
    });
  }
  if (user.abonelikPlani === "PRO_PLUS") return yanit(null);

  if (user.abonelikPlani === "PRO") {
    const kalan = user.abonelikBitis ? Math.ceil((user.abonelikBitis.getTime() - Date.now()) / GUN_MS) : null;
    if (kalan !== null && kalan <= 7) {
      return yanit({
        tur: "pro-bitiyor",
        once: "Pro üyeliğinin bitmesine ",
        vurgu: `${kalan} gün`,
        sonra: " kaldı. Bitince sana özel ilanlar ve bildirimler kapanır.",
        cta: { etiket: "Pro'da kal", eylem: "yukselt", plan: "PRO" },
      });
    }
    return yanit({
      tur: "pro-plus",
      once: "Pro+ ile ",
      vurgu: "konu konu eksiklerini",
      sonra: " gör, sınırsız deneme çöz.",
      cta: { etiket: "Pro+'yı incele", eylem: "yukselt", plan: "PRO_PLUS" },
    });
  }

  if (!user.departmentId) {
    return yanit({
      tur: "bolum-sec",
      once: "Bölümünü seç, ",
      vurgu: "sana uygun ilanları",
      sonra: " her gün tek yerde gösterelim.",
      cta: { etiket: "Bölümümü seç", eylem: "link", href: "/profilim/ayarlar" },
    });
  }
  const ozet = await kisiselOzet(user.departmentId);
  if (ozet && ozet.kacirilan30 > 0) {
    return yanit({
      tur: "kacirilan",
      once: "Son 30 günde bölümüne uygun ",
      vurgu: `${ozet.kacirilan30} ilanın son başvurusu geçti`,
      sonra: ". Pro'da yeni ilan çıkınca anında haberin olur.",
      cta: { etiket: "Pro'yu incele", eylem: "yukselt", plan: "PRO" },
    });
  }
  if (ozet && ozet.yeni7 > 0) {
    return yanit({
      tur: "yeni",
      once: "Bölümüne bu hafta ",
      vurgu: `${ozet.yeni7} yeni ilan`,
      sonra: " eşleşti. Pro ile her yeni ilanda anında haberin olsun.",
      cta: { etiket: "Pro'yu incele", eylem: "yukselt", plan: "PRO" },
    });
  }
  return yanit({
    tur: "genel",
    once: "Pro ile ",
    vurgu: "bölümüne özel ilanlar",
    sonra: ", KPSS ders karnen ve soru çözümlerin tek yerde.",
    cta: { etiket: "Pro'yu incele", eylem: "yukselt", plan: "PRO" },
  });
}
