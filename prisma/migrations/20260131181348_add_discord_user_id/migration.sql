/*
  Warnings:

  - A unique constraint covering the columns `[discordUserId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "discordUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_discordUserId_key" ON "users"("discordUserId");
