-- CreateTable
CREATE TABLE `PaymentLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `type` ENUM('DEPOSIT', 'WITHDRAW', 'REFUND') NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'EGP',
    `paymobOrderId` VARCHAR(191) NULL,
    `paymobTxnId` VARCHAR(191) NULL,
    `rawResponse` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PaymentLog_paymobOrderId_key`(`paymobOrderId`),
    UNIQUE INDEX `PaymentLog_paymobTxnId_key`(`paymobTxnId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PaymentLog` ADD CONSTRAINT `PaymentLog_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ReviewSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentLog` ADD CONSTRAINT `PaymentLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
