"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarClock, Loader2, Send, Trash2, Undo2, Users } from "lucide-react";
import { AdminKart } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export type YayinKaydi = {
  id: string;
  baslik: string;
  icerik: string;
  link: string | null;
  hedef: string;
  aliciSayisi: number | null;
  zaman: string;
  durum: "yayinda" | "zamanli" | "geri";
};

type HedefTur = "HERKES" | "PLAN" | "DUZEY" | "BOLUM";

const HEDEF_SECENEKLERI: Record<Exclude<HedefTur, "HERKES" | "BOLUM">, [string, string][]> = {
  PLAN: [
    ["UCRETSIZ", "Ücretsiz üyeler"],
    ["PRO", "Pro üyeler"],
    ["PRO_PLUS", "Pro+ üyeler"],
  ],
  DUZEY: [
    ["LISE", "Lise / Ortaöğretim"],
    ["ONLISANS", "Önlisans"],
    ["LISANS", "Lisans"],
  ],
};

const DURUM = {
  yayinda: { ad: "Yayında", sinif: "bg-emerald-100 text-emerald-700" },
  zamanli: { ad: "Zamanlandı", sinif: "bg-amber-100 text-amber-800" },
  geri: { ad: "Geri çekildi", sinif: "bg-slate-100 text-slate-500" },
};

const alanSinifi = "w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm focus:border-primary/40 focus:outline-none";

