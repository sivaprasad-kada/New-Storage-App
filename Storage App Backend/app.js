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
import "./config/mongoose.js";
try {
  const secretkey = "sivaprasadkada";
  const db = await connectDB();

  const app = express();
  app.use(
    cors({
      origin: "http://localhost:5173",
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

  app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ error: "Something went wrong!" });
  });

  app.listen(4000, () => {
    console.log(`Server Started`);
  });
} catch (err) {
  console.log("Could not connect to database!");
  console.log(err);
}
