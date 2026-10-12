export const TURKIYE_ILLERI = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya",
  "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu",
  "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır",
  "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep",
  "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul",
  "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli",
  "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt",
  "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa",
  "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova",
  "Karabük", "Kilis", "Osmaniye", "Düzce",
] as const;

const IL_BUYUK = new Map(TURKIYE_ILLERI.map((il) => [il.toLocaleUpperCase("tr-TR"), il]));

/**
 * Ilanin ham konum metinlerinde ("ANKARA / ÇANKAYA", "Kurum / Antalya, Burdur") acikca gecen
 * illerin resmi adlari. Il adi gecmeyen metin ("BAKANLIK MERKEZ TEŞKİLATI", "TÜRKİYE GENELİ") il vermez.
 */
export function ilanIlleri(hamIller: string[]): string[] {
  const bulunan = new Set<string>();
  for (const ham of hamIller) {
    for (const parca of ham.split(/[/,;]/)) {
      const il = IL_BUYUK.get(parca.trim().replace(/\s+/g, " ").toLocaleUpperCase("tr-TR"));
      if (il) bulunan.add(il);
    }
  }
  return [...bulunan];
}
