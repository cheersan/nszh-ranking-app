/*
  Warnings:

  - You are about to drop the column `matrixData` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `weightsAndThresholds` on the `Project` table. All the data in the column will be lost.
  - Added the required column `directions` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thresholds` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weights` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Made the column `scores` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "matrixData",
DROP COLUMN "weightsAndThresholds",
ADD COLUMN     "alternativeIds" INTEGER[],
ADD COLUMN     "criterionIds" INTEGER[],
ADD COLUMN     "directions" JSONB NOT NULL,
ADD COLUMN     "intermediateResults" JSONB,
ADD COLUMN     "matrix" JSONB NOT NULL,
ADD COLUMN     "thresholds" JSONB NOT NULL,
ADD COLUMN     "weights" JSONB NOT NULL,
ALTER COLUMN "scores" SET NOT NULL;
