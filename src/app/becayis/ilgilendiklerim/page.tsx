import { Heart } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getIlgilendiklerim, getOkunmamisMesajSayisi } from "@/lib/becayis";
import { IlgilendiklerimList } from "@/components/IlgilendiklerimList";
import { ProfilLayout } from "@/components/ProfilLayout";

export const metadata = { title: "İlgilendiğim İlanlar — Kamu Yolu" };

export default async function IlgilendiklerimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [talepler, okunmamisSayisi] = await Promise.all([
    getIlgilendiklerim(user.id),
    getOkunmamisMesajSayisi(user.id),
  ]);
  const okunmamisIlgilendiklerimSayisi = talepler.reduce((sum, t) => sum + t.okunmamisSayisi, 0);

  return (
    <ProfilLayout
      okunmamisMesajSayisi={okunmamisSayisi}
      okunmamisIlgilendiklerimSayisi={okunmamisIlgilendiklerimSayisi}
    >
      <SayfaBasligi
        kompakt
        ikon={Heart}
        baslik="İlgilendiğim İlanlar"
        aciklama="Mesaj gönderdiğin becayiş ilanları ve o ilanlarla ilgili konuşmaların."
      />
      <div className="mt-6">
        <IlgilendiklerimList
          talepler={talepler.map((t) => ({
            ...t,
            mesajlar: t.mesajlar.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
          }))}
          currentUserId={user.id}
        />
      </div>
    </ProfilLayout>
  );
}
