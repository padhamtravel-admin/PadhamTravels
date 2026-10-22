import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "fallback_development_secret_key"
        );
        req.user = decoded;
      } catch (err) {
        // If token is invalid, continue without req.user
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export const requireAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please log in.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_development_secret_key"
    );
    const userId = decoded.id || decoded._id;
    const user = await User.findById(userId).lean().exec();
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again.",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_development_secret_key"
      );
      const userId = decoded.id || decoded._id;
      const user = await User.findById(userId).lean().exec();
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // continue unauthenticated
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: Admin access only." });
  }
  next();
};
