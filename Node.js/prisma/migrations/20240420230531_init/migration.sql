-- AlterTable
ALTER TABLE `card` ADD COLUMN `favorite` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `last_active` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `last_booster` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
