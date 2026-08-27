import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BecayisTalepForm } from "@/components/BecayisTalepForm";

export const metadata = { title: "Becayiş Talebi Oluştur — Kamu Yolu" };

export default async function BecayisTalepOlusturPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
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
    </div>
  );
}
