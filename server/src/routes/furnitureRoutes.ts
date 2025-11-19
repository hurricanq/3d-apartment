import express from "express";
import {
    getAllFurniture,
    createFurniture,
    updateFurniture,
    deleteFurniture
} from "../controllers/furnitureControllers";

const router = express.Router();

router.get("/", getAllFurniture);
router.post("/", createFurniture);
router.put("/:id", updateFurniture);
router.delete("/:id", deleteFurniture);

export default router;