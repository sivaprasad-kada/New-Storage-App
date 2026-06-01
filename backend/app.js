import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import fileshareRoute from "./routes/fileshareRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { startCronJobs } from "./utils/cron.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import apiFilesRoutes from "./routes/apiFilesRoutes.js";
import "./config/mongoose.js";
try {
  const secretkey = process.env.COOKIE_SECRET || "sivaprasadkada";
  const db = await connectDB();

  const app = express();
  
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL
  ].filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );
  app.use(cookieParser(secretkey));
  app.use(express.json());
  app.use((req, res, next) => {
    req.db = db;
    next();
  });
  app.use("/directory", checkAuth, directoryRoutes);
  app.use("/file", checkAuth, fileRoutes);
  app.use("/", userRoutes);
  app.use("/auth", authRoutes);
  app.use("/", fileshareRoute);
  app.use("/api/notifications", checkAuth, notificationRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/search", checkAuth, searchRoutes);
  app.use("/api/files", checkAuth, apiFilesRoutes);
  app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ error: "Something went wrong!" });
  });

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server Started`);
    startCronJobs();
  });
} catch (err) {
  console.log("Could not connect to database!");
  console.log(err);
}
