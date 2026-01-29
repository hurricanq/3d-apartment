"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: `Error getting all categories: ${error.message}` });
    }
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id: String(id) },
        });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: `Error getting category by ID: ${error.message}` });
    }
};
exports.getCategoryById = getCategoryById;
const createCategory = async (req, res) => {
    try {
        const { id, name, thumbnailUrl } = req.body;
        const newCategory = await prisma.category.create({
            data: { id, name, thumbnailUrl },
        });
        res.status(201).json(newCategory);
    }
    catch (error) {
        res.status(500).json({ message: `Error creating category: ${error.message}` });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, thumbnailUrl } = req.body;
        const updatedCategory = await prisma.category.update({
            where: { id: String(id) },
            data: { name, thumbnailUrl },
        });
        res.json(updatedCategory);
    }
    catch (error) {
        res.status(500).json({ message: `Error updating category: ${error.message}` });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({
            where: { id: String(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: `Error deleting category: ${error.message}` });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryControllers.js.map