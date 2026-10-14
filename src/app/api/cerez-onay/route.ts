import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { yasalKayitYaz } from "@/lib/yasalKayit";

const bodySchema = z.object({ olcum: z.boolean(), surum: z.string().max(20) });

/** Cerez tercihinin ispat kaydi (KVKK: rizanin alindigini ispat yuku veri sorumlusunda). */
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  const { olcum, surum } = parsed.data;
  const user = await getCurrentUser();
  await yasalKayitYaz("cerez-onay", user?.id ?? null, `olcum=${olcum ? 1 : 0};surum=${surum}`);
  return NextResponse.json({ ok: true });
}
