import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

// Import Routes
import AuthRoute from "./routes/auth.route.js";
import flightsRoutes from "./routes/flights.route.js";
import tourRoutes from "./routes/tour.routes.js";
import flightDealRoutes from "./routes/flightDealRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingsRoutes from "./routes/bookings.route.js";
import walletRoutes from "./routes/wallet.route.js";
import inquiryRoutes from "./routes/inquiry.route.js";
import heroBannerRoutes from "./routes/heroBannerRoutes.js";

import fs from "fs";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// === 1. DYNAMIC CORS SETUP (Top Middleware) ===
const allowedOrigins = [
  "https://www.padhamtravel.com",
  "https://padhamtravel.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://padham-travels.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/([a-z0-9-]+\.)?padhamtravel\.com$/.test(origin) ||
        /^http:\/\/localhost(:[0-9]+)?$/.test(origin);

      if (isAllowed) {
        return callback(null, true);
      }

      console.log("🚫 BLOCKED BY CORS:", origin);
      // Return null, false to deny cleanly without failing Express headers
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Set-Cookie"],
  })
);


// === 2. BODY PARSERS & OTHER MIDDLEWARE ===
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

// === 3. HEALTH CHECK ===
app.get("/", (req, res) => {
  res.status(200).send("API is running successfully");
});

// === 4. ROUTES ===
app.use("/api/auth", AuthRoute);
app.use("/api/flights", flightsRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/admin/tours", tourRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/deals", flightDealRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/hero-banners", heroBannerRoutes);

// === 5. GRACEFUL MULTER & UPLOAD ERROR HANDLER ===
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 20MB limit. Please upload a smaller file.",
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "An error occurred during request processing.",
    });
  }
  next();
});

// === 6. DATABASE CONNECTION ===
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_CONN) {
      throw new Error("MONGODB_CONN is missing in environment variables!");
    }
    await mongoose.connect(process.env.MONGODB_CONN);
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
};

// === 7. START SERVER ===
const port = process.env.PORT || 3000;

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port: ${port}`);
});
