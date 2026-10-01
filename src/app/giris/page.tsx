import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { AuthSplitPanel, GirisBasligi } from "@/components/AuthSplitPanel";

export const metadata = { title: "Giriş Yap — Kamu Yolu" };

export default function GirisPage() {
  return (
    <div className="my-8 px-4 sm:my-14 sm:px-6">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border shadow-xl">
        <AuthSplitPanel
          baslik={<GirisBasligi />}
          aciklama="Hesabına giriş yap, bölümüne uygun ilanları ve bildirimleri kaldığın yerden takip et."
        >
          <Suspense fallback={null}>
            <AuthForm mode="giris" />
          </Suspense>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hesabın yok mu?{" "}
            <Link href="/kayit-ol" className="font-medium text-primary hover:underline">
              Kayıt ol
            </Link>
          </p>
        </AuthSplitPanel>
      </div>
    </div>
  );
}
