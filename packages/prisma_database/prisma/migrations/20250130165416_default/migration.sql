/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAttempt` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `lastSuccessfulLogin` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `loginAttempts` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "lastLoginAttempt",
DROP COLUMN "lastSuccessfulLogin",
DROP COLUMN "loginAttempts",
DROP COLUMN "role",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- DropEnum
DROP TYPE "AdminRole";
