import { redirect } from "next/navigation";
import { Gift } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOkunmamisIlgilendiklerimSayisi, getOkunmamisMesajSayisi } from "@/lib/becayis";
import { ProfilLayout } from "@/components/ProfilLayout";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { DavetPaneli } from "@/components/DavetPaneli";

export const metadata = { title: "Arkadaşını Davet Et — Kamu Yolu" };

export default async function DavetPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?sonra=/profilim/davet");
  const [okunmamis, okunmamisIlgi] = await Promise.all([getOkunmamisMesajSayisi(user.id), getOkunmamisIlgilendiklerimSayisi(user.id)]);
  return (
    <ProfilLayout okunmamisMesajSayisi={okunmamis} okunmamisIlgilendiklerimSayisi={okunmamisIlgi}>
      <SayfaBasligi kompakt ikon={Gift} baslik="Arkadaşını Davet Et" aciklama="Davet ettiğin her arkadaşın için ikinize de 1 hafta Pro." />
      <DavetPaneli />
    </ProfilLayout>
  );
}
