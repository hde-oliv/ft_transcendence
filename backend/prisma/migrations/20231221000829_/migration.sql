/*
  Warnings:

  - You are about to drop the column `targer_id` on the `blocked_users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[issuer_id,target_id]` on the table `blocked_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `target_id` to the `blocked_users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "blocked_users" DROP CONSTRAINT "blocked_users_targer_id_fkey";

-- DropIndex
DROP INDEX "blocked_users_issuer_id_targer_id_key";

-- AlterTable
ALTER TABLE "blocked_users" DROP COLUMN "targer_id",
ADD COLUMN     "target_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "blocked_users_issuer_id_target_id_key" ON "blocked_users"("issuer_id", "target_id");

-- AddForeignKey
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
