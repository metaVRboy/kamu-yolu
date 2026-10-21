import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { YeniKayitOlayi } from "@/components/YeniKayitOlayi";
import { Briefcase, Inbox, MessageCircle, Repeat, Settings } from "lucide-react";
import { KilitliOzellik } from "@/components/KilitliOzellik";
import { ProfilKarti } from "@/components/ProfilKarti";
import { getCurrentUser } from "@/lib/auth";
import { rozetDurumu } from "@/lib/rozetler";
import { profilFotografiUrl } from "@/lib/profil";
import { DUZEY_LABEL } from "@/lib/kpssDenemeSabitler";
import { PLAN_ADI } from "@/lib/planlar";
import { getOkunmamisIlgilendiklerimSayisi, getOkunmamisMesajSayisi, getTaleplerim } from "@/lib/becayis";
import { getPostingsForDepartment, getPostingsForLevel } from "@/lib/matching";
import { ProfilLayout } from "@/components/ProfilLayout";
import { LogoutButton } from "@/components/LogoutButton";
import { IlanVitrinKarti } from "@/components/IlanVitrinKarti";
import { kalanGunSayisi, kurumLogolari, tekIlanKartlari } from "@/lib/ilanVitrin";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { kisiselOzet } from "@/lib/kisiselOzet";
import { YukseltButonu } from "@/components/YukseltmePenceresi";

export const metadata = { title: "Profilim — Kamu Yolu" };

