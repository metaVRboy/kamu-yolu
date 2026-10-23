import Link from "next/link";
import { adminSayfasi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { CEVAP_PENCERESI_MS, telefonGoster, telefonMaskele, whatsappTanimli } from "@/lib/whatsapp";
import { AdminWhatsappCevap } from "@/components/admin/AdminWhatsappCevap";
import { cn } from "@/lib/utils";

export const metadata = { title: "WhatsApp — Kamu Yolu" };

const TARIH = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Istanbul" });
const TUR_ADI: Record<string, string> = { DOGRULAMA: "Doğrulama", ILAN: "İlan", BECAYIS: "Becayiş" };
const DURUM_RENGI: Record<string, string> = {
  TEST: "bg-amber-50 text-amber-800",
  GONDERILDI: "bg-slate-100 text-slate-700",
  TESLIM: "bg-emerald-50 text-emerald-700",
  OKUNDU: "bg-sky-50 text-sky-700",
  HATA: "bg-red-50 text-red-700",
};

type SonMesaj = { telefon: string; metin: string; yon: string; olusturma: Date; userId: string | null };

export default async function AdminWhatsappPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  await adminSayfasi();
  const { t } = await searchParams;
  // eslint-disable-next-line react-hooks/purity -- sunucu bileseni, istek basina bir kez calisir
  const simdi = Date.now();

  // Her numaranin son mesaji (sohbet listesi), en yeni sohbet ustte.
  const sohbetler = (
    await prisma.$queryRaw<SonMesaj[]>`SELECT DISTINCT ON (telefon) telefon, metin, yon, olusturma, "userId" FROM "WhatsappMesaj" ORDER BY telefon, olusturma DESC`
  )
    .sort((a, b) => b.olusturma.getTime() - a.olusturma.getTime())
    .slice(0, 50);
  const secili = t && /^\+\d{10,15}$/.test(t) ? t : sohbetler[0]?.telefon;
  if (secili) await prisma.whatsappMesaj.updateMany({ where: { telefon: secili, yon: "GELEN", okundu: false }, data: { okundu: true } });

  const [okunmamis, uyeler, mesajlar, bildirimler, kayitlar, ozet] = await Promise.all([
    prisma.whatsappMesaj.groupBy({ by: ["telefon"], where: { yon: "GELEN", okundu: false }, _count: true }),
    prisma.user.findMany({ where: { id: { in: sohbetler.flatMap((s) => (s.userId ? [s.userId] : [])) } }, select: { id: true, adSoyad: true } }),
    secili ? prisma.whatsappMesaj.findMany({ where: { telefon: secili }, orderBy: { olusturma: "desc" }, take: 200 }) : [],
    secili ? prisma.whatsappGonderim.findMany({ where: { telefon: secili }, orderBy: { olusturma: "desc" }, take: 50 }) : [],
    prisma.whatsappGonderim.findMany({ orderBy: { olusturma: "desc" }, take: 100 }),
    prisma.whatsappGonderim.groupBy({ by: ["durum"], where: { olusturma: { gt: new Date(simdi - 30 * 86_400_000) } }, _count: true }),
  ]);
  const ad = new Map(uyeler.map((u) => [u.id, u.adSoyad]));
  const okunmamisSayi = new Map(okunmamis.map((o) => [o.telefon, o._count]));
  const seciliAd = sohbetler.find((s) => s.telefon === secili)?.userId;
  // Konusma: sohbet mesajlari + o numaraya giden bildirim sablonlari (baglam icin), eskiden yeniye.
  const akis = [
    ...mesajlar.map((m) => ({ id: m.id, olusturma: m.olusturma, yon: m.yon, metin: m.metin, durum: m.durum, hata: m.hata, bildirim: null as string | null })),
    ...bildirimler.map((b) => ({ id: b.id, olusturma: b.olusturma, yon: "GIDEN", metin: b.tur === "DOGRULAMA" ? "Doğrulama kodu" : b.metin, durum: b.durum, hata: b.hata, bildirim: TUR_ADI[b.tur] ?? b.tur })),
  ].sort((a, b) => a.olusturma.getTime() - b.olusturma.getTime());
  const sonGelen = mesajlar.find((m) => m.yon === "GELEN");
  const pencereAcik = !!sonGelen && simdi - sonGelen.olusturma.getTime() < CEVAP_PENCERESI_MS;

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-slate-900">WhatsApp</h1>
        <p className="mt-1 text-sm text-muted-foreground">İşletme numarasına gelen mesajlar ve cevapların. Yeni mesajlar 20 saniyede bir yenilenir.</p>
        {!whatsappTanimli() && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <strong>Test modu:</strong> WhatsApp anahtarları henüz tanımlı değil. Hiçbir mesaj gerçekten gönderilmiyor; gönderilecek mesajlar
            yalnızca aşağıya “TEST” olarak yazılıyor.
          </p>
        )}
      </div>

      <div className="grid overflow-hidden rounded-2xl border border-primary/15 bg-white md:grid-cols-[280px_1fr]">
        <ul className="max-h-[560px] divide-y divide-primary/5 overflow-y-auto border-b border-primary/10 md:border-r md:border-b-0">
          {sohbetler.map((s) => (
            <li key={s.telefon}>
              <Link href={`/admin/whatsapp?t=${encodeURIComponent(s.telefon)}`} className={cn("block px-4 py-3 hover:bg-primary/5", s.telefon === secili && "bg-primary/10")}>
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-800">{(s.userId && ad.get(s.userId)) || telefonGoster(s.telefon)}</span>
                  {!!okunmamisSayi.get(s.telefon) && (
                    <span className="ml-auto rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white">{okunmamisSayi.get(s.telefon)}</span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {s.yon === "GIDEN" ? "Sen: " : ""}
                  {s.metin}
                </span>
                <span className="text-[11px] text-muted-foreground">{TARIH.format(s.olusturma)}</span>
              </Link>
            </li>
          ))}
          {sohbetler.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">Henüz gelen mesaj yok.</li>}
        </ul>

        <div className="flex min-h-[360px] flex-col">
          {secili ? (
            <>
              <div className="border-b border-primary/10 px-4 py-3">
                <p className="font-semibold text-slate-800">{(seciliAd && ad.get(seciliAd)) || "Üye değil"}</p>
                <p className="text-xs text-muted-foreground">{telefonGoster(secili)}</p>
              </div>
              <div className="flex max-h-[440px] flex-1 flex-col gap-2 overflow-y-auto bg-slate-50 p-4">
                {akis.map((m) => (
                  <div key={m.id} className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm", m.yon === "GELEN" ? "self-start bg-white shadow-sm" : "self-end bg-emerald-100")}>
                    {m.bildirim && <p className="mb-0.5 text-[11px] font-semibold text-emerald-800">Bildirim · {m.bildirim}</p>}
                    <p className="whitespace-pre-wrap text-slate-800">{m.metin}</p>
                    <p className="mt-1 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
                      {TARIH.format(m.olusturma)}
                      {m.durum && (
                        <span className={cn("rounded-full px-1.5 font-semibold", DURUM_RENGI[m.durum])} title={m.hata ?? undefined}>
                          {m.durum}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-primary/10 p-3">
                <AdminWhatsappCevap telefon={secili} pencereAcik={pencereAcik} />
              </div>
            </>
          ) : (
            <p className="m-auto p-6 text-sm text-muted-foreground">Kullanıcılar işletme numarasına yazınca sohbetler burada görünür.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-sans text-lg font-bold text-slate-900">Bildirim kayıtları</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">Son 30 gün:</span>
          {ozet.length === 0 && <span>kayıt yok</span>}
          {ozet.map((o) => (
            <span key={o.durum} className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", DURUM_RENGI[o.durum])}>
              {o.durum} {o._count}
            </span>
          ))}
        </div>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-primary/15 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary/10 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Tarih</th>
                <th className="px-3 py-2 font-semibold">Tür</th>
                <th className="px-3 py-2 font-semibold">Numara</th>
                <th className="px-3 py-2 font-semibold">Mesaj</th>
                <th className="px-3 py-2 font-semibold">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {kayitlar.map((k) => (
                <tr key={k.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{TARIH.format(k.olusturma)}</td>
                  <td className="px-3 py-2">{TUR_ADI[k.tur] ?? k.tur}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{telefonMaskele(k.telefon)}</td>
                  {/* Dogrulama kodlari admin ekraninda da gizli kalir. */}
                  <td className="px-3 py-2 text-slate-600">{k.tur === "DOGRULAMA" ? k.metin.replace(/\d{6}/, "******") : k.metin}</td>
                  <td className="px-3 py-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", DURUM_RENGI[k.durum])} title={k.hata ?? undefined}>
                      {k.durum}
                    </span>
                  </td>
                </tr>
              ))}
              {kayitlar.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    Henüz bildirim kaydı yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
