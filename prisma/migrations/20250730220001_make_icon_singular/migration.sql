/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `Icon` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Icon_projectId_key" ON "Icon"("projectId");
