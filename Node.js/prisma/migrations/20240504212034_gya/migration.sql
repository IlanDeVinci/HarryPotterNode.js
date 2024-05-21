/*
  Warnings:

  - You are about to drop the column `amountofnewtrades` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `cardtradingid` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `istrading` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `amountofnewtrades`,
    DROP COLUMN `cardtradingid`,
    DROP COLUMN `istrading`,
    ADD COLUMN `amountofnewactive` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `amountofnewcompleted` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `amountofnewrequests` INTEGER NOT NULL DEFAULT 0;
