/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `isQuota` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `purchasedUnits` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `suggestionUrl` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `totalUnits` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `unitsBought` on the `Purchase` table. All the data in the column will be lost.
  - Added the required column `name` to the `Gift` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Gift` table without a default value. This is not possible if the table is not empty.
  - Made the column `price` on table `Gift` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amountPaid` on table `Purchase` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Gift" DROP COLUMN "imageUrl",
DROP COLUMN "isQuota",
DROP COLUMN "purchasedUnits",
DROP COLUMN "stripePriceId",
DROP COLUMN "suggestionUrl",
DROP COLUMN "title",
DROP COLUMN "totalUnits",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "purchasedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "price" SET NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "unitsBought",
ADD COLUMN     "quantityBought" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "amountPaid" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
