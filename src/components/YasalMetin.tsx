import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SATIS_ACIK } from "@/lib/planlar";
import { ILETISIM_EPOSTA, ILETISIM_TELEFON, ODEME_KURULUSU, SATICI, SATICI_BILGILERI_TAMAM } from "@/lib/site";

/** Satis sozlesmesi sayfalari: satis acikken ya da satici bilgileri dolunca herkese, oncesinde yalniz admine (onizleme). */
export async function sozlesmeErisimi(): Promise<{ onizleme: boolean }> {
  if (SATIS_ACIK || SATICI_BILGILERI_TAMAM) return { onizleme: false };
  if ((await getCurrentUser())?.isAdmin) return { onizleme: true };
  notFound();
}

export function YerTutucu({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">{children}</mark>;
}

export function OnizlemeNotu() {
  return (
    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
      <strong>Önizleme (yalnız adminler görüyor):</strong> <YerTutucu>sarı</YerTutucu> alanlar src/lib/site.ts içindeki SATICI
      bilgileri doldurulunca kendiliğinden yazılır; unvan, vergi dairesi ve vergi no dolunca sayfa herkese açılır.
    </p>
  );
}

/** Odeme kurulusu secilene kadar genel ifade (yer tutucu yerine): metin her an yayinlanabilir kalir. */
export const odemeKurulusu = () => ODEME_KURULUSU ?? "BDDK/TCMB lisanslı bir ödeme kuruluşu";

const deger = (v: string | null, yer: string) => v ?? <YerTutucu>{yer}</YerTutucu>;

export function SaticiBilgileri() {
  return (
    <ul className="list-disc pl-5">
      <li>Unvan: {deger(SATICI.unvan, "[VERGİ LEVHASINDAKİ UNVAN]")}</li>
      <li>Adres: {SATICI.adres}</li>
      <li>Telefon: {ILETISIM_TELEFON.goster}</li>
      <li>E-posta: {ILETISIM_EPOSTA}</li>
      <li>
        Vergi Dairesi / No: {deger(SATICI.vergiDairesi, "[VERGİ DAİRESİ]")} / {deger(SATICI.vergiNo, "[VERGİ NO]")}
      </li>
      {SATICI.mersisNo && <li>MERSİS No: {SATICI.mersisNo}</li>}
      {SATICI.ticaretSicilNo && <li>Ticaret Sicil No: {SATICI.ticaretSicilNo}</li>}
      {SATICI.odaKaydi && <li>Kayıtlı olduğu meslek kuruluşu: {SATICI.odaKaydi}</li>}
    </ul>
  );
}

export function YasalBolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-sans text-base font-semibold text-primary">{baslik}</h2>
      {children}
    </section>
  );
}
