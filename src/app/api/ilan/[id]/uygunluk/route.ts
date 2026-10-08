import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPostingById } from "@/lib/matching";
import { LEVEL_LABEL } from "@/lib/labels";

export type UygunlukDurumu = "uygun" | "uygun-degil" | "bilinmiyor" | "sart-yok";
export type UygunlukCevabi =
  | { giris: false }
  | {
      giris: true;
      bolum: { durum: UygunlukDurumu; profilBolumu: string | null };
      duzey: { durum: UygunlukDurumu; profilDuzeyi: string | null; istenen: string[] };
    };

/**
 * Ilan sayfasindaki "Bu ilan sana uygun mu?" kutusu. Ilan sayfasi onbellekli
 * (ISR) kalsin diye kisiye ozel kisim ayri, istemciden cagrilan bu uctan gelir.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const [user, posting] = await Promise.all([getCurrentUser(), params.then(({ id }) => getPostingById(id))]);
  if (!posting) return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
  if (!user) return NextResponse.json({ giris: false } satisfies UygunlukCevabi);

  const ilanBolumleri = posting.departments.map((d) => d.departmentId);
  const profilBolumu = posting.departments.find((d) => d.departmentId === user.departmentId)?.department.name ?? null;
  const bolumDurumu: UygunlukDurumu = !posting.isDepartmentRestricted
    ? "sart-yok"
    : !user.departmentId
      ? "bilinmiyor"
      : ilanBolumleri.includes(user.departmentId)
        ? "uygun"
        : "uygun-degil";

  const istenen = posting.educationLevels;
  const duzeyDurumu: UygunlukDurumu =
    istenen.length === 0 ? "sart-yok" : !user.educationLevel ? "bilinmiyor" : istenen.includes(user.educationLevel) ? "uygun" : "uygun-degil";

  return NextResponse.json({
    giris: true,
    bolum: { durum: bolumDurumu, profilBolumu },
    duzey: {
      durum: duzeyDurumu,
      profilDuzeyi: user.educationLevel ? (LEVEL_LABEL[user.educationLevel] ?? user.educationLevel) : null,
      istenen: istenen.map((l) => LEVEL_LABEL[l] ?? l),
    },
  } satisfies UygunlukCevabi);
}
