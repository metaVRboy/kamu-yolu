-- CreateTable
CREATE TABLE "YukseltmeTalebi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "AbonelikPlani" NOT NULL,
    "yillik" BOOLEAN NOT NULL,
    "kaynak" TEXT NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YukseltmeTalebi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YukseltmeTalebi_userId_key" ON "YukseltmeTalebi"("userId");

-- AddForeignKey
ALTER TABLE "YukseltmeTalebi" ADD CONSTRAINT "YukseltmeTalebi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
