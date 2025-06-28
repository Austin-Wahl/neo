-- CreateEnum
CREATE TYPE "DatabaseTypes" AS ENUM ('Postgres', 'MySQL');

-- CreateTable
CREATE TABLE "databaseConnection" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "databaseType" "DatabaseTypes" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "databaseConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "database" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "databaseConnectionId" TEXT NOT NULL,
    "databaseType" "DatabaseTypes" NOT NULL,
    "hostname" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "ssl" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "database_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "databaseConnection" ADD CONSTRAINT "databaseConnection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "databaseConnection" ADD CONSTRAINT "databaseConnection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "database" ADD CONSTRAINT "database_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "database" ADD CONSTRAINT "database_databaseConnectionId_fkey" FOREIGN KEY ("databaseConnectionId") REFERENCES "databaseConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
