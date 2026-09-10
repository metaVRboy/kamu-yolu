-- CreateTable
CREATE TABLE "HaberDepartment" (
    "id" TEXT NOT NULL,
    "haberId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "matchedAlias" TEXT,

    CONSTRAINT "HaberDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HaberDepartment_haberId_departmentId_key" ON "HaberDepartment"("haberId", "departmentId");

-- AddForeignKey
ALTER TABLE "HaberDepartment" ADD CONSTRAINT "HaberDepartment_haberId_fkey" FOREIGN KEY ("haberId") REFERENCES "Haber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HaberDepartment" ADD CONSTRAINT "HaberDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
