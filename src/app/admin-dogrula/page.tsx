import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { adminDurumu } from "@/lib/admin";
import { AdminKodFormu } from "@/components/admin/AdminKodFormu";

export const metadata = { title: "Admin doğrulama — Kamu Yolu", robots: { index: false } };

/** Admin iki asamali dogrulama: panele girmeden once e-postaya gelen kod (admin layout'unun disinda). */
export default async function AdminDogrulaPage() {
  const { user, dogrulandi, oturumId } = await adminDurumu();
  if (!user) redirect("/giris");
  if (!user.isAdmin) redirect("/");
  if (dogrulandi) redirect("/admin");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Admin doğrulaması</h1>
        {oturumId ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Güvenlik için admin paneline girmeden önce <b className="text-slate-800">{user.email}</b> adresine gönderilen 6 haneli kodu girmen gerekiyor. Doğrulama bu cihazda 12 saat geçerli.
            </p>
            <AdminKodFormu />
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-700">Oturumun eski bir girişten kalma. Güvenlik için çıkış yapıp tekrar giriş yap, sonra panele dön.</p>
        )}
      </div>
    </div>
  );
}
