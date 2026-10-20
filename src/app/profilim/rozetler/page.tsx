import { redirect } from "next/navigation";
import { Award, Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOkunmamisIlgilendiklerimSayisi, getOkunmamisMesajSayisi } from "@/lib/becayis";
import { rozetDurumu } from "@/lib/rozetler";
import { ProfilLayout } from "@/components/ProfilLayout";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { ROZET_RENGI } from "@/lib/rozetRenkleri";
import { cn } from "@/lib/utils";

export const metadata = { title: "Rozetlerim — Kamu Yolu" };

export default async function RozetlerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?sonra=/profilim/rozetler");

  const [okunmamis, okunmamisIlgi, durum] = await Promise.all([
    getOkunmamisMesajSayisi(user.id),
    getOkunmamisIlgilendiklerimSayisi(user.id),
    rozetDurumu(user),
  ]);
  const kazanilan = durum.rozetler.filter((r) => r.kazanildi).length;

  return (
    <ProfilLayout okunmamisMesajSayisi={okunmamis} okunmamisIlgilendiklerimSayisi={okunmamisIlgi}>
      <SayfaBasligi
        kompakt
        ikon={Award}
        baslik="Rozetlerim"
        aciklama={`${durum.rozetler.length} rozetten ${kazanilan} tanesini kazandın. Rozetler deneme, günün soruları ve profil etkinliğinden kendiliğinden gelir.`}
      />
      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {durum.rozetler.map((r) => (
          <li
            key={r.id}
            className={cn("flex items-start gap-3 rounded-2xl border p-4", r.kazanildi ? "border-primary/15 bg-white shadow-sm" : "border-dashed border-slate-200 bg-slate-50")}
          >
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", r.kazanildi ? ROZET_RENGI[r.renk] : "bg-slate-200 text-slate-500")}>
              {r.kazanildi ? <Award className="h-5 w-5" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
            </span>
            <div className="min-w-0">
              <p className={cn("font-semibold", r.kazanildi ? "text-slate-900" : "text-slate-500")}>
                {r.ad}
                <span className="sr-only">{r.kazanildi ? " (kazanıldı)" : " (henüz kazanılmadı)"}</span>
              </p>
              <p className="text-sm text-muted-foreground">{r.aciklama}</p>
              {r.id === "pro" && !r.kazanildi && (
                <YukseltButonu plan="PRO" kaynak="genel" className="mt-1 text-sm font-semibold text-primary hover:underline">
                  Pro&apos;ya geç
                </YukseltButonu>
              )}
            </div>
          </li>
        ))}
      </ul>
    </ProfilLayout>
  );
}