export default async function ProfilimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [taleplerim, okunmamisSayisi, okunmamisIlgilendiklerimSayisi] = await Promise.all([
    getTaleplerim(user.id),
    getOkunmamisMesajSayisi(user.id),
    getOkunmamisIlgilendiklerimSayisi(user.id),
  ]);

  const aktifTalepler = taleplerim.filter((t) => t.isActive);

  const sonMesajlar = taleplerim
    .flatMap((t) => t.threads.map((th) => ({ talep: t, thread: th })))
    .flatMap(({ talep, thread }) =>
      thread.mesajlar.map((m) => ({
        talepId: talep.id,
        karsiAdSoyad: thread.karsiAdSoyad,
        mesaj: m.mesaj,
        createdAt: m.createdAt,
        okundu: m.okundu || m.gonderenId === user.id,
      })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const isPremium = user.abonelikPlani !== "UCRETSIZ";
  const kisiselIlanlar = user.departmentId
    ? await getPostingsForDepartment(user.departmentId)
    : user.educationLevel
      ? await getPostingsForLevel(user.educationLevel)
      : [];
  const gosterilenIlanlar = kisiselIlanlar.slice(0, 4);
  const [logolar, bolum, ozet, rozet, fotoUrl] = await Promise.all([
    kurumLogolari(gosterilenIlanlar),
    user.departmentId ? prisma.department.findUnique({ where: { id: user.departmentId }, select: { slug: true, name: true } }) : null,
    isPremium ? null : kisiselOzet(user.departmentId),
    rozetDurumu(user),
    profilFotografiUrl(user.id),
  ]);
  const kazanilanRozetler = rozet.rozetler.filter((r) => r.kazanildi);

  return (
    <ProfilLayout
      okunmamisMesajSayisi={okunmamisSayisi}
      okunmamisIlgilendiklerimSayisi={okunmamisIlgilendiklerimSayisi}
    >
      <ProfilKarti
        yatay
        eposta={user.email}
        v={{
          adSoyad: user.adSoyad,
          fotoUrl,
          altSatir: [bolum?.name, user.educationLevel ? DUZEY_LABEL[user.educationLevel] : null].filter(Boolean).join(" · ") || "Bölümünü henüz seçmedin",
          seriGun: rozet.seri.gun,
          denemeSayisi: rozet.denemeSayisi,
          rozetSayisi: kazanilanRozetler.length,
          rozetler: kazanilanRozetler.slice(0, 4).map(({ id, ad, renk }) => ({ id, ad, renk })),
          plan: user.abonelikPlani,
          planAdi: PLAN_ADI[user.abonelikPlani],
          kalanGun: isPremium ? kalanGunSayisi(user.abonelikBitis) : null,
        }}
        aksiyonlar={
          <>
            <Link
              href="/profilim/ayarlar"
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 text-sm font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/25"
            >
              <Settings className="h-3.5 w-3.5" aria-hidden />
              Profili düzenle
            </Link>
            <LogoutButton kapakta />
          </>
        }
      />
      <Suspense fallback={null}>
        <YeniKayitOlayi />
      </Suspense>

      {/* Bolumu olmayan uye sitenin ana degerini goremez: ilk is bolum secimi. */}
      {!user.departmentId && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-sans font-semibold text-slate-900">Mezun olduğun bölümü seç</p>
            <p className="mt-0.5 text-sm text-slate-600">Bölümüne uygun kamu ilanlarını ve yeni ilan bildirimlerini buna göre hazırlıyoruz.</p>
          </div>
          <Link href="/profilim/ayarlar" className={cn(buttonVariants(), "shrink-0")}>
            Bölümümü seç
          </Link>
        </div>
      )}

      {/* Kacirilan ilanlar (ucretsiz uye): bolumune eslesip son 30 gunde son basvurusu gecmis gercek ilan sayisi. */}
      {ozet && ozet.kacirilan30 > 0 && kisiselIlanlar.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-red-900">Son 30 günde bölümüne uygun {ozet.kacirilan30} ilanın son başvurusu geçti</p>
            <p className="mt-0.5 text-sm text-red-800">Pro&apos;da bölümüne uygun yeni ilan çıkınca anında haberin olur; takip ettiğin ilanlar için son gün hatırlatması gelir.</p>
          </div>
          <YukseltButonu plan="PRO" kaynak="kacirilan" className="shrink-0 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800">
            Bir daha kaçırma
          </YukseltButonu>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card className="gap-3 border-primary/20 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-sans font-semibold text-primary">
            <Repeat className="h-4 w-4 text-primary" />
            Aktif Becayiş İlanlarım
          </h2>
          {aktifTalepler.length === 0 ? (
            <div>
              <p className="text-sm text-muted-foreground">Henüz aktif bir becayiş ilanın yok.</p>
              <Link
                href="/becayis/talep-olustur"
                className={cn(buttonVariants({ size: "sm" }), "mt-3")}
              >
                Talep Oluştur
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {aktifTalepler.slice(0, 3).map((t) => (
                <Link
                  key={t.id}
                  href="/becayis/taleplerim"
                  className="block rounded-xl border border-primary/10 px-3 py-2 text-sm hover:bg-primary/5"
                >
                  <p className="font-medium text-slate-800">{t.meslek}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.mevcutIl}
                    {t.mevcutIlce ? ` / ${t.mevcutIlce}` : ""}
                  </p>
                </Link>
              ))}
              <Link
                href="/becayis/taleplerim"
                className="block pt-1 text-sm font-medium text-primary hover:underline"
              >
                Tümünü gör »
              </Link>
            </div>
          )}
        </Card>

        <Card className="gap-3 border-primary/20 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-sans font-semibold text-primary">
            <Inbox className="h-4 w-4 text-primary" />
            Gelen Mesajlarım
            {okunmamisSayisi > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {okunmamisSayisi}
              </span>
            )}
          </h2>
          {sonMesajlar.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz bir mesajın yok.</p>
          ) : (
            <div className="space-y-2">
              {sonMesajlar.map((m, i) => (
                <Link
                  key={i}
                  href="/becayis/taleplerim"
                  className={cn(
                    "flex items-start gap-2 rounded-xl border border-primary/10 px-3 py-2 text-sm hover:bg-primary/5",
                    !m.okundu && "bg-primary/5",
                  )}
                >
                  <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{m.karsiAdSoyad}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.mesaj}</p>
                  </div>
                </Link>
              ))}
              <Link
                href="/becayis/taleplerim"
                className="block pt-1 text-sm font-medium text-primary hover:underline"
              >
                Tümünü gör »
              </Link>
            </div>
          )}
        </Card>
      </div>

      <div id="bana-ozel" className="mt-6 scroll-mt-32">
        <h2 className="flex items-center gap-2 font-sans font-semibold text-primary">
          <Briefcase className="h-4 w-4 text-primary" />
          Bana Özel İlanlar
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Profilinde belirttiğin bölüm/öğrenim düzeyine uygun ilanlar burada listelenir.
        </p>

        {kisiselIlanlar.length === 0 && !user.departmentId && !user.educationLevel ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Eşleşen ilan bulabilmemiz için{" "}
            <Link href="/profilim/ayarlar" className="font-medium text-primary hover:underline">
              profilindeki bölüm veya öğrenim düzeyi bilgini
            </Link>{" "}
            tamamla.
          </p>
        ) : kisiselIlanlar.length === 0 ? (
          // Bolum girili ama su an acik ilan yok: ucretsiz uyeye gercek sayiyla Pro yonlendirmesi, Pro'ya yalniz bilgi.
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-primary/15 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900">Şu an {bolum ? `${bolum.name} için` : "bölümüne uygun"} açık ilan yok.</p>
              <p className="mt-0.5 text-sm text-slate-600">
                {isPremium
                  ? "Yeni ilan yayımlandığında sana hemen bildirim gelecek; bu sayfada da listelenecek."
                  : ozet && ozet.kacirilan30 > 0
                    ? `Son 30 günde bölümüne uygun ${ozet.kacirilan30} ilan yayımlandı ve son başvuruları geçti. Pro ile bir sonraki ilan çıktığı an haberin olur.`
                    : "Yeni ilan yayımlandığında ilk senin haberin olsun: Pro'da bölümüne uygun her yeni ilanda anında bildirim alırsın."}
              </p>
            </div>
            {!isPremium && (
              <YukseltButonu
                plan="PRO"
                kaynak={ozet && ozet.kacirilan30 > 0 ? "kacirilan" : "bildirim"}
                className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
              >
                {ozet && ozet.kacirilan30 > 0 ? "Bir daha kaçırma" : "İlk ben haberdar olayım"}
              </YukseltButonu>
            )}
          </div>
        ) : (
          <div className="mt-4">
            {(() => {
              const liste = (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {tekIlanKartlari(gosterilenIlanlar).map((grup) => (
                    <IlanVitrinKarti
                      key={grup.ilk.id}
                      grup={grup}
                      logoUrl={logolar.get(grup.ilk.institutionName) ?? null}
                      nitelikOzeti
                    />
                  ))}
                </div>
              );
              return isPremium ? (
                liste
              ) : (
                <KilitliOzellik
                  mevcutPlan={user.abonelikPlani}
                  gerekenPlan="PRO"
                  kaynak="ozel-ilanlar"
                  baslik={`Sana özel ${kisiselIlanlar.length} ilan bulundu`}
                  ozellikler={["Bölümüne ve öğrenim düzeyine uygun ilanlar tek listede", "Yeni ilan çıkınca anında bildirim"]}
                >
                  {liste}
                </KilitliOzellik>
              );
            })()}
            {/* Kayit "bolumune uygun ilanlari takip et" vaat ediyor: bolum sayfasi herkese ucretsiz. */}
            {!isPremium && bolum && (
              <p className="mt-3 text-sm text-slate-600">
                {bolum.name} için tüm ilanları{" "}
                <Link href={`/bolum/${bolum.slug}`} className="font-medium text-primary hover:underline">
                  bölüm sayfasında ücretsiz görebilirsin
                </Link>
                ; Pro ile bölümüne ve öğrenim düzeyine göre süzülmüş listeyi ve yeni ilan bildirimlerini alırsın.
              </p>
            )}
          </div>
        )}
      </div>
    </ProfilLayout>
  );
}
