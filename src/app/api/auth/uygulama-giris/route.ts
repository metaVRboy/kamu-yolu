import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { uygulamaGirisKoduKullan } from "@/lib/auth";

/** Mobil uygulama, Google girisinden donen tek kullanimlik kodu buraya yollar; oturum cerezi uygulamanin cerez deposuna yazilir. */
export async function POST(req: NextRequest) {
  const parsed = z.object({ kod: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success || !(await uygulamaGirisKoduKullan(parsed.data.kod))) {
    return NextResponse.json({ error: "Google ile giriş tamamlanamadı, lütfen tekrar dene." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
