-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "matrix" JSONB NOT NULL,
    "criteria" JSONB NOT NULL,
    "alternatives" JSONB NOT NULL,
    "weights" JSONB NOT NULL,
    "thresholds" JSONB NOT NULL,
    "scores" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_seed_key" ON "Project"("seed");
