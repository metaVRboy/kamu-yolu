import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { AuthSplitPanel } from "@/components/AuthSplitPanel";

export const metadata = { title: "Kayıt Ol — Kamu Yolu" };

export default function KayitOlPage() {
  return (
    <div className="px-4 sm:px-6">
      <AuthSplitPanel
        baslik="Bölümüne uygun ilanları kaçırma."
        aciklama="Ücretsiz hesap oluştur; bölümüne göre eşleşen ilanları ve haberleri tek yerden takip et."
      >
        <div className="w-full max-w-sm">
          <Suspense fallback={null}>
            <AuthForm mode="kayit" />
          </Suspense>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Zaten hesabın var mı?{" "}
            <Link href="/giris" className="font-medium text-primary hover:underline">
              Giriş yap
            </Link>
          </p>
        </div>
      </AuthSplitPanel>
    </div>
  );
}
