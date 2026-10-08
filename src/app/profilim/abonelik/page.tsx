import { Crown } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOkunmamisIlgilendiklerimSayisi, getOkunmamisMesajSayisi } from "@/lib/becayis";
import { ProfilLayout } from "@/components/ProfilLayout";
import { AbonelikPlanlari } from "@/components/AbonelikPlanlari";
import { cn } from "@/lib/utils";
import { kalanGunSayisi } from "@/lib/ilanVitrin";

export const metadata = { title: "Aboneliğim — Kamu Yolu" };

const PLAN_ADI = { UCRETSIZ: "Standart", PRO: "Pro", PRO_PLUS: "Pro+" } as const;
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

export default async function AbonelikPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const ucretli = user.abonelikPlani !== "UCRETSIZ"; // getCurrentUser suresi dolani UCRETSIZ dondurur
  const kalanGun = kalanGunSayisi(user.abonelikBitis);

  const [okunmamisSayisi, okunmamisIlgilendiklerimSayisi] = await Promise.all([
    getOkunmamisMesajSayisi(user.id),
    getOkunmamisIlgilendiklerimSayisi(user.id),
  ]);

  return (
    <ProfilLayout
      okunmamisMesajSayisi={okunmamisSayisi}
      okunmamisIlgilendiklerimSayisi={okunmamisIlgilendiklerimSayisi}
    >
      <SayfaBasligi
        kompakt
        ikon={Crown}
        baslik="Aboneliğim"
        aciklama="Planını yönet, ihtiyacına göre yükselt."
      />

      <section className="mt-6 rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Mevcut planın</p>
            <p className="mt-1 flex items-center gap-2 font-sans text-xl font-bold text-slate-900">
              {PLAN_ADI[user.abonelikPlani]}
              {ucretli && <Crown className="h-5 w-5 text-amber-500" />}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {!ucretli
                ? "Ücretsiz plandasın. Pro ile SMS bildirimleri, becayiş mesajlaşması ve KPSS deneme raporları açılır."
                : user.abonelikBitis
                  ? `${TARIH.format(user.abonelikBitis)} tarihine kadar geçerli (${kalanGun} gün kaldı).`
                  : "Süresiz (yönetici tarafından tanımlandı)."}
            </p>
          </div>
          {ucretli && (
            <div className="max-w-sm rounded-2xl border border-primary/10 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-800">Otomatik yenileme</span>
                {/* Odeme altyapisi gelene kadar salt-okunur; tercih DB'de hazir (otomatikYenileme). */}
                <span
                  role="switch"
                  aria-checked={user.otomatikYenileme}
                  aria-disabled
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full opacity-60 transition-colors",
                    user.otomatikYenileme ? "bg-primary" : "bg-slate-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      user.otomatikYenileme ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Ödeme altyapısı aktif olunca buradan açıp kapatabileceksin. Kapatırsan aboneliğin hemen bitmez; ödediğin dönemin
                sonuna kadar tüm özellikleri kullanmaya devam edersin.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mt-8">
        <AbonelikPlanlari mevcutPlan={user.abonelikPlani} />
      </div>
    </ProfilLayout>
  );
}
