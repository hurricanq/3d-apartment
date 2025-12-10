import express from "express";
import {
    getAllFurniture,
    getFurnitureByCategory,
    createFurniture,
    updateFurniture,
    deleteFurniture
} from "../controllers/furnitureControllers";

const router = express.Router();

router.get("/", getAllFurniture);
router.get("/category/:id", getFurnitureByCategory);
router.post("/", createFurniture);
router.put("/:id", updateFurniture);
router.delete("/:id", deleteFurniture);

export default router;