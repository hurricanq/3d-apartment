import express from "express";
import {
    syncUser
} from "../controllers/userControllers";

const router = express.Router();

router.post("/sync", syncUser);

export default router;