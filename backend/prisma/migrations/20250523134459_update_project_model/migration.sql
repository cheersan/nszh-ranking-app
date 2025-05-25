/*
  Warnings:

  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `alternatives` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `criteria` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `matrix` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `thresholds` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `weights` on the `Project` table. All the data in the column will be lost.
  - The `id` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `matrixData` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weightsAndThresholds` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
DROP COLUMN "alternatives",
DROP COLUMN "criteria",
DROP COLUMN "matrix",
DROP COLUMN "thresholds",
DROP COLUMN "weights",
ADD COLUMN     "matrixData" JSONB NOT NULL,
ADD COLUMN     "weightsAndThresholds" JSONB NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Alternative" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "income" DOUBLE PRECISION NOT NULL,
    "contribution" DOUBLE PRECISION NOT NULL,
    "term" DOUBLE PRECISION NOT NULL,
    "payoutType" TEXT NOT NULL,
    "payoutEncoded" INTEGER NOT NULL,
    "paymentFrequency" TEXT NOT NULL,
    "paymentFrequencyEncoded" INTEGER NOT NULL,
    "taxDeduction" BOOLEAN NOT NULL,
    "capitalProtection" BOOLEAN NOT NULL,
    "beneficiaryChange" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alternative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Criterion" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "direction" TEXT NOT NULL,

    CONSTRAINT "Criterion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Criterion_name_key" ON "Criterion"("name");
