import express from "express";
import { getFolderFiles } from "../controllers/apiFilesController.js";
import checkAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/folder/:folderId", checkAuth, getFolderFiles);

export default router;
