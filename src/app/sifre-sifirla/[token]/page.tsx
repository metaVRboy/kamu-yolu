import { SifreSifirlaForm } from "@/components/SifreSifirlaForm";

export const metadata = { title: "Şifre Sıfırla — Kamu Yolu" };

export default async function SifreSifirlaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6 sm:py-20">
      <SifreSifirlaForm token={token} />
    </div>
  );
}
