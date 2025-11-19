import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllFurniture = async (req: Request, res: Response): Promise<void> => {
    try {
        const furniture = await prisma.furniture.findMany();
        res.json(furniture);
    } catch (error: any) {
        res.status(500).json({ message: `Error getting all furniture: ${error.message}` });
    }
};

export const createFurniture = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, thumbnailUrl, modelUrl } = req.body;
        const newFurniture = await prisma.furniture.create({
            data: { name, thumbnailUrl, modelUrl },
        });
        res.status(201).json(newFurniture);
    } catch (error: any) {
        res.status(500).json({ message: `Error creating furniture: ${error.message}` });
    }
};
export const updateFurniture = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, thumbnailUrl, modelUrl } = req.body;
        const updatedFurniture = await prisma.furniture.update({
            where: { id: String(id) },
            data: { name, thumbnailUrl, modelUrl },
        });
        res.json(updatedFurniture);
    } catch (error: any) {
        res.status(500).json({ message: `Error updating furniture: ${error.message}` });
    }
};

export const deleteFurniture = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.furniture.delete({
            where: { id: String(id) }
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: `Error deleting furniture: ${error.message}` });
    }
};