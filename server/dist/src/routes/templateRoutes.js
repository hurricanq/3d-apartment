"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const templateControllers_1 = require("../controllers/templateControllers");
const router = express_1.default.Router();
router.get("/", templateControllers_1.getAllTemplates);
router.get("/:id", templateControllers_1.getTemplateById);
router.post("/", templateControllers_1.createTemplate);
router.put("/:id", templateControllers_1.updateTemplate);
router.delete("/:id", templateControllers_1.deleteTemplate);
exports.default = router;
//# sourceMappingURL=templateRoutes.js.map