-- CreateTable
CREATE TABLE "checkout_settings" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "buyerApproved" BOOLEAN NOT NULL DEFAULT false,
    "orderApproved" BOOLEAN NOT NULL DEFAULT false,
    "orderCompleted" BOOLEAN NOT NULL DEFAULT true,
    "orderDeclined" BOOLEAN NOT NULL DEFAULT false,
    "orderSaved" BOOLEAN NOT NULL DEFAULT false,
    "orderVoided" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_settings_pkey" PRIMARY KEY ("id")
);
