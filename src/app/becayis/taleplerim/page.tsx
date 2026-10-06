import { Inbox } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOkunmamisIlgilendiklerimSayisi, getTaleplerim } from "@/lib/becayis";
import { TaleplerimList } from "@/components/TaleplerimList";
import { ProfilLayout } from "@/components/ProfilLayout";

export const metadata = { title: "Mevcut Taleplerim — Kamu Yolu" };

export default async function TaleplerimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [talepler, okunmamisIlgilendiklerimSayisi] = await Promise.all([
    getTaleplerim(user.id),
    getOkunmamisIlgilendiklerimSayisi(user.id),
  ]);
  const okunmamisSayisi = talepler.reduce(
    (sum, t) => sum + t.threads.reduce((s, th) => s + th.okunmamisSayisi, 0),
    0,
  );

  return (
    <ProfilLayout
      okunmamisMesajSayisi={okunmamisSayisi}
      okunmamisIlgilendiklerimSayisi={okunmamisIlgilendiklerimSayisi}
    >
      <SayfaBasligi
        kompakt
        ikon={Inbox}
        baslik="Mevcut Taleplerim"
        aciklama="Becayiş taleplerin ve sana gelen mesajlar."
      />
      <div className="mt-6">
        <TaleplerimList
          talepler={talepler.map((t) => ({
            ...t,
            threads: t.threads.map((th) => ({
              ...th,
              mesajlar: th.mesajlar.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
            })),
          }))}
          currentUserId={user.id}
        />
      </div>
    </ProfilLayout>
  );
}
