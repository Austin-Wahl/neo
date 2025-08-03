-- CreateTable
CREATE TABLE "Icon" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Icon_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Icon" ADD CONSTRAINT "Icon_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
