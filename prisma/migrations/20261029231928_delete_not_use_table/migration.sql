/*
  Warnings:

  - You are about to drop the `ExcludedEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FanGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FrontRowUpgradeResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RankedEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FanGroupToTicketQueueEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExcludedEntry" DROP CONSTRAINT "ExcludedEntry_entryId_fkey";

-- DropForeignKey
ALTER TABLE "ExcludedEntry" DROP CONSTRAINT "ExcludedEntry_resultId_fkey";

-- DropForeignKey
ALTER TABLE "FanGroup" DROP CONSTRAINT "FanGroup_representativeId_fkey";

-- DropForeignKey
ALTER TABLE "FanGroup" DROP CONSTRAINT "FanGroup_resultId_fkey";

-- DropForeignKey
ALTER TABLE "FrontRowUpgradeResult" DROP CONSTRAINT "FrontRowUpgradeResult_winnerId_fkey";

-- DropForeignKey
ALTER TABLE "RankedEntry" DROP CONSTRAINT "RankedEntry_entryId_fkey";

-- DropForeignKey
ALTER TABLE "_FanGroupToTicketQueueEntry" DROP CONSTRAINT "_FanGroupToTicketQueueEntry_A_fkey";

-- DropForeignKey
ALTER TABLE "_FanGroupToTicketQueueEntry" DROP CONSTRAINT "_FanGroupToTicketQueueEntry_B_fkey";

-- DropTable
DROP TABLE "ExcludedEntry";

-- DropTable
DROP TABLE "FanGroup";

-- DropTable
DROP TABLE "FrontRowUpgradeResult";

-- DropTable
DROP TABLE "RankedEntry";

-- DropTable
DROP TABLE "_FanGroupToTicketQueueEntry";
