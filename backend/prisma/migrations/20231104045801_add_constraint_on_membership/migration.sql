/*
  Warnings:

  - A unique constraint covering the columns `[channelId,userId]` on the table `memberships` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "memberships_channelId_userId_key" ON "memberships"("channelId", "userId");
