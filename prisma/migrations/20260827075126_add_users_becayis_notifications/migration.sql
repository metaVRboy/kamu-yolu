-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "telefon" TEXT,
    "meslek" TEXT,
    "kurumTuru" TEXT,
    "departmentId" TEXT,
    "educationLevel" "EducationLevel",
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BecayisTalep" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "meslek" TEXT NOT NULL,
    "kurumTuru" TEXT,
    "mevcutIl" TEXT NOT NULL,
    "mevcutIlce" TEXT,
    "istenenIller" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aciklama" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BecayisTalep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BecayisMesaj" (
    "id" TEXT NOT NULL,
    "talepId" TEXT NOT NULL,
    "gonderenId" TEXT NOT NULL,
    "konusmaKarsiId" TEXT NOT NULL,
    "mesaj" TEXT NOT NULL,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BecayisMesaj_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duyuru" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Duyuru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bildirim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT,
    "link" TEXT,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bildirim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "BecayisTalep_isActive_idx" ON "BecayisTalep"("isActive");

-- CreateIndex
CREATE INDEX "BecayisTalep_mevcutIl_idx" ON "BecayisTalep"("mevcutIl");

-- CreateIndex
CREATE INDEX "BecayisMesaj_talepId_konusmaKarsiId_idx" ON "BecayisMesaj"("talepId", "konusmaKarsiId");

-- CreateIndex
CREATE INDEX "Bildirim_userId_okundu_idx" ON "Bildirim"("userId", "okundu");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BecayisTalep" ADD CONSTRAINT "BecayisTalep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BecayisMesaj" ADD CONSTRAINT "BecayisMesaj_talepId_fkey" FOREIGN KEY ("talepId") REFERENCES "BecayisTalep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BecayisMesaj" ADD CONSTRAINT "BecayisMesaj_gonderenId_fkey" FOREIGN KEY ("gonderenId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bildirim" ADD CONSTRAINT "Bildirim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
