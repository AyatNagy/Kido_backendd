-- CreateTable
CREATE TABLE `assessments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `childId` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `children`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
