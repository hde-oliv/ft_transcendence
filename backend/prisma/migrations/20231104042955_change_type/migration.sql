/*
  Warnings:

  - The `type` column on the `channels` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "channels" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'public';

-- DropEnum
DROP TYPE "ChannelType";
