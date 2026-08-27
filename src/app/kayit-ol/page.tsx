import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Kayıt Ol — Kamu Yolu" };

export default function KayitOlPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6 sm:py-20">
      <AuthForm mode="kayit" />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-medium text-primary hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
