import { ProfilSidebar } from "@/components/ProfilSidebar";

export function ProfilLayout({
  children,
  okunmamisMesajSayisi,
}: {
  children: React.ReactNode;
  okunmamisMesajSayisi: number;
}) {
  return (
    <div className="mx-auto grid max-w-4xl gap-6 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[220px_1fr] lg:items-start">
      <aside className="lg:sticky lg:top-24">
        <ProfilSidebar okunmamisMesajSayisi={okunmamisMesajSayisi} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
