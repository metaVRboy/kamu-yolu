// Sitenin /api/mobil uclarinin cevaplari (src/lib/mobil.ts ve src/app/api/mobil/*).

export type IlanKartiVeri = {
  id: string;
  kurumAdiHam: string | null;
  ilanSayisi: number;
  kadroFazlasi: number;
  kurum: string;
  kadro: string;
  kurumTuru: string;
  kurumTuruAdi: string;
  yeni: boolean;
  kalanGun: number | null;
  duzeyler: string;
  konum: string | null;
  sonBasvuru: string | null;
  kaynak: string;
  nitelik: string | null;
  logoUrl: string | null;
};

export type HaberKartiVeri = {
  slug: string;
  baslik: string;
  ozet: string;
  gorselUrl: string | null;
  gorselLogoMu: boolean;
  kategori: string | null;
  yayinTarihi: string;
  yeni: boolean;
};

export type BolumSecenegi = { slug: string; ad: string; duzey: string; ilanSayisi: number };

export type AnaSayfaVeri = {
  istatistik: { ilan: number; kurum: number; bolum: number };
  bolumler: BolumSecenegi[];
  haberler: HaberKartiVeri[];
  haberSayisi: number;
  ilanlar: IlanKartiVeri[];
};

export type IlanListesiVeri = {
  baslik: string;
  aciklama: string;
  ilanSayisi: number;
  kurumSayisi: number;
  biteceklerSayisi: number;
  filtreler: { kurumTurleri: { deger: string; ad: string }[]; ilanTurleri: string[]; iller: string[] };
  ilanlar: IlanKartiVeri[];
  haberler: HaberKartiVeri[];
};

export type IlanDetayVeri = {
  id: string;
  kadro: string;
  kurum: string;
  kurumTuru: string;
  kurumTuruAdi: string;
  ilanTuru: string | null;
  bolumSartiYok: boolean;
  aktif: boolean;
  logoUrl: string | null;
  kalanGun: number | null;
  sonBasvuru: string | null;
  basvuruBaslangici: string | null;
  ilerleme: number | null;
  konum: string | null;
  duzeyler: string;
  kaynak: string;
  kaynakUrl: string;
  takvimUrl: string | null;
  paylasimUrl: string;
  maddeler: { madde: boolean; metin: string }[];
  bolumler: { slug: string; ad: string }[];
  benzerler: IlanKartiVeri[];
};

export type HaberDetayVeri = HaberKartiVeri & {
  kaynakUrl: string | null;
  paylasimUrl: string;
  suresiGecti: boolean;
  bilgiKutulari: { etiket: string; deger: string; vurgu: boolean }[];
  tablo: { etiket: string; deger: string }[];
  ayrintilar: { baslik: string; metin: string }[];
  sss: { soru: string; cevap: string }[];
  benzerler: HaberKartiVeri[];
};

export type UygunlukDurumu = "uygun" | "uygun-degil" | "bilinmiyor" | "sart-yok";
export type UygunlukVeri =
  | { giris: false }
  | {
      giris: true;
      bolum: { durum: UygunlukDurumu; profilBolumu: string | null };
      duzey: { durum: UygunlukDurumu; profilDuzeyi: string | null; istenen: string[] };
    };

export type ProfilVeri = {
  kullanici: {
    adSoyad: string;
    email: string;
    plan: "UCRETSIZ" | "PRO" | "PRO_PLUS";
    planAdi: string;
    abonelikBitis: string | null;
    fotografUrl: string | null;
    bolum: { id: string; ad: string; slug: string } | null;
    duzey: string | null;
    duzeyAdi: string | null;
  } | null;
  kisiselIlanSayisi: number;
  kisiselIlanlar: IlanKartiVeri[];
};
