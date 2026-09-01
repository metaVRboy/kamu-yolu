import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOkunmamisMesajSayisi } from "@/lib/becayis";
import { ProfilLayout } from "@/components/ProfilLayout";
import { AbonelikPlanlari } from "@/components/AbonelikPlanlari";

export const metadata = { title: "Aboneliğim — Kamu Yolu" };

export default async function AbonelikPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const okunmamisSayisi = await getOkunmamisMesajSayisi(user.id);

  return (
    <ProfilLayout okunmamisMesajSayisi={okunmamisSayisi}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Aboneliğim</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Planını yönet, ihtiyacına göre yükselt.
      </p>

      <div className="mt-6">
        <AbonelikPlanlari mevcutPlan={user.abonelikPlani} />
      </div>
    </ProfilLayout>
  );
}
