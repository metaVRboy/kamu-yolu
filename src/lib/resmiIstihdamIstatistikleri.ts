/**
 * Turkiye genelinde TOPLAM kamu personeli sayisi - bolum/kurum kirilimi
 * YOK, cunku boyle resmi bir veri seti yayinlanmiyor. Rakamlar
 * Cumhurbaskanligi Strateji ve Butce Baskanligi'nin (eski DPB) acikladigi,
 * basinda (Yeni Safak/Ahmet Unlu, Alomaliye) raporlanan DONEM SONU toplam
 * istihdam sayilaridir - bizim scraping verimizden tamamen BAGIMSIZ, ayri
 * ve resmi bir kaynaktir.
 */
export type ResmiIstihdamYili = {
  yil: number;
  /** Tam yil sonu degilse (ör. yilin ortasindaki en guncel rakam) belirtilir. */
  donem: string;
  toplamPersonel: number;
  kaynakUrl: string;
};

export const RESMI_ISTIHDAM_VERISI: ResmiIstihdamYili[] = [
  {
    yil: 2020,
    donem: "Aralık sonu",
    toplamPersonel: 4_791_571,
    kaynakUrl:
      "https://www.yenisafak.com/yazarlar/ahmet-unlu/2025-yili-sonu-itibariyla-kamu-personel-sayisi-5-milyon-342-bin-254e-ulasti-4797515",
  },
  {
    yil: 2022,
    donem: "Aralık sonu",
    toplamPersonel: 5_010_904,
    kaynakUrl: "https://www.alomaliye.com/2024/02/13/kamu-sektorunde-calisan-sayisi-2023/",
  },
  {
    yil: 2023,
    donem: "Aralık sonu",
    toplamPersonel: 5_175_771,
    kaynakUrl:
      "https://www.yenisafak.com/yazarlar/ahmet-unlu/2025-yili-sonu-itibariyla-kamu-personel-sayisi-5-milyon-342-bin-254e-ulasti-4797515",
  },
  {
    yil: 2024,
    donem: "Aralık sonu",
    toplamPersonel: 5_249_928,
    kaynakUrl:
      "https://www.yenisafak.com/yazarlar/ahmet-unlu/2024-yili-aralik-sonu-itibariyla-her-statudeki-kamu-personel-sayisi-aciklandi-4677271",
  },
  {
    yil: 2025,
    donem: "Aralık sonu",
    toplamPersonel: 5_342_254,
    kaynakUrl:
      "https://www.yenisafak.com/yazarlar/ahmet-unlu/2025-yili-sonu-itibariyla-kamu-personel-sayisi-5-milyon-342-bin-254e-ulasti-4797515",
  },
  {
    yil: 2026,
    donem: "Haziran sonu (ara dönem)",
    toplamPersonel: 5_417_126,
    kaynakUrl:
      "https://www.yenisafak.com/yazarlar/ahmet-unlu/2026-yili-haziran-sonu-itibariyla-kamu-personel-sayisi-ve-dusundurdukleri-4848421",
  },
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
