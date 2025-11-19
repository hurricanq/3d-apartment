-- CreateTable
CREATE TABLE "Furniture" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "modelUrl" TEXT NOT NULL,

    CONSTRAINT "Furniture_pkey" PRIMARY KEY ("id")
);
