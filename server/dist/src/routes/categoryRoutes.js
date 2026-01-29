"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryControllers_1 = require("../controllers/categoryControllers");
const router = express_1.default.Router();
router.get("/", categoryControllers_1.getAllCategories);
router.get("/:id", categoryControllers_1.getCategoryById);
router.post("/", categoryControllers_1.createCategory);
router.put("/:id", categoryControllers_1.updateCategory);
router.delete("/:id", categoryControllers_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map