import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOkunmamisMesajSayisi } from "@/lib/becayis";
import { ProfilForm } from "@/components/ProfilForm";
import { ProfilLayout } from "@/components/ProfilLayout";
import { SifreDegistirForm } from "@/components/SifreDegistirForm";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Ayarlar — Kamu Yolu" };

export default async function ProfilAyarlarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [departments, okunmamisSayisi] = await Promise.all([
    prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    getOkunmamisMesajSayisi(user.id),
  ]);

  return (
    <ProfilLayout okunmamisMesajSayisi={okunmamisSayisi}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ayarlar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Hesap ve profil bilgilerini buradan yönetebilirsin.
      </p>

      <Card className="mt-6 border-primary/20 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">Bilgilerim</h2>
        <ProfilForm
          departments={departments}
          initial={{
            telefon: user.telefon,
            meslek: user.meslek,
            kurumTuru: user.kurumTuru,
            kamuCalisaniDegil: user.kamuCalisaniDegil,
            departmentId: user.departmentId,
            educationLevel: user.educationLevel,
          }}
        />
      </Card>

      <Card className="mt-6 border-primary/20 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">Şifre Değiştir</h2>
        <SifreDegistirForm />
      </Card>
    </ProfilLayout>
  );
}
