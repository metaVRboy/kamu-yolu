import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllHaberler } from "@/lib/haberler";
import { AdminHaberPanel } from "@/components/AdminHaberPanel";

export const metadata = { title: "Haber Yönetimi — Kamu Yolu" };

export default async function AdminHaberlerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (!user.isAdmin) redirect("/");

  const haberler = await getAllHaberler();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Haber Yönetimi
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Buradan yayınladığın haberler ana sayfadaki &quot;Haberler&quot; bölümünde ve
        /haberler sayfasında görünür.
      </p>
      <div className="mt-6">
        <AdminHaberPanel
          haberler={haberler.map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }))}
        />
      </div>
    </div>
  );
}
