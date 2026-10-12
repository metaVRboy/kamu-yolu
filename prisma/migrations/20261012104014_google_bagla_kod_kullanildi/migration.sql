-- AlterTable
ALTER TABLE "Oturum" ADD COLUMN     "kodKullanildi" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleBaglamaKapali" BOOLEAN NOT NULL DEFAULT false;
