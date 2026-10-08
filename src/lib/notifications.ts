import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { aktifProKosulu } from "@/lib/sms";

const DUYURU_ETIKETI = "duyurular";

export async function createBildirim(params: {
  userId: string;
  tur: string;
  baslik: string;
  icerik?: string | null;
  link?: string | null;
}) {
  return prisma.bildirim.create({
    data: {
      userId: params.userId,
      tur: params.tur,
      baslik: params.baslik,
      icerik: params.icerik ?? null,
      link: params.link ?? null,
    },
  });
}

export async function getOkunmamisBildirimSayisi(userId: string): Promise<number> {
  return prisma.bildirim.count({ where: { userId, okundu: false } });
}

export async function getBanaOzelBildirimler(userId: string, limit = 30) {
  return prisma.bildirim.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// Herkes (giris yapmis/yapmamis TUM ziyaretciler) icin ayni sonuc - bildirim
// zili her 2 dakikada bir bunu her acik sekme icin sorguluyor. Duyurular
// dakikalik degismedigi icin kisa sureli cache, ayni anki tum ziyaretcilerin
// tek bir Postgres sorgusunu paylasmasini saglayip veritabani yukunu
// (ve Neon compute-suresini) ciddi olcude azaltiyor.
const yayindakiDuyurular = unstable_cache(
  // Zamanlanmislar da gelir; gorunurluk her istekte yayinZamani <= simdi ile suzulur.
  async () => prisma.duyuru.findMany({ where: { geriCekildi: null }, orderBy: { yayinZamani: "desc" }, take: 100 }),
  ["yayindaki-duyurular"],
  { revalidate: 120, tags: [DUYURU_ETIKETI] },
);

type DuyuruOkuyucu = { abonelikPlani: string; educationLevel: string | null; departmentId: string | null } | null;

/** Duyuru hedefi: HERKES ya da (giris yapmis) kullanicinin plan / ogrenim duzeyi / bolumu. */
function hedefeUyar(d: { hedefTur: string; hedefDeger: string | null }, u: DuyuruOkuyucu) {
  if (d.hedefTur === "HERKES") return true;
  if (!u) return false;
  if (d.hedefTur === "PLAN") return u.abonelikPlani === d.hedefDeger; // getCurrentUser suresi dolan plani UCRETSIZ verir
  if (d.hedefTur === "DUZEY") return u.educationLevel === d.hedefDeger;
  if (d.hedefTur === "BOLUM") return u.departmentId === d.hedefDeger;
  return false;
}

/** Kullaniciya (ya da ziyaretciye) gorunen, yayin zamani gelmis duyurular; en yeni once. */
export async function kullaniciDuyurulari(u: DuyuruOkuyucu) {
  const simdi = Date.now();
  // unstable_cache JSON'a cevirir: tarihler metin gelir.
  return (await yayindakiDuyurular())
    .map((d) => ({ ...d, yayinZamani: new Date(d.yayinZamani) }))
    .filter((d) => d.yayinZamani.getTime() <= simdi && hedefeUyar(d, u));
}

/** Bir duyuru hedefinin kac uyeye ulasacagi (giris yapmamis ziyaretciler HERKES'e ayrica dahil). */
export async function hedefKitleSayisi(hedefTur: string, hedefDeger: string | null) {
  if (hedefTur === "DUZEY") return prisma.user.count({ where: { educationLevel: hedefDeger as never } });
  if (hedefTur === "BOLUM") return prisma.user.count({ where: { departmentId: hedefDeger } });
  if (hedefTur === "PLAN") {
    const aktif = (plan: "PRO" | "PRO_PLUS") => prisma.user.count({ where: { ...aktifProKosulu(), abonelikPlani: plan } });
    if (hedefDeger === "PRO" || hedefDeger === "PRO_PLUS") return aktif(hedefDeger);
    // UCRETSIZ = suresi dolanlar dahil, aktif ucretli olmayan herkes
    const [toplam, pro, proPlus] = await Promise.all([prisma.user.count(), aktif("PRO"), aktif("PRO_PLUS")]);
    return toplam - pro - proPlus;
  }
  return prisma.user.count();
}

/** Admin duyuru ekleyip geri cekince zil hemen guncellensin. */
export function duyurulariYenile() {
  revalidateTag(DUYURU_ETIKETI, { expire: 0 });
}

export async function markBildirimlerOkundu(userId: string) {
  await Promise.all([
    prisma.bildirim.updateMany({ where: { userId, okundu: false }, data: { okundu: true } }),
    // Uygulama saati: duyuru yayinZamani da uygulamada yazilir (ayni saatle karsilastirilir).
    prisma.user.update({ where: { id: userId }, data: { duyuruGorulme: new Date() } }),
  ]);
}

export async function deleteBildirim(id: string, userId: string) {
  await prisma.bildirim.deleteMany({ where: { id, userId } });
}

export async function deleteTumBildirimler(userId: string) {
  await prisma.bildirim.deleteMany({ where: { userId } });
}

/**
 * Yeni bir ilan belirli bolumlerle eslestiginde, o bolumu profilinde
 * secmis kullanicilara "bolumune uygun ilan" bildirimi olusturur.
 * Scraper, her ilanin bolum eslesmeleri kaydedildikten sonra cagirir.
 *
 * Bu, "Bana ozel ilanlar" ile ayni Pro ozelligi - Standart (UCRETSIZ)
 * kullanicilar bu bildirimi almaz.
 */
export async function notifyUsersForMatchedPosting(params: {
  postingTitle: string;
  departments: { departmentId: string; slug: string }[];
}) {
  if (params.departments.length === 0) return;

  const users = await prisma.user.findMany({
    where: {
      departmentId: { in: params.departments.map((d) => d.departmentId) },
      ...aktifProKosulu(),
    },
    select: { id: true, departmentId: true },
  });
  if (users.length === 0) return;

  const slugByDeptId = new Map(params.departments.map((d) => [d.departmentId, d.slug]));

  await prisma.bildirim.createMany({
    data: users.map((u) => ({
      userId: u.id,
      tur: "ILAN_ESLESME",
      baslik: "Bölümüne uygun yeni ilan",
      icerik: params.postingTitle,
      link: `/bolum/${slugByDeptId.get(u.departmentId!)}`,
    })),
  });
}
