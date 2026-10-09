import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Profil formundaki bolum secimi (sitede ProfilForm'a sunucudan gelen liste). */
export async function GET() {
  const bolumler = await prisma.department.findMany({ select: { id: true, name: true, level: true }, orderBy: { name: "asc" } });
  return NextResponse.json(bolumler.map((b) => ({ id: b.id, ad: b.name, duzey: b.level })));
}
