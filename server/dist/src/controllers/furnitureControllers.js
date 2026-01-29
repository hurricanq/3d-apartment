"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFurniture = exports.updateFurniture = exports.createFurniture = exports.getFurnitureByCategory = exports.getAllFurniture = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllFurniture = async (req, res) => {
    try {
        const furniture = await prisma.furniture.findMany();
        res.json(furniture);
    }
    catch (error) {
        res.status(500).json({ message: `Error getting all furniture: ${error.message}` });
    }
};
exports.getAllFurniture = getAllFurniture;
const getFurnitureByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const furniture = await prisma.furniture.findMany({
            where: { categoryId: String(id) },
        });
        res.status(201).json(furniture);
    }
    catch (error) {
        res.status(500).json({ message: `Error getting furniture by category: ${error.message}` });
    }
};
exports.getFurnitureByCategory = getFurnitureByCategory;
const createFurniture = async (req, res) => {
    try {
        const { id, name, thumbnailUrl, modelUrl, categoryId } = req.body;
        const newFurniture = await prisma.furniture.create({
            data: { id, name, thumbnailUrl, modelUrl, categoryId },
        });
        res.status(201).json(newFurniture);
    }
    catch (error) {
        res.status(500).json({ message: `Error creating furniture: ${error.message}` });
    }
};
exports.createFurniture = createFurniture;
const updateFurniture = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, thumbnailUrl, modelUrl } = req.body;
        const updatedFurniture = await prisma.furniture.update({
            where: { id: String(id) },
            data: { name, thumbnailUrl, modelUrl },
        });
        res.json(updatedFurniture);
    }
    catch (error) {
        res.status(500).json({ message: `Error updating furniture: ${error.message}` });
    }
};
exports.updateFurniture = updateFurniture;
const deleteFurniture = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.furniture.delete({
            where: { id: String(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: `Error deleting furniture: ${error.message}` });
    }
};
exports.deleteFurniture = deleteFurniture;
//# sourceMappingURL=furnitureControllers.js.map