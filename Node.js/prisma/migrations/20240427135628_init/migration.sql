-- AlterTable
ALTER TABLE `user` ADD COLUMN `cardtradingid` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `istrading` BOOLEAN NOT NULL DEFAULT false;
