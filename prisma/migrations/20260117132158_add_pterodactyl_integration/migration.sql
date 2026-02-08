-- AlterTable
ALTER TABLE "users" ADD COLUMN "pterodactylUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_pterodactylUserId_key" ON "users"("pterodactylUserId");

-- AlterTable
ALTER TABLE "servers" ADD COLUMN "pterodactylServerId" TEXT,
ADD COLUMN "eggId" INTEGER;

