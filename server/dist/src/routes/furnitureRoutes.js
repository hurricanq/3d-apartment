"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const furnitureControllers_1 = require("../controllers/furnitureControllers");
const router = express_1.default.Router();
router.get("/", furnitureControllers_1.getAllFurniture);
router.get("/category/:id", furnitureControllers_1.getFurnitureByCategory);
router.post("/", furnitureControllers_1.createFurniture);
router.put("/:id", furnitureControllers_1.updateFurniture);
router.delete("/:id", furnitureControllers_1.deleteFurniture);
exports.default = router;
//# sourceMappingURL=furnitureRoutes.js.map