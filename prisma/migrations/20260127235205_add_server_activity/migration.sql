-- CreateTable
CREATE TABLE "server_activities" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "server_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "server_activities_serverId_createdAt_idx" ON "server_activities"("serverId", "createdAt");

-- CreateIndex
CREATE INDEX "server_activities_userId_createdAt_idx" ON "server_activities"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "server_activities" ADD CONSTRAINT "server_activities_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_activities" ADD CONSTRAINT "server_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
