import { prisma } from "@/lib/prisma";
import { seriDurumu } from "@/lib/gunlukSorular";
import type { RozetRengi } from "@/lib/rozetRenkleri";

/** Rozetler saklanmaz; her seferinde gercek kayitlardan hesaplanir (sahte/elle rozet olamaz). */
export const ROZETLER: { id: string; ad: string; aciklama: string; renk: RozetRengi }[] = [
  { id: "ilk-deneme", ad: "İlk deneme", aciklama: "İlk KPSS denemeni bitirdin.", renk: "mavi" },
  { id: "deneme-10", ad: "10 deneme", aciklama: "10 KPSS denemesi bitirdin.", renk: "mavi" },
  { id: "puan-80", ad: "80+ puan", aciklama: "Bir denemede 80 puanı geçtin.", renk: "mavi" },
  { id: "ilk-gunluk", ad: "Güne başladım", aciklama: "Günün 5 sorusunu ilk kez çözdün.", renk: "turuncu" },
  { id: "tam-isabet", ad: "Tam isabet", aciklama: "Günün 5 sorusunun hepsini doğru bildin.", renk: "turuncu" },
  { id: "seri-7", ad: "7 gün seri", aciklama: "7 gün üst üste günün sorularını çözdün.", renk: "turuncu" },
  { id: "seri-30", ad: "30 gün seri", aciklama: "30 gün üst üste günün sorularını çözdün.", renk: "turuncu" },
  { id: "gunluk-50", ad: "50 gün", aciklama: "50 farklı günde günün sorularını çözdün.", renk: "turuncu" },
  { id: "ilk-takip", ad: "Takipte", aciklama: "İlk ilanını takibe aldın.", renk: "yesil" },
  { id: "davet", ad: "Elçi", aciklama: "Bir arkadaşın davetinle üye oldu ve profilini tamamladı.", renk: "yesil" },
  { id: "pro", ad: "Pro üye", aciklama: "Pro ya da Pro+ üyesin.", renk: "mor" },
];

/** Profil karti ve rozet sayfasi icin: kazanilan rozetler + kartta gosterilen sayilar. */
export async function rozetDurumu(user: { id: string; departmentId: string | null; educationLevel: string | null; abonelikPlani: string }) {
  const [denemeler, enIyiPuan, tamIsabet, takip, davet, seri] = await Promise.all([
    prisma.denemeKatilim.count({ where: { userId: user.id, bitisZamani: { not: null } } }),
    prisma.denemeKatilim.aggregate({ where: { userId: user.id, bitisZamani: { not: null } }, _max: { puan: true } }),
    prisma.gunlukSoruCevap.count({ where: { userId: user.id, dogru: { gte: 5 } } }),
    prisma.ilanTakip.count({ where: { userId: user.id } }),
    prisma.user.count({ where: { davetEdenId: user.id, departmentId: { not: null } } }),
    seriDurumu(user.id),
  ]);
  const kosul: Record<string, boolean> = {
    "ilk-deneme": denemeler >= 1,
    "deneme-10": denemeler >= 10,
    "puan-80": (enIyiPuan._max.puan ?? 0) >= 80,
    "ilk-gunluk": seri.toplamGun >= 1,
    "tam-isabet": tamIsabet >= 1,
    "seri-7": seri.enIyi >= 7,
    "seri-30": seri.enIyi >= 30,
    "gunluk-50": seri.toplamGun >= 50,
    "ilk-takip": takip >= 1,
    davet: davet >= 1,
    pro: user.abonelikPlani !== "UCRETSIZ",
  };
  return {
    rozetler: ROZETLER.map((r) => ({ ...r, kazanildi: kosul[r.id] })),
    denemeSayisi: denemeler,
    seri,
  };
}
