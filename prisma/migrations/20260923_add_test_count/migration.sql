-- Add testCount column to Vacancy for random test subset
ALTER TABLE "Vacancy" ADD COLUMN "testCount" INTEGER NOT NULL DEFAULT 15;
