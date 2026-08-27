import { SifremiUnuttumForm } from "@/components/SifremiUnuttumForm";

export const metadata = { title: "Şifremi Unuttum — Kamu Yolu" };

export default function SifremiUnuttumPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6 sm:py-20">
      <SifremiUnuttumForm />
    </div>
  );
}
