import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminIlanForm } from "@/components/admin/AdminIlanForm";

export const metadata = { title: "Elle ilan ekle — Admin" };

export default async function AdminIlanYeniPage() {
  await adminSayfasi();
  const bolumler = await prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, level: true } });
  return (
    <>
      <AdminBaslik baslik="Elle ilan ekle" aciklama="Taramanın bulamadığı resmi ilanı ekle. Bölüm seçersen o bölümdeki Pro üyelere bildirim gider." />
      <AdminKart>
        <AdminIlanForm
          bolumler={bolumler}
          baslangic={{ title: "", institutionName: "", institutionType: "BAKANLIK", applicationEnd: null, educationLevels: ["LISANS"], isDepartmentRestricted: true, departmentIds: [], sourceUrl: "" }}
        />
      </AdminKart>
    </>
  );
}
