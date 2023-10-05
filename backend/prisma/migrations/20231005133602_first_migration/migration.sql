/*
  Warnings:

  - A unique constraint covering the columns `[intraLogin]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_intraLogin_key" ON "User"("intraLogin" DESC);
