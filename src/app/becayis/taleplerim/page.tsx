import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTaleplerim } from "@/lib/becayis";
import { TaleplerimList } from "@/components/TaleplerimList";

export const metadata = { title: "Mevcut Taleplerim — Kamu Yolu" };

export default async function TaleplerimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const talepler = await getTaleplerim(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Mevcut Taleplerim
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Becayiş taleplerin ve sana gelen mesajlar.
      </p>
      <div className="mt-6">
        <TaleplerimList
          talepler={talepler.map((t) => ({
            ...t,
            threads: t.threads.map((th) => ({
              ...th,
              mesajlar: th.mesajlar.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
            })),
          }))}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
