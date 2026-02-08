/*
  Warnings:

  - A unique constraint covering the columns `[supportPin]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'SALES_TEAM', 'SUPPORT_TEAM', 'TECHNICIAN', 'MANAGEMENT', 'FOUNDER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "supportPin" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_supportPin_key" ON "users"("supportPin");
