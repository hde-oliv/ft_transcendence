/*
  Warnings:

  - You are about to drop the column `two_fa_token` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "two_fa_token",
ADD COLUMN     "otp_ascii" TEXT,
ADD COLUMN     "otp_auth_url" TEXT,
ADD COLUMN     "otp_base32" TEXT,
ADD COLUMN     "otp_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp_hex" TEXT,
ADD COLUMN     "otp_verified" BOOLEAN NOT NULL DEFAULT false;
