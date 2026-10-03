import multer from "multer";
import path from "path";
import cloudinaryUpload from "../config/cloudinary.js";

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Fallback Disk Storage
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File Filter (Accept Images & PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Error: Only Images (JPEG, JPG, PNG, WEBP) and PDF files are allowed!"
      )
    );
  }
};

// Initialize Multer with 20MB Limit
const diskUpload = multer({
  storage: diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 5,
  },
});

const upload = hasCloudinary ? cloudinaryUpload : diskUpload;

export default upload;
