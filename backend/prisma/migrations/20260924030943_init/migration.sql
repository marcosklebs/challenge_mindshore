-- CreateEnum
CREATE TYPE "AiContentType" AS ENUM ('DESCRIPTION', 'FUN_FACT', 'HISTORICAL_CONTEXT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "nasaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3),
    "rover" TEXT,
    "camera" TEXT,
    "mission" TEXT,
    "sourceData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_images" (
    "collectionId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_images_pkey" PRIMARY KEY ("collectionId","imageId")
);

-- CreateTable
CREATE TABLE "ai_contents" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "type" "AiContentType" NOT NULL,
    "content" TEXT NOT NULL,
    "isMocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_tags" (
    "imageId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "suggestedByAi" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "image_tags_pkey" PRIMARY KEY ("imageId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "images_nasaId_key" ON "images"("nasaId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_images" ADD CONSTRAINT "collection_images_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_images" ADD CONSTRAINT "collection_images_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_contents" ADD CONSTRAINT "ai_contents_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_tags" ADD CONSTRAINT "image_tags_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_tags" ADD CONSTRAINT "image_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
