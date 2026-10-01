import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { AuthSplitPanel } from "@/components/AuthSplitPanel";

export const metadata = { title: "Giriş Yap — Kamu Yolu" };

export default function GirisPage() {
  return (
    <div className="px-4 sm:px-6">
      <AuthSplitPanel
        baslik="Tekrar hoş geldin."
        aciklama="Hesabına giriş yap, bölümüne uygun ilanları ve bildirimleri kaldığın yerden takip et."
      >
        <div className="w-full max-w-sm">
          <Suspense fallback={null}>
            <AuthForm mode="giris" />
          </Suspense>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hesabın yok mu?{" "}
            <Link href="/kayit-ol" className="font-medium text-primary hover:underline">
              Kayıt ol
            </Link>
          </p>
        </div>
      </AuthSplitPanel>
    </div>
  );
}
