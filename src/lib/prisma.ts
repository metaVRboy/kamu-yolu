import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL artik Neon'un PgBouncer tabanli pooled baglantisini
// gosteriyor; her serverless fonksiyon orneginin kendi tarafinda ayrica
// buyuk bir havuz tutmasina gerek yok - pooler zaten cok sayida istemciyi
// az sayida gercek Postgres baglantisina coklu yor.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!, max: 5 });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