export function AdminBildirimPanel({ herkesSayisi, bolumler, kayitlar }: { herkesSayisi: number; bolumler: { id: string; name: string }[]; kayitlar: YayinKaydi[] }) {
  const router = useRouter();
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const [link, setLink] = useState("");
  const [hedefTur, setHedefTur] = useState<HedefTur>("HERKES");
  const [hedefDeger, setHedefDeger] = useState("");
  const [zamanli, setZamanli] = useState(false);
  const [zaman, setZaman] = useState("");
  const [kitle, setKitle] = useState<number | null>(herkesSayisi);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [silinecek, setSilinecek] = useState<YayinKaydi | null>(null);

  /** Hedef degisince kitle sayisini sunucudan al (olay isleyicisinde). */
  async function hedefDegisti(tur: HedefTur, deger: string) {
    setHedefTur(tur);
    setHedefDeger(deger);
    if (tur !== "HERKES" && !deger) return setKitle(null);
    setKitle(null);
    const res = await fetch(`/api/admin/duyurular?hedefTur=${tur}&hedefDeger=${encodeURIComponent(deger)}`);
    if (res.ok) setKitle((await res.json()).sayi);
  }

  async function yayinla() {
    setGonderiliyor(true);
    try {
      const res = await fetch("/api/admin/duyurular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baslik,
          icerik,
          link: link || null,
          hedefTur,
          hedefDeger: hedefTur === "HERKES" ? null : hedefDeger,
          yayinZamani: zamanli && zaman ? zaman : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yayınlanamadı.");
      toast.success(zamanli ? "Bildirim zamanlandı." : "Bildirim yayınlandı.");
      setBaslik("");
      setIcerik("");
      setLink("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setGonderiliyor(false);
    }
  }

  async function islem(id: string, method: "PATCH" | "DELETE") {
    const res = await fetch(`/api/admin/duyurular/${id}`, { method });
    if (!res.ok) return toast.error("İşlem yapılamadı.");
    toast.success(method === "PATCH" ? "Bildirim geri çekildi." : "Bildirim silindi.");
    router.refresh();
  }

  const hazir = baslik.trim().length >= 2 && icerik.trim().length >= 2 && (hedefTur === "HERKES" || hedefDeger) && (!zamanli || zaman);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <AdminKart baslik="Yeni bildirim">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Başlık
              <input value={baslik} onChange={(e) => setBaslik(e.target.value)} maxLength={120} className={cn(alanSinifi, "mt-1")} placeholder="Ör. KPSS denemesinde yeni sorular" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              İçerik
              <textarea value={icerik} onChange={(e) => setIcerik(e.target.value)} maxLength={2000} rows={3} className={cn(alanSinifi, "mt-1")} />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Bağlantı <span className="font-normal text-muted-foreground">(isteğe bağlı: /kpss-denemesi ya da https://…)</span>
              <input value={link} onChange={(e) => setLink(e.target.value)} className={cn(alanSinifi, "mt-1")} placeholder="/kpss-denemesi" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Kime
                <select value={hedefTur} onChange={(e) => hedefDegisti(e.target.value as HedefTur, "")} className={cn(alanSinifi, "mt-1")}>
                  <option value="HERKES">Herkes</option>
                  <option value="PLAN">Plana göre</option>
                  <option value="DUZEY">Öğrenim düzeyine göre</option>
                  <option value="BOLUM">Bir bölümün mezunları</option>
                </select>
              </label>
              {hedefTur !== "HERKES" && (
                <label className="block text-sm font-medium text-slate-700">
                  Seçim
                  <select value={hedefDeger} onChange={(e) => hedefDegisti(hedefTur, e.target.value)} className={cn(alanSinifi, "mt-1")}>
                    <option value="">Seç…</option>
                    {(hedefTur === "BOLUM" ? bolumler.map((b) => [b.id, b.name] as [string, string]) : HEDEF_SECENEKLERI[hedefTur]).map(([v, ad]) => (
                      <option key={v} value={v}>
                        {ad}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={zamanli} onChange={(e) => setZamanli(e.target.checked)} className="h-4 w-4 accent-primary" />
                İleri bir tarihte yayınla
              </label>
              {zamanli && <input type="datetime-local" value={zaman} onChange={(e) => setZaman(e.target.value)} className={cn(alanSinifi, "w-auto")} />}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 pt-4">
              <p className="flex items-center gap-1.5 text-sm text-slate-600">
                <Users className="h-4 w-4 text-primary" />
                {kitle === null ? "Kitle hesaplanıyor…" : <>Yaklaşık <strong className="text-slate-900">{kitle.toLocaleString("tr-TR")}</strong> üyeye gidecek</>}
              </p>
              <button
                type="button"
                onClick={yayinla}
                disabled={!hazir || gonderiliyor}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {gonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : zamanli ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {zamanli ? "Zamanla" : "Yayınla"}
              </button>
            </div>
          </div>
        </AdminKart>

        {/* Onizleme: zildeki gorunum */}
        <AdminKart baslik="Önizleme" aciklama="Kullanıcının zilinde böyle görünür.">
          <div className="overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-lg">
            <div className="flex border-b border-primary/10 text-sm font-medium">
              <span className="flex-1 border-b-2 border-primary px-4 py-2 text-center text-primary">Genel</span>
              <span className="flex-1 px-4 py-2 text-center text-muted-foreground">Bana Özel</span>
            </div>
            <div className="p-2">
              <div className="rounded-xl bg-primary/5 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                  <Bell className="h-3.5 w-3.5 text-primary" />
                  {baslik || "Bildirim başlığı"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{icerik || "Bildirim içeriği burada görünür."}</p>
                {link && <span className="mt-1 block text-xs font-semibold text-primary">Göz at →</span>}
              </div>
            </div>
          </div>
        </AdminKart>
      </div>

      <AdminKart baslik="Yayınlanan bildirimler" aciklama="Geri çekilen bildirim kullanıcılardan gizlenir, kayıt burada kalır.">
        <ul className="divide-y divide-primary/10">
          {kayitlar.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Henüz bildirim yok.</li>}
          {kayitlar.map((k) => (
            <li key={k.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                  {k.baslik}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", DURUM[k.durum].sinif)}>{DURUM[k.durum].ad}</span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{k.icerik}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {k.zaman} · {k.hedef}
                  {k.aliciSayisi !== null && ` · ~${k.aliciSayisi.toLocaleString("tr-TR")} üye`}
                  {k.link && (
                    <>
                      {" · "}
                      <Link href={k.link} className="text-primary hover:underline">
                        {k.link}
                      </Link>
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-1.5">
                {k.durum !== "geri" && (
                  <button type="button" onClick={() => islem(k.id, "PATCH")} className="inline-flex items-center gap-1 rounded-lg border border-primary/15 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    <Undo2 className="h-3.5 w-3.5" /> Geri çek
                  </button>
                )}
                <button type="button" onClick={() => setSilinecek(k)} aria-label="Sil" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </AdminKart>

      <ConfirmDialog
        open={!!silinecek}
        onOpenChange={(a) => !a && setSilinecek(null)}
        title="Bildirim silinsin mi?"
        description={`“${silinecek?.baslik ?? ""}” kalıcı olarak silinecek. Sadece gizlemek istiyorsan “Geri çek” yeterli.`}
        onConfirm={async () => {
          if (silinecek) await islem(silinecek.id, "DELETE");
          setSilinecek(null);
        }}
        onayEtiketi="Sil"
      />
    </>
  );
}
