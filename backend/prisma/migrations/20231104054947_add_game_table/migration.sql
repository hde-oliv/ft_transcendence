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
CREATE UNIQUE INDEX "matches_id_key" ON "matches"("id");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_p_one_fkey" FOREIGN KEY ("p_one") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_p_two_fkey" FOREIGN KEY ("p_two") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
