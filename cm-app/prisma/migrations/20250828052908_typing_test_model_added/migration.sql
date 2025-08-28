-- CreateTable
CREATE TABLE "public"."TypingTest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wpm" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "passageType" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TypingTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TypingTest_userId_completedAt_idx" ON "public"."TypingTest"("userId", "completedAt");

-- AddForeignKey
ALTER TABLE "public"."TypingTest" ADD CONSTRAINT "TypingTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
