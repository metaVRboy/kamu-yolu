import Link from "next/link";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { AyarKarti, AyarlarSayfasi, tarihMetni } from "@/components/AyarlarSayfasi";
import { HesapSilForm } from "@/components/HesapAyarlari";

export const metadata = { title: "Gizlilik ve KVKK — Kamu Yolu" };

export default async function GizlilikAyarlariPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  return (
    <AyarlarSayfasi userId={user.id}>
      <AyarKarti baslik="KVKK onayın">
        <p className="text-sm text-slate-700">
          {user.kvkkOnayTarihi ? (
            <>
              <Link href="/kvkk" className="font-semibold text-primary hover:underline">
                KVKK Aydınlatma Metni ve Gizlilik Politikası
              </Link>
              &apos;nı <strong>{tarihMetni(user.kvkkOnayTarihi)}</strong> tarihinde onayladın.
            </>
          ) : (
            <>
              Hesabın onay tarihinin kaydedilmeye başlandığı tarihten önce açıldığı için onay tarihi kayıtlı değil. Metne{" "}
              <Link href="/kvkk" className="font-semibold text-primary hover:underline">
                buradan
              </Link>{" "}
              ulaşabilirsin.
            </>
          )}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Onayını geri çekmek istersen aşağıdan hesabını silebilirsin; kişisel verilerinin işlenmesine son verilir.
        </p>
      </AyarKarti>

      <AyarKarti
        baslik="Verilerimi indir"
        aciklama="Hesabınla ilişkili tüm kişisel verileri (profil, becayiş ilanları ve mesajlar, deneme sonuçları, bildirimler, oturumlar) tek bir JSON dosyası olarak indir."
      >
        <a
          href="/api/profil/verilerim"
          download
          className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <Download className="h-4 w-4" />
          Verilerimi indir
        </a>
      </AyarKarti>

      <AyarKarti baslik="Hesabı sil" tehlikeli>
        <HesapSilForm sifreVar={!!user.passwordHash} />
      </AyarKarti>
    </AyarlarSayfasi>
  );
}
