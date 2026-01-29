"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDesign = exports.updateDesign = exports.createDesign = exports.getDesignById = exports.getAllDesigns = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllDesigns = async (req, res) => {
    try {
        const designs = await prisma.design.findMany();
        res.json(designs);
    }
    catch (error) {
        res.status(500).json({ message: `Error getting all designs: ${error.message}` });
    }
};
exports.getAllDesigns = getAllDesigns;
const getDesignById = async (req, res) => {
    try {
        const { id } = req.params;
        const design = await prisma.design.findUnique({
            where: { id: Number(id) },
        });
        if (!design) {
            res.status(404).json({ message: "Design not found" });
            return;
        }
        res.json(design);
    }
    catch (error) {
        res.status(500).json({ message: `Error getting design: ${error.message}` });
    }
};
exports.getDesignById = getDesignById;
// Create design from a template
const createDesign = async (req, res) => {
    try {
        const { name, templateId, userId } = req.body;
        if (!name) {
            res.status(400).json({ message: "Design name is required." });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: missing userId" });
            return;
        }
        let data = { rooms: [] };
        // Copy template JSON if templateId is provided
        if (templateId) {
            const template = await prisma.template.findUnique({
                where: { id: String(templateId) },
            });
            if (!template) {
                res.status(404).json({ message: "Template not found" });
                return;
            }
            // Deep clone json
            data = JSON.parse(JSON.stringify(template.data ?? { rooms: [] }));
        }
        // Create design entry
        const newDesign = await prisma.design.create({
            data: {
                name,
                data,
                userId: userId,
            },
            select: {
                id: true,
                name: true,
                data: true,
                userId: true,
                createdAt: true,
            }
        });
        // Return ID so frontend can redirect immediately
        res.status(201).json(newDesign);
    }
    catch (error) {
        res.status(500).json({
            message: `Error creating design: ${error.message}`,
        });
    }
};
exports.createDesign = createDesign;
const updateDesign = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, data } = req.body;
        const updatedDesign = await prisma.design.update({
            where: { id: Number(id), userId: req.userId },
            data: { name, data },
        });
        res.json(updatedDesign);
    }
    catch (error) {
        res.status(500).json({ message: `Error updating design: ${error.message}` });
    }
};
exports.updateDesign = updateDesign;
const deleteDesign = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.design.delete({
            where: { id: Number(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: `Error deleting design: ${error.message}` });
    }
};
exports.deleteDesign = deleteDesign;
//# sourceMappingURL=designControllers.js.map