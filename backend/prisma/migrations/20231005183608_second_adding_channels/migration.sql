/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('private', 'public');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "two_fa_token" TEXT NOT NULL,
    "intra_login" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "owner" BOOLEAN NOT NULL,
    "administrator" BOOLEAN NOT NULL,
    "banned" BOOLEAN NOT NULL,
    "muted" BOOLEAN NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" SERIAL NOT NULL,
    "type" "ChannelType" NOT NULL DEFAULT 'public',
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "protected" BOOLEAN NOT NULL,
    "user2user" BOOLEAN NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "users_intra_login_key" ON "users"("intra_login" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "memberships_id_key" ON "memberships"("id");

-- CreateIndex
CREATE UNIQUE INDEX "channels_id_key" ON "channels"("id");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
