-- AlterTable
ALTER TABLE "users" ADD COLUMN     "identityVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "identityVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "stripeIdentitySessionId" TEXT;
