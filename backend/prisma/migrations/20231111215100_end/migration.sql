-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "intra_login" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "otp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "otp_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp_base32" TEXT,
    "otp_auth_url" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "fOne" TEXT NOT NULL,
    "fTwo" TEXT NOT NULL,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "owner" BOOLEAN NOT NULL DEFAULT false,
    "administrator" BOOLEAN NOT NULL DEFAULT false,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "muted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'public',
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "protected" BOOLEAN NOT NULL DEFAULT false,
    "user2user" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_users" (
    "id" TEXT NOT NULL,
    "issuer_id" TEXT NOT NULL,
    "targer_id" TEXT NOT NULL,

    CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "p_one" TEXT NOT NULL,
    "p_two" TEXT NOT NULL,
    "p_one_score" INTEGER NOT NULL,
    "p_two_score" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_intra_login_key" ON "users"("intra_login" ASC);

-- CreateIndex
CREATE INDEX "users_nickname_idx" ON "users"("nickname");

-- CreateIndex
CREATE INDEX "users_elo_idx" ON "users"("elo");

-- CreateIndex
CREATE INDEX "friendships_fOne_idx" ON "friendships"("fOne");

-- CreateIndex
CREATE INDEX "friendships_fTwo_idx" ON "friendships"("fTwo");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_fOne_fTwo_key" ON "friendships"("fOne", "fTwo");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_id_key" ON "memberships"("id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_channelId_userId_key" ON "memberships"("channelId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "channels_id_key" ON "channels"("id");

-- CreateIndex
CREATE UNIQUE INDEX "channels_name_key" ON "channels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_users_issuer_id_targer_id_key" ON "blocked_users"("issuer_id", "targer_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_user_id_target_id_key" ON "invites"("user_id", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_id_key" ON "matches"("id");

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_fOne_fkey" FOREIGN KEY ("fOne") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_fTwo_fkey" FOREIGN KEY ("fTwo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_p_one_fkey" FOREIGN KEY ("p_one") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_p_two_fkey" FOREIGN KEY ("p_two") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
