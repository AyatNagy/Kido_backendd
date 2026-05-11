/*
  Warnings:

  - You are about to drop the column `childId` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `assessments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[level_number]` on the table `levels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `child_id` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level_number` to the `levels` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assessments` DROP FOREIGN KEY `assessments_childId_fkey`;

-- DropIndex
DROP INDEX `assessments_childId_fkey` ON `assessments`;

-- AlterTable
ALTER TABLE `assessments` DROP COLUMN `childId`,
    DROP COLUMN `createdAt`,
    ADD COLUMN `child_id` INTEGER NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `categories` ADD COLUMN `total_lessons` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `levels` ADD COLUMN `level_number` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `levels_level_number_key` ON `levels`(`level_number`);

-- AddForeignKey
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_child_id_fkey` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
