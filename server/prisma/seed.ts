import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
    await prisma.furniture.createMany({
        data: [
            {
                id: "monobloc-plastic-garden-chair",
                name: "Monobloc Plastic Garden Chair",
                thumbnailUrl: "monobloc-plastic-garden-chair.png",
                modelUrl: "monobloc-plastic-garden-chair.glb",
            },
            {
                id: "modern-bed",
                name: "Modern Bed",
                thumbnailUrl: "modern-bed.png",
                modelUrl: "modern-bed.glb",
            },
        ]
    });
}

seed().then(() => prisma.$disconnect());