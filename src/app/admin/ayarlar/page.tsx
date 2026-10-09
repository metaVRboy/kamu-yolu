import { adminSayfasi } from "@/lib/admin";
import { getSiteAyarlari } from "@/lib/siteAyarlari";
import { AdminBaslik } from "@/components/admin/AdminUI";
import { AdminAyarlarForm } from "@/components/admin/AdminAyarlarForm";

export const metadata = { title: "Site ayarları — Admin" };

export default async function AdminAyarlarPage() {
  await adminSayfasi();
  return (
    <>
      <AdminBaslik baslik="Site ayarları" aciklama="Bakım modu ve tüm sayfalarda görünen duyuru şeridi." />
      <AdminAyarlarForm baslangic={await getSiteAyarlari()} />
    </>
  );
}
