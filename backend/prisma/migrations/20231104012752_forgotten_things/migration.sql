/*
  Warnings:

  - You are about to drop the column `online` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "online",
ADD COLUMN     "elo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'offline';
