-- CreateTable
CREATE TABLE "SecmeyemektarifleriLeadIslendi" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "bulundu" BOOLEAN NOT NULL,
    "islenmeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecmeyemektarifleriLeadIslendi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecmeyemektarifleriLeadIslendi_externalId_key" ON "SecmeyemektarifleriLeadIslendi"("externalId");
