/*
  Warnings:

  - The `type` column on the `channels` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('private', 'public');

-- AlterTable
ALTER TABLE "channels" DROP COLUMN "type",
ADD COLUMN     "type" "ChannelType" NOT NULL DEFAULT 'public';

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "kicked" BOOLEAN NOT NULL DEFAULT false;
