-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketQueueEntry" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "fanName" TEXT NOT NULL,
    "ticketValue" TEXT,
    "joinedQueueAt" TEXT NOT NULL,
    "eventStartsAt" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "loyaltyPoints" INTEGER,
    "upgradesLast30Days" INTEGER,
    "membership" TEXT,
    "phoneNumber" TEXT,
    "deviceId" TEXT,
    "paymentAccount" TEXT,

    CONSTRAINT "TicketQueueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrontRowUpgradeResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "winnerId" TEXT,

    CONSTRAINT "FrontRowUpgradeResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankedEntry" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasons" TEXT[],

    CONSTRAINT "RankedEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanGroup" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "representativeId" TEXT,
    "connectionReasons" TEXT[],

    CONSTRAINT "FanGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExcludedEntry" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "ExcludedEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FanGroupToTicketQueueEntry" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FrontRowUpgradeResult_winnerId_key" ON "FrontRowUpgradeResult"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "FanGroup_representativeId_key" ON "FanGroup"("representativeId");

-- CreateIndex
CREATE UNIQUE INDEX "_FanGroupToTicketQueueEntry_AB_unique" ON "_FanGroupToTicketQueueEntry"("A", "B");

-- CreateIndex
CREATE INDEX "_FanGroupToTicketQueueEntry_B_index" ON "_FanGroupToTicketQueueEntry"("B");

-- AddForeignKey
ALTER TABLE "FrontRowUpgradeResult" ADD CONSTRAINT "FrontRowUpgradeResult_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "RankedEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankedEntry" ADD CONSTRAINT "RankedEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "TicketQueueEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanGroup" ADD CONSTRAINT "FanGroup_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "FrontRowUpgradeResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanGroup" ADD CONSTRAINT "FanGroup_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "RankedEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcludedEntry" ADD CONSTRAINT "ExcludedEntry_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "FrontRowUpgradeResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcludedEntry" ADD CONSTRAINT "ExcludedEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "TicketQueueEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FanGroupToTicketQueueEntry" ADD CONSTRAINT "_FanGroupToTicketQueueEntry_A_fkey" FOREIGN KEY ("A") REFERENCES "FanGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FanGroupToTicketQueueEntry" ADD CONSTRAINT "_FanGroupToTicketQueueEntry_B_fkey" FOREIGN KEY ("B") REFERENCES "TicketQueueEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
