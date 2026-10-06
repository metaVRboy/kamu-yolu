import { FilePlus2 } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOkunmamisIlgilendiklerimSayisi, getOkunmamisMesajSayisi } from "@/lib/becayis";
import { BecayisTalepForm } from "@/components/BecayisTalepForm";
import { ProfilLayout } from "@/components/ProfilLayout";

export const metadata = { title: "Becayiş Talebi Oluştur — Kamu Yolu" };

export default async function BecayisTalepOlusturPage() {
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
        ikon={FilePlus2}
        baslik="Becayiş Talebi Oluştur"
        aciklama="Talebin herkese açık olarak listelenir; iletişim bilgilerin gizli kalır, ilgilenenler sana site üzerinden mesaj gönderir."
      />
      <div className="mt-6">
        <BecayisTalepForm />
      </div>
    </ProfilLayout>
  );
}
