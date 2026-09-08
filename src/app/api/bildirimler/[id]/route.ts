import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteBildirim } from "@/lib/notifications";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const { id } = await params;
  await deleteBildirim(id, user.id);
  return NextResponse.json({ ok: true });
}
