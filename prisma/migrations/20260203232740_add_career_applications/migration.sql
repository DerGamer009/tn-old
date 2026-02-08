-- CreateTable
CREATE TABLE "career_applications" (
    "id" TEXT NOT NULL,
    "jobSlug" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "career_applications_userId_idx" ON "career_applications"("userId");

-- CreateIndex
CREATE INDEX "career_applications_jobSlug_idx" ON "career_applications"("jobSlug");

-- CreateIndex
CREATE INDEX "career_applications_createdAt_idx" ON "career_applications"("createdAt");

-- AddForeignKey
ALTER TABLE "career_applications" ADD CONSTRAINT "career_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
