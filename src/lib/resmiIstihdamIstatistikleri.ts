/**
 * Turkiye genelinde TOPLAM kamu personeli sayisi - bolum/kurum kirilimi
 * YOK, cunku boyle resmi bir veri seti yayinlanmiyor. Rakamlar
 * Cumhurbaskanligi Strateji ve Butce Baskanligi'nin (eski DPB) resmi
 * "Kamu Sektoru Istihdam Sayilari" donemsel raporlarindaki (her yilin
 * ARALIK/yil sonu donemi, "GENEL TOPLAM" satiri) rakamlardir - bizim
 * scraping verimizden tamamen BAGIMSIZ, ayri ve resmi bir kaynaktir.
 * 2026 icin henuz yil sonu raporu yayinlanmadigindan en guncel donem
 * (Haziran) kullanilmis ve "ara donem" olarak isaretlenmistir.
 */
export type ResmiIstihdamYili = {
  yil: number;
  /** Tam yil sonu degilse (ör. yilin ortasindaki en guncel rakam) belirtilir. */
  donem: string;
  toplamPersonel: number;
  kaynakDosya: string;
};

export const RESMI_ISTIHDAM_VERISI: ResmiIstihdamYili[] = [
  { yil: 2007, donem: "Aralık sonu", toplamPersonel: 2_925_306, kaynakDosya: "Kamu-Istihdami-2007.xls" },
  { yil: 2008, donem: "Aralık sonu", toplamPersonel: 2_917_786, kaynakDosya: "Kamu-Istihdami-2008.xlsx" },
  { yil: 2009, donem: "Aralık sonu", toplamPersonel: 2_958_851, kaynakDosya: "Kamu-Istihdami-2009.xls" },
  { yil: 2010, donem: "Aralık sonu", toplamPersonel: 3_013_612, kaynakDosya: "Kamu-Istihdami-2010.xls" },
  { yil: 2011, donem: "Aralık sonu", toplamPersonel: 3_099_137, kaynakDosya: "Kamu-Istihdami-2011.xls" },
  { yil: 2012, donem: "Aralık sonu", toplamPersonel: 3_215_457, kaynakDosya: "Kamu-Istihdami-2012.xlsx" },
  { yil: 2013, donem: "Aralık sonu", toplamPersonel: 3_319_584, kaynakDosya: "Kamu-Istihdami-2013.xlsx" },
  { yil: 2014, donem: "Aralık sonu", toplamPersonel: 3_440_039, kaynakDosya: "Kamu-Istihdami-2014.xlsx" },
  { yil: 2015, donem: "Aralık sonu", toplamPersonel: 3_520_530, kaynakDosya: "Kamu-Istihdami-2015.xlsx" },
  { yil: 2016, donem: "Aralık sonu", toplamPersonel: 3_561_539, kaynakDosya: "Kamu-Istihdami-2016.xlsx" },
  { yil: 2017, donem: "Aralık sonu", toplamPersonel: 3_602_735, kaynakDosya: "Kamu-Istihdami-2017.xlsx" },
  { yil: 2018, donem: "Aralık sonu", toplamPersonel: 4_352_182, kaynakDosya: "Kamu-Sektörü-İstihdam-Sayıları-2018-4.xlsx" },
  { yil: 2019, donem: "Aralık sonu", toplamPersonel: 4_644_074, kaynakDosya: "Kamu-Sektoru-İstihdam-Sayilari-2019.xlsx" },
  { yil: 2020, donem: "Aralık sonu", toplamPersonel: 4_791_571, kaynakDosya: "Kamu-Sektoru-Istihdam-Sayilari-2020.xlsx" },
  { yil: 2021, donem: "Aralık sonu", toplamPersonel: 4_877_270, kaynakDosya: "Kamu-Sektoru-Istihdam-Sayilari-2021.xlsx" },
  { yil: 2022, donem: "Aralık sonu", toplamPersonel: 5_010_904, kaynakDosya: "Kamu-Sektoru-Istihdam-Sayilari-2022.xlsx" },
  { yil: 2023, donem: "Aralık sonu", toplamPersonel: 5_175_771, kaynakDosya: "Kamu-Sektoru-Istihdam-Sayilari-2023.xlsx" },
  { yil: 2024, donem: "Aralık sonu", toplamPersonel: 5_249_928, kaynakDosya: "Kamu-Sektoru-Istihdam-Sayilari-2024_Revize.xlsx" },
  { yil: 2025, donem: "Aralık sonu", toplamPersonel: 5_342_254, kaynakDosya: "Kamu-Sektoru-Istihdam-Sayilari-2025.xlsx" },
  { yil: 2026, donem: "Haziran sonu (ara dönem)", toplamPersonel: 5_417_126, kaynakDosya: "Kamu-Sektoru-Istihdam-Sayilari-2026-2C.xlsx" },
];

export type ResmiIstihdamSatiri = ResmiIstihdamYili & {
  /** Bir onceki satirla ayni "Aralik sonu" turunde, ardisik yilsa net artis; degilse null. */
  netArtis: number | null;
};

export function getResmiIstihdamSerisi(): ResmiIstihdamSatiri[] {
  return RESMI_ISTIHDAM_VERISI.map((satir, i) => {
    const onceki = RESMI_ISTIHDAM_VERISI[i - 1];
    const ardisikYilSonu =
      onceki && satir.yil === onceki.yil + 1 && onceki.donem === "Aralık sonu" && satir.donem === "Aralık sonu";
    return {
      ...satir,
      netArtis: ardisikYilSonu ? satir.toplamPersonel - onceki.toplamPersonel : null,
    };
  });
}
