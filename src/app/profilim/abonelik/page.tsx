import { Crown } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOkunmamisIlgilendiklerimSayisi, getOkunmamisMesajSayisi } from "@/lib/becayis";
import { ProfilLayout } from "@/components/ProfilLayout";
import { AbonelikPlanlari } from "@/components/AbonelikPlanlari";

export const metadata = { title: "Aboneliğim — Kamu Yolu" };

export default async function AbonelikPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

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

      <div className="mt-6">
        <AbonelikPlanlari mevcutPlan={user.abonelikPlani} />
      </div>
    </ProfilLayout>
  );
}
