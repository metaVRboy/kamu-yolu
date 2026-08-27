import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOkunmamisMesajSayisi } from "@/lib/becayis";
import { ProfilForm } from "@/components/ProfilForm";
import { ProfilLayout } from "@/components/ProfilLayout";
import { LogoutButton } from "@/components/LogoutButton";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Profilim — Kamu Yolu" };

export default async function ProfilimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [departments, okunmamisSayisi] = await Promise.all([
    prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    getOkunmamisMesajSayisi(user.id),
  ]);

  return (
    <ProfilLayout okunmamisMesajSayisi={okunmamisSayisi}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profilim</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.adSoyad} — {user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <Card className="mt-6 border-primary/20 bg-white/70 p-6 backdrop-blur-md">
        <h2 className="mb-4 font-semibold text-slate-900">Bilgilerim</h2>
        <ProfilForm
          departments={departments}
          initial={{
            telefon: user.telefon,
            meslek: user.meslek,
            kurumTuru: user.kurumTuru,
            departmentId: user.departmentId,
            educationLevel: user.educationLevel,
          }}
        />
      </Card>
    </ProfilLayout>
  );
}
