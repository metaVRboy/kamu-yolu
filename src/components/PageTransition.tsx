"use client";

import { usePathname } from "next/navigation";

// key={pathname} sayesinde her yeni sayfada bu div yeniden mount edilir,
// boylece CSS animasyonu (asagidan yukariya kayarak belirme) her navigasyonda
// tekrar tetiklenir - ayni elemanin icerigi degismesiyle degil.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-fade-up">
      {children}
    </div>
  );
}
