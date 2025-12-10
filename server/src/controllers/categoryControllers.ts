import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ message: `Error getting all categories: ${error.message}` });
    }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id: String(id) },
        });
        res.json(category);
    } catch (error: any) {
        res.status(500).json({ message: `Error getting category by ID: ${error.message}` });
    }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, name, thumbnailUrl } = req.body;
        const newCategory = await prisma.category.create({
            data: { id, name, thumbnailUrl },
        });
        res.status(201).json(newCategory);
    } catch (error: any) {
        res.status(500).json({ message: `Error creating category: ${error.message}` });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, thumbnailUrl } = req.body;
        const updatedCategory = await prisma.category.update({
            where: { id: String(id) },
            data: { name, thumbnailUrl },
        });
        res.json(updatedCategory);
    } catch (error: any) {
        res.status(500).json({ message: `Error updating category: ${error.message}` });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.category.delete({
            where: { id: String(id) }
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: `Error deleting category: ${error.message}` });
    }
};