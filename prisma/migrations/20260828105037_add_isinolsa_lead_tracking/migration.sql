-- CreateTable
CREATE TABLE "IsinolsaLeadIslendi" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "bulundu" BOOLEAN NOT NULL,
    "islenmeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IsinolsaLeadIslendi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IsinolsaLeadIslendi_externalId_key" ON "IsinolsaLeadIslendi"("externalId");
