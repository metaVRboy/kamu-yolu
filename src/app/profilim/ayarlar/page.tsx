import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profilFotografiUrl } from "@/lib/profil";
import { ProfilForm } from "@/components/ProfilForm";
import { AyarKarti, AyarlarSayfasi, tarihMetni } from "@/components/AyarlarSayfasi";
import { EpostaDegistirForm, ProfilFotografi } from "@/components/HesapAyarlari";

export const metadata = { title: "Ayarlar — Kamu Yolu" };

const PLAN_ADI = { UCRETSIZ: "Ücretsiz", PRO: "Pro", PRO_PLUS: "Pro+" } as const;

export default async function ProfilAyarlarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [departments, fotografUrl] = await Promise.all([
    prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    profilFotografiUrl(user.id),
  ]);
  const girisYontemleri = [user.passwordHash && "E-posta ve şifre", user.googleId && "Google"].filter(Boolean).join(", ");

  return (
    <AyarlarSayfasi userId={user.id}>
      <AyarKarti baslik="Profil fotoğrafı" aciklama="Fotoğrafın sitenin üst menüsünde adının yanında görünür.">
        <ProfilFotografi adSoyad={user.adSoyad} ilkUrl={fotografUrl} />
      </AyarKarti>

      <AyarKarti baslik="Bilgilerim">
        <ProfilForm
          departments={departments}
          initial={{
            adSoyad: user.adSoyad,
            telefon: user.telefon,
            meslek: user.meslek,
            kurumTuru: user.kurumTuru,
            kamuCalisaniDegil: user.kamuCalisaniDegil,
            departmentId: user.departmentId,
            educationLevel: user.educationLevel,
          }}
        />
      </AyarKarti>

      <AyarKarti baslik="E-posta adresi" aciklama="Giriş yapmak ve hesap bildirimlerini almak için kullanılır. Değiştirirken yeni adrese doğrulama kodu gönderilir.">
        <EpostaDegistirForm email={user.email} sifreVar={!!user.passwordHash} />
      </AyarKarti>

      <AyarKarti baslik="Üyelik bilgileri">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Üyelik tarihi</dt>
            <dd className="font-semibold text-slate-800">{tarihMetni(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Giriş yöntemi</dt>
            <dd className="font-semibold text-slate-800">{girisYontemleri}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-semibold text-slate-800">
              {PLAN_ADI[user.abonelikPlani]}{" "}
              <Link href="/profilim/abonelik" className="text-xs font-medium text-primary hover:underline">
                Planları gör
              </Link>
            </dd>
          </div>
        </dl>
      </AyarKarti>
    </AyarlarSayfasi>
  );
}
