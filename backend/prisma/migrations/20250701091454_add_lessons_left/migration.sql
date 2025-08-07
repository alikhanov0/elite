/*
  Warnings:

  - A unique constraint covering the columns `[studentId,lessonId]` on the table `StudentLesson` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "repeatId" TEXT;

-- AlterTable
ALTER TABLE "StudentGroup" ADD COLUMN     "lessonsLeft" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "StudentLesson_studentId_lessonId_key" ON "StudentLesson"("studentId", "lessonId");
