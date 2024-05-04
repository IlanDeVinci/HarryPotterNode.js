-- DropForeignKey
ALTER TABLE `trade` DROP FOREIGN KEY `Trade_receiverCardId_fkey`;

-- AlterTable
ALTER TABLE `trade` MODIFY `receiverCardId` INTEGER NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE `Trade` ADD CONSTRAINT `Trade_receiverCardId_fkey` FOREIGN KEY (`receiverCardId`) REFERENCES `Card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
