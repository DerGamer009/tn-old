-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('OPERATIONAL', 'DEGRADED', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('MAINTENANCE', 'MINOR', 'MAJOR', 'CRITICAL');

-- CreateTable
CREATE TABLE "system_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "category" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_metrics" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "uptime" DOUBLE PRECISION NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_incidents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'INVESTIGATING',
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MINOR',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_updates" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StatusIncidentToSystemService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "system_services_name_key" ON "system_services"("name");

-- CreateIndex
CREATE UNIQUE INDEX "system_services_slug_key" ON "system_services"("slug");

-- CreateIndex
CREATE INDEX "service_metrics_serviceId_date_idx" ON "service_metrics"("serviceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "_StatusIncidentToSystemService_AB_unique" ON "_StatusIncidentToSystemService"("A", "B");

-- CreateIndex
CREATE INDEX "_StatusIncidentToSystemService_B_index" ON "_StatusIncidentToSystemService"("B");

-- AddForeignKey
ALTER TABLE "service_metrics" ADD CONSTRAINT "service_metrics_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "system_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_updates" ADD CONSTRAINT "incident_updates_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "status_incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StatusIncidentToSystemService" ADD CONSTRAINT "_StatusIncidentToSystemService_A_fkey" FOREIGN KEY ("A") REFERENCES "status_incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StatusIncidentToSystemService" ADD CONSTRAINT "_StatusIncidentToSystemService_B_fkey" FOREIGN KEY ("B") REFERENCES "system_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
