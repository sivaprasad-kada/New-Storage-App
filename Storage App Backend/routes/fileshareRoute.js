import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import {
  createShareLink,
  accessSharedFile,
  downloadSharedFile,
  revokeShareLink,
  listMyShares,
  listSharedWithMe,
  deleteShare,
  inviteUser,
  removeFromSharedWithMe,
  removeFromSharedByMe,
  renameSharedFile,
  downloadSharedFileById
} from "../controllers/filesharingController.js";

const router = express.Router();

// Public routes
router.get("/s/:token", accessSharedFile);
router.post("/api/share/:token/download", downloadSharedFile);

// Protected routes
router.post("/api/files/:fileId/share", checkAuth, createShareLink);
router.patch("/api/share/:token/revoke", checkAuth, revokeShareLink);
router.get("/api/share/my", checkAuth, listMyShares);
router.get("/api/share/shared-with-me", checkAuth, listSharedWithMe);
router.post("/api/share/invite", checkAuth, inviteUser);

// Remove from shared views (soft delete — does NOT delete the actual file)
// MUST be defined BEFORE the wildcard /api/share/:token route
router.delete("/api/share/remove-from-shared-with-me/:shareId", checkAuth, removeFromSharedWithMe);
router.delete("/api/share/remove-from-shared-by-me/:shareId", checkAuth, removeFromSharedByMe);

// Wildcard token route — must come AFTER specific /api/share/* routes
router.delete("/api/share/:token", checkAuth, deleteShare);

// Rename & Download for shared files
router.put("/api/files/rename/:fileId", checkAuth, renameSharedFile);
router.get("/api/files/download/:fileId", checkAuth, downloadSharedFileById);

export default router;