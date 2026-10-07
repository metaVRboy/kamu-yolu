import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { ProfilLayout } from "@/components/ProfilLayout";
import { AyarlarSekmeleri } from "@/components/HesapAyarlari";
import { Card } from "@/components/ui/card";
import { getOkunmamisIlgilendiklerimSayisi, getOkunmamisMesajSayisi } from "@/lib/becayis";

const TARIH = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Istanbul" });

/** Sunucuda sabit saat dilimiyle bicimlenir; istemcide yeniden hesaplanmaz (hydration farki olmaz). */
export const tarihMetni = (d: Date) => TARIH.format(d);

/** Ayarlar sekmelerinin (Hesap / Guvenlik / Gizlilik ve KVKK) ortak cercevesi. */
export async function AyarlarSayfasi({ userId, children }: { userId: string; children: ReactNode }) {
  const [okunmamisMesaj, okunmamisIlgilendiklerim] = await Promise.all([
    getOkunmamisMesajSayisi(userId),
    getOkunmamisIlgilendiklerimSayisi(userId),
  ]);
  return (
    <ProfilLayout okunmamisMesajSayisi={okunmamisMesaj} okunmamisIlgilendiklerimSayisi={okunmamisIlgilendiklerim}>
      <SayfaBasligi kompakt ikon={Settings} baslik="Ayarlar" aciklama="Hesap, güvenlik ve gizlilik ayarlarını buradan yönetebilirsin." />
      <AyarlarSekmeleri />
      {children}
    </ProfilLayout>
  );
}

export function AyarKarti({ baslik, aciklama, tehlikeli, children }: { baslik: string; aciklama?: string; tehlikeli?: boolean; children: ReactNode }) {
  return (
    <Card className={tehlikeli ? "mt-6 border-destructive/30 bg-white p-6 shadow-sm" : "mt-6 border-primary/20 bg-white p-6 shadow-sm"}>
      <div>
        <h2 className={tehlikeli ? "font-sans font-semibold text-destructive" : "font-sans font-semibold text-primary"}>{baslik}</h2>
        {aciklama && <p className="mt-1 text-sm text-muted-foreground">{aciklama}</p>}
      </div>
      <div>{children}</div>
    </Card>
  );
}
