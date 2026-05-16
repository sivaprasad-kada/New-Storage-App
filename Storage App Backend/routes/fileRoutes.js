import express from "express";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import {
  deleteFile,
  getFile,
  renameFile,
  uploadComplete,
  uploadInitiate,
  bulkDeleteFiles,
} from "../controllers/fileController.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

// Upload flow
router.post("/upload/initiate", uploadInitiate);
router.post("/upload/complete", uploadComplete);

// Bulk operations (must come BEFORE /:id to avoid route conflicts)
router.delete("/bulk-delete", bulkDeleteFiles);

router.get("/:id", getFile);

router.patch("/:id", renameFile);

router.delete("/:id", deleteFile);

export default router;
