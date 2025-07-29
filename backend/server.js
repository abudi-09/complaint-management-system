import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectMongoDB from "./config/db.js"; // ✅ CORRECT
import mongoose from "mongoose";
import cookieParser from "cookie-parser"; // Ensure cookieParser is imported
import authRoutes from "./routes/authRoutes.js"; // Adjust the path as necessary
import adminRoutes from "./routes/admin.route.js"; //
import complaintRoutes from "./routes/complaint.routes.js";
import statsRoutes from "./routes/stats.routes.js";
const app = express();
app.use(express.json());
app.use(cookieParser()); // Ensure cookieParser is imported
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/stats", statsRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
