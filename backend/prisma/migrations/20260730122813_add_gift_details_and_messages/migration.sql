/*
  Warnings:

  - Made the column `description` on table `Gift` required. This step will fail if there are existing NULL values in that column.
  - Made the column `photoUrl` on table `Gift` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Gift" ADD COLUMN     "specifications" TEXT,
ADD COLUMN     "storeLinks" TEXT[],
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "photoUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "message" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'STRIPE';
