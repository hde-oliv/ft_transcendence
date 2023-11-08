-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "fOne" TEXT NOT NULL,
    "fTwo" TEXT NOT NULL,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "friendships_fOne_idx" ON "friendships"("fOne");

-- CreateIndex
CREATE INDEX "friendships_fTwo_idx" ON "friendships"("fTwo");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_fOne_fTwo_key" ON "friendships"("fOne", "fTwo");

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_fOne_fkey" FOREIGN KEY ("fOne") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_fTwo_fkey" FOREIGN KEY ("fTwo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
