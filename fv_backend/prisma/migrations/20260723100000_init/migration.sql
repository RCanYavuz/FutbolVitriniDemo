-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLUB', 'PLAYER');

-- CreateEnum
CREATE TYPE "SubRole" AS ENUM ('ADMIN', 'SCOUT', 'COACH', 'PLAYER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('GK', 'DF', 'MF', 'FW');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "subRole" "SubRole" NOT NULL,
    "avatarUrl" TEXT NOT NULL DEFAULT '',
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "organization" TEXT,
    "expertise" TEXT,
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "position" "Position" NOT NULL,
    "team" TEXT NOT NULL,
    "aiScore" DOUBLE PRECISION NOT NULL,
    "matchPercentage" INTEGER,
    "aiReasoning" TEXT,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "pace" INTEGER NOT NULL,
    "passing" INTEGER NOT NULL,
    "defending" INTEGER NOT NULL,
    "physical" INTEGER NOT NULL,
    "tackling" INTEGER NOT NULL,
    "vision" INTEGER NOT NULL,
    "dribbling" INTEGER NOT NULL,
    "shooting" INTEGER NOT NULL,
    "sprintSpeed" INTEGER NOT NULL,
    "shotPower" INTEGER NOT NULL,
    "passingAcc" INTEGER NOT NULL,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "players_ownerId_idx" ON "players"("ownerId");

-- CreateIndex
CREATE INDEX "players_position_idx" ON "players"("position");

-- CreateIndex
CREATE INDEX "players_aiScore_idx" ON "players"("aiScore");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

