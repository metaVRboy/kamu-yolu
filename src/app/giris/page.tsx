import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Giriş Yap — Kamu Yolu" };

export default function GirisPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6 sm:py-20">
      <AuthForm mode="giris" />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Hesabın yok mu?{" "}
        <Link href="/kayit-ol" className="font-medium text-primary hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
