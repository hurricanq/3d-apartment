"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const designControllers_1 = require("../controllers/designControllers");
const router = express_1.default.Router();
router.get("/", designControllers_1.getAllDesigns);
router.get("/:id", designControllers_1.getDesignById);
router.post("/", designControllers_1.createDesign);
router.put("/:id", designControllers_1.updateDesign);
router.delete("/:id", designControllers_1.deleteDesign);
exports.default = router;
//# sourceMappingURL=designRoutes.js.map