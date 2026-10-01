import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { AuthSplitPanel } from "@/components/AuthSplitPanel";

export const metadata = { title: "Kayıt Ol — Kamu Yolu" };

export default function KayitOlPage() {
  return (
    <div className="my-8 px-4 sm:my-14 sm:px-6">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border shadow-xl">
        <AuthSplitPanel
          baslik="Bölümüne uygun ilanları kaçırma."
          aciklama="Ücretsiz hesap oluştur; bölümüne göre eşleşen ilanları ve haberleri tek yerden takip et."
        >
          <Suspense fallback={null}>
            <AuthForm mode="kayit" />
          </Suspense>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Zaten hesabın var mı?{" "}
            <Link href="/giris" className="font-medium text-primary hover:underline">
              Giriş yap
            </Link>
          </p>
        </AuthSplitPanel>
      </div>
    </div>
  );
}
