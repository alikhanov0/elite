-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "photo" TEXT NOT NULL,
    "head" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
