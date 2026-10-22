import express from "express";
import {
  createInquiry,
  getMyInquiries,
  cancelInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from "../controllers/inquiry.controller.js";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// User specific inquiry routes (must precede parameterized routes like /:id)
router.get("/my-inquiries", requireAuth, getMyInquiries);
router.patch("/:id/cancel", requireAuth, cancelInquiry);

// Public / Authenticated submission route
router.post("/", optionalAuth, createInquiry);

// Admin / Management routes
router.get("/", getInquiries);
router.patch("/:id", updateInquiryStatus);
router.delete("/:id", deleteInquiry);

export default router;
