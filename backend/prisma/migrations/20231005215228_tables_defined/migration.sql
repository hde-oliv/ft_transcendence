-- AlterTable
ALTER TABLE "channels" ALTER COLUMN "protected" SET DEFAULT false,
ALTER COLUMN "user2user" SET DEFAULT false;

-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "owner" SET DEFAULT false,
ALTER COLUMN "administrator" SET DEFAULT false,
ALTER COLUMN "banned" SET DEFAULT false,
ALTER COLUMN "muted" SET DEFAULT false;

-- CreateTable
CREATE TABLE "blocked_users" (
    "id" TEXT NOT NULL,
    "issuer_id" INTEGER NOT NULL,
    "targer_id" INTEGER NOT NULL,

    CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "target_id" INTEGER NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocked_users_issuer_id_targer_id_key" ON "blocked_users"("issuer_id", "targer_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_user_id_target_id_key" ON "invites"("user_id", "target_id");

-- AddForeignKey
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_issuer_id_fkey" FOREIGN KEY ("issuer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_targer_id_fkey" FOREIGN KEY ("targer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
