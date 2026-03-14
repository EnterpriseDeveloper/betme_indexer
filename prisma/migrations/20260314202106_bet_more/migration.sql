-- AlterTable
-- Use DEFAULT so existing rows get a value (required when table is not empty)
ALTER TABLE "Participant" ADD COLUMN "increase" BOOLEAN NOT NULL DEFAULT false;
