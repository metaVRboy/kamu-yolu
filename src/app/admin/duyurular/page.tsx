import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getGenelDuyurular } from "@/lib/notifications";
import { AdminDuyuruPanel } from "@/components/AdminDuyuruPanel";

export const metadata = { title: "Duyuru Yönetimi — Kamu Yolu" };

export default async function AdminDuyurularPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (!user.isAdmin) redirect("/");

  const duyurular = await getGenelDuyurular();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Duyuru Yönetimi
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Buradan yayınladığın duyurular, tüm kullanıcıların bildirim kutusunda &quot;Genel&quot;
        sekmesinde görünür.
      </p>
      <div className="mt-6">
        <AdminDuyuruPanel
          duyurular={duyurular.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
        />
      </div>
    </div>
  );
}
