import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOkunmamisMesajSayisi } from "@/lib/becayis";
import { BecayisTalepForm } from "@/components/BecayisTalepForm";
import { ProfilLayout } from "@/components/ProfilLayout";

export const metadata = { title: "Becayiş Talebi Oluştur — Kamu Yolu" };

export default async function BecayisTalepOlusturPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const okunmamisSayisi = await getOkunmamisMesajSayisi(user.id);

  return (
    <ProfilLayout okunmamisMesajSayisi={okunmamisSayisi}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Becayiş Talebi Oluştur
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Talebin herkese açık olarak listelenir; iletişim bilgilerin gizli kalır, ilgilenenler
        sana site üzerinden mesaj gönderir.
      </p>
      <div className="mt-6">
        <BecayisTalepForm />
      </div>
    </ProfilLayout>
  );
}
