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
  kpssGun: number | null;
};

export type RozetRengi = "mavi" | "turuncu" | "yesil" | "mor";
export type RozetOzet = { id: string; ad: string; renk: RozetRengi };
export type SeriBilgisi = { gun: number; bugunCozuldu: boolean; enIyi: number; toplamGun: number; dondurmaKalan: number | null };

/** /api/benim-ozetim: ana sayfanin uye parcalari (misafirde uye null). */
export type UyeOzeti = {
  uye: {
    adSoyad: string;
    fotoUrl: string | null;
    bolum: string | null;
    duzey: string | null;
    plan: "UCRETSIZ" | "PRO" | "PRO_PLUS";
    planAdi: string;
    planKalanGun: number | null;
    seri: SeriBilgisi;
    denemeSayisi: number;
    rozetSayisi: number;
    rozetler: RozetOzet[];
  } | null;
  ozet?: { bolumAdi: string; bolumSlug: string; yeni7: number; yaklasan: number; kacirilan30: number; aktif: number } | null;
  sonDeneme?: { puan: number | null; siralama: { yuzde: number; katilimci: number } | null } | null;
};

/** /api/pro-bandi: uyenin gercek durumundan secilen Pro mesaji (Pro+ ve bos durumda null). */
export type BantMesaji = {
  tur: string;
  once: string;
  vurgu: string;
  sonra: string;
  cta: { etiket: string; eylem: "kayit" | "yukselt" | "link"; href?: string; plan?: "PRO" | "PRO_PLUS" };
} | null;

export type IlanListesiVeri = {
  baslik: string;
  aciklama: string;
  ilanSayisi: number;
  kurumSayisi: number;
  biteceklerSayisi: number;
  filtreler: { kurumTurleri: { deger: string; ad: string }[]; ilanTurleri: string[]; iller: string[] };
  ilanlar: IlanKartiVeri[];
  haberler: HaberKartiVeri[];
  bolum: { ad: string; seviyeSlug: string | null; son30: number; ortalamaGun: number | null } | null;
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
  kurumAdi: string | null;
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
    kalanGun: number | null;
    fotografUrl: string | null;
    bolum: { id: string; ad: string; slug: string } | null;
    duzey: string | null;
    duzeyAdi: string | null;
  } | null;
  seriGun: number;
  denemeSayisi: number;
  rozetSayisi: number;
  rozetler: RozetOzet[];
  kacirilan30: number;
  aktifTalepler: { id: string; meslek: string; mevcutIl: string; mevcutIlce: string | null }[];
  sonMesajlar: { id: string; karsiAdSoyad: string; mesaj: string; okundu: boolean }[];
  okunmamisMesaj: number;
  okunmamisIlgilendiklerim: number;
  kisiselIlanSayisi: number;
  kisiselIlanlar: IlanKartiVeri[];
};

export type BecayisOzet = { id: string; meslek: string; kurumTuru: string | null; mevcutIl: string; mevcutIlce: string | null; istenenIller: string[] };
export type BecayisDetay = BecayisOzet & { aciklama: string | null; sahipAd: string; sahibi: boolean; goruntulenme: number };
export type BecayisMesaj = { id: string; gonderenId: string | null; mesaj: string; createdAt: string; sikayetEdildi: boolean };
export type BecayisSohbet = { karsiId: string; karsiAdSoyad: string; okunmamisSayisi: number; mesajlar: BecayisMesaj[] };
type BecayisKendi = Omit<BecayisOzet, "kurumTuru"> & { isActive: boolean };
export type BecayisEslesme = { id: string; meslek: string; mevcutIl: string; mevcutIlce: string | null; adSoyad: string };
export type TaleplerimVeri = {
  kullaniciId: string;
  pro: boolean;
  talepler: (BecayisKendi & { goruntulenme: number; eslesmeler: BecayisEslesme[]; threads: BecayisSohbet[] })[];
};
export type IlgilendiklerimVeri = {
  kullaniciId: string;
  talepler: (BecayisKendi & { ilanSahibiAdSoyad: string; okunmamisSayisi: number; mesajlar: BecayisMesaj[] })[];
};

export type OturumSatiri = { id: string; cihaz: string; olusturma: string; sonGorulme: string; buCihaz: boolean };
export type AyarlarVeri = {
  adSoyad: string;
  email: string;
  telefon: string | null;
  meslek: string | null;
  kurumTuru: string | null;
  kamuCalisaniDegil: boolean;
  departmentId: string | null;
  educationLevel: string | null;
  fotografUrl: string | null;
  uyelikTarihi: string;
  girisYontemleri: string;
  plan: "UCRETSIZ" | "PRO" | "PRO_PLUS";
  sifreVar: boolean;
  googleBagli: boolean;
  oturumlar: OturumSatiri[];
  sms: { pro: boolean; hazirDegil: boolean; dogrulanmisTelefon: string | null; smsIlanBildirimi: boolean; smsBecayisBildirimi: boolean };
  kvkkOnayTarihi: string | null;
  ticariIletiOnay: boolean;
};
