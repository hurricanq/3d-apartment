import express from "express";
import {
    getAllTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate
} from "../controllers/templateControllers";

const router = express.Router();

router.get("/", getAllTemplates);
router.get("/:id", getTemplateById);
router.post("/", createTemplate);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);

export default router;