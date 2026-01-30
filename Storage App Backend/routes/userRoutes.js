import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import { checkNotRegularUser } from "../middlewares/authMiddleware.js";
import {
  getCurrentUser,
  login,
  logout,
  logoutAll,
  register,
  googleLogin,
  getAllUsers,
  logoutById,
  DeleteUser,
  gitHubCallback
} from "../controllers/userController.js";

const router = express.Router();

router.post("/user/register", register);

router.post("/user/login", login);

router.get("/user", checkAuth, getCurrentUser);

router.post("/user/logout", logout);

router.post("/user/logoutAll", logoutAll);

router.post("/user/google",googleLogin);
router.post("/user/github/callback",gitHubCallback)
router.get(
  "/users",
  checkAuth,
  (req, res, next) => {
    if (req.user.role !== "User") return next();
    res.status(403).json({ error: "You can not access users" });
  },
  getAllUsers
);
router.post(
  "/users/:userId/logout",
  checkAuth,
  checkNotRegularUser,
  logoutById
);
router.post("/users/:userId/DeleteUser",checkAuth,checkNotRegularUser,DeleteUser);


export default router;
