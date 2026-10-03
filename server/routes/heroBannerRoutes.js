import express from "express";
import {
  getHeroBanners,
  getAllHeroBanners,
  createHeroBanner,
  deleteHeroBanner,
  reorderHeroBanners,
  seedDefaultHeroBanners,
} from "../controllers/heroBannerController.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public route to fetch active banners for homepage carousel
router.get("/", getHeroBanners);

// Protected admin routes
router.get("/all", verifyToken, requireAdmin, getAllHeroBanners);
router.post("/", verifyToken, requireAdmin, upload.single("image"), createHeroBanner);
router.delete("/:id", verifyToken, requireAdmin, deleteHeroBanner);
router.put("/reorder", verifyToken, requireAdmin, reorderHeroBanners);
router.post("/seed", verifyToken, requireAdmin, seedDefaultHeroBanners);

export default router;
