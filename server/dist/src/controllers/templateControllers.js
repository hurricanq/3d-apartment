"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplateById = exports.getAllTemplates = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllTemplates = async (req, res) => {
    try {
        const templates = await prisma.template.findMany();
        res.json(templates);
    }
    catch (error) {
        res.status(500).json({ message: `Error getting all templates: ${error.message}` });
    }
};
exports.getAllTemplates = getAllTemplates;
const getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await prisma.template.findUnique({
            where: { id: String(id) },
        });
        res.json(template);
    }
    catch (error) {
        res.status(500).json({ message: `Error getting template by ID: ${error.message}` });
    }
};
exports.getTemplateById = getTemplateById;
const createTemplate = async (req, res) => {
    try {
        const { id, name, description, data } = req.body;
        const newTemplate = await prisma.template.create({
            data: { id, name, description, data },
        });
        res.status(201).json(newTemplate);
    }
    catch (error) {
        res.status(500).json({ message: `Error creating template: ${error.message}` });
    }
};
exports.createTemplate = createTemplate;
const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, data } = req.body;
        const updatedTemplate = await prisma.template.update({
            where: { id: String(id) },
            data: { name, description, data },
        });
        res.json(updatedTemplate);
    }
    catch (error) {
        res.status(500).json({ message: `Error updating template: ${error.message}` });
    }
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.template.delete({
            where: { id: String(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: `Error deleting template: ${error.message}` });
    }
};
exports.deleteTemplate = deleteTemplate;
//# sourceMappingURL=templateControllers.js.map