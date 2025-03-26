import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";

import { swaggerDocs } from "./utils/swagger.js";
import {
  authRoutes,
  postRoutes,
  categoryRoutes,
  commentRoutes,
  uploadRoutes,
} from "./routes/index.js";
import { connectDB } from "./config/db.js";

dotenv.config();
// MongoDB Configuration
mongoose.set("strictQuery", true);
connectDB();

const app = express();
const port = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.APP_FE_URL,
    credentials: true,
  })
);

// Swagger documentation
swaggerDocs(app, port);

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const routes = [
  authRoutes,
  postRoutes,
  categoryRoutes,
  commentRoutes,
  uploadRoutes,
];

routes.forEach((router) => app.use("/api", router));

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
