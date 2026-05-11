/*
  Warnings:

  - You are about to drop the column `course_id` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `order_number` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `assignment_completed` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `assignment_id` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `exam_id` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `exam_score` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the `assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `child_courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `child_exams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exams` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[child_id,lesson_id]` on the table `progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category_id` to the `lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lesson_id` to the `progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assignments` DROP FOREIGN KEY `assignments_lesson_id_fkey`;

-- DropForeignKey
ALTER TABLE `child_courses` DROP FOREIGN KEY `child_courses_child_id_fkey`;

-- DropForeignKey
ALTER TABLE `child_courses` DROP FOREIGN KEY `child_courses_course_id_fkey`;

-- DropForeignKey
ALTER TABLE `child_exams` DROP FOREIGN KEY `child_exams_child_id_fkey`;

-- DropForeignKey
ALTER TABLE `child_exams` DROP FOREIGN KEY `child_exams_exam_id_fkey`;

-- DropForeignKey
ALTER TABLE `exams` DROP FOREIGN KEY `exams_course_id_fkey`;

-- DropForeignKey
ALTER TABLE `lessons` DROP FOREIGN KEY `lessons_course_id_fkey`;

-- DropForeignKey
ALTER TABLE `progress` DROP FOREIGN KEY `progress_assignment_id_fkey`;

-- DropForeignKey
ALTER TABLE `progress` DROP FOREIGN KEY `progress_course_id_fkey`;

-- DropForeignKey
ALTER TABLE `progress` DROP FOREIGN KEY `progress_exam_id_fkey`;

-- DropIndex
DROP INDEX `lessons_course_id_fkey` ON `lessons`;

-- DropIndex
DROP INDEX `progress_assignment_id_fkey` ON `progress`;

-- DropIndex
DROP INDEX `progress_course_id_fkey` ON `progress`;

-- DropIndex
DROP INDEX `progress_exam_id_fkey` ON `progress`;

-- AlterTable
ALTER TABLE `children` ADD COLUMN `allowedLevel` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `lessons` DROP COLUMN `course_id`,
    DROP COLUMN `created_at`,
    DROP COLUMN `order_number`,
    ADD COLUMN `category_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `progress` DROP COLUMN `assignment_completed`,
    DROP COLUMN `assignment_id`,
    DROP COLUMN `course_id`,
    DROP COLUMN `exam_id`,
    DROP COLUMN `exam_score`,
    DROP COLUMN `grade`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `completed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `is_completed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lesson_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `assignments`;

-- DropTable
DROP TABLE `child_courses`;

-- DropTable
DROP TABLE `child_exams`;

-- DropTable
DROP TABLE `courses`;

-- DropTable
DROP TABLE `exams`;

-- CreateTable
CREATE TABLE `levels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `level_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `progress_child_id_lesson_id_key` ON `progress`(`child_id`, `lesson_id`);

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_level_id_fkey` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progress` ADD CONSTRAINT `progress_lesson_id_fkey` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
