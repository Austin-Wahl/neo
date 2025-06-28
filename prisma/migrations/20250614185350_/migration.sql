/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `database` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[databaseConnectionId]` on the table `database` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `databaseConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "database_id_key" ON "database"("id");

-- CreateIndex
CREATE UNIQUE INDEX "database_databaseConnectionId_key" ON "database"("databaseConnectionId");

-- CreateIndex
CREATE UNIQUE INDEX "databaseConnection_id_key" ON "databaseConnection"("id");
