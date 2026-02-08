/*
  Warnings:

  - You are about to drop the column `identityVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `identityVerifiedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripeIdentitySessionId` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_stripeIdentitySessionId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "identityVerified",
DROP COLUMN "identityVerifiedAt",
DROP COLUMN "stripeIdentitySessionId";
