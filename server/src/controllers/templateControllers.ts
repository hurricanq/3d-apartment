import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
        const templates = await prisma.template.findMany();
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ message: `Error getting all templates: ${error.message}` });
    }
};

export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const template = await prisma.template.findUnique({
            where: { id: Number(id) },
        });
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ message: `Error getting template by ID: ${error.message}` });
    }
};

export const createTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, data } = req.body;
        const newTemplate = await prisma.template.create({
            data: { name, data },
        });
        res.status(201).json(newTemplate);
    } catch (error: any) {
        res.status(500).json({ message: `Error creating template: ${error.message}` });
    }
};

export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, data } = req.body;
        const updatedTemplate = await prisma.template.update({
            where: { id: Number(id) },
            data: { name, data },
        });
        res.json(updatedTemplate);
    } catch (error: any) {
        res.status(500).json({ message: `Error updating template: ${error.message}` });
    }
};

export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.template.delete({
            where: { id: Number(id) }
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: `Error deleting template: ${error.message}` });
    }
};