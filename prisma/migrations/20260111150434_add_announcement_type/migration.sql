-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "type" "AnnouncementType" NOT NULL DEFAULT 'INFO';
