import express from "express";
import { globalSearch } from "../controllers/searchController.js";
import checkAuth from "../middlewares/authMiddleware.js";
import { requireFeature } from "../middlewares/planMiddleware.js";

const router = express.Router();

router.get("/global", checkAuth, requireFeature('globalSearch'), globalSearch);

export default router;
