import express from "express";
import {
    getAllDesigns,
    createDesign,
    updateDesign,
    deleteDesign,
    getDesignById
} from "../controllers/designControllers";

const router = express.Router();

router.get("/", getAllDesigns);
router.get("/:id", getDesignById)
router.post("/", createDesign);
router.put("/:id", updateDesign);
router.delete("/:id", deleteDesign);

export default router;