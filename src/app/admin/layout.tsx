import type { ReactNode } from "react";
import { adminSayfasi } from "@/lib/admin";
import { AdminMenu } from "@/components/admin/AdminMenu";

export const metadata = { title: "Admin Paneli — Kamu Yolu", robots: { index: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await adminSayfasi();
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
      <AdminMenu />
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
    </div>
  );
}
