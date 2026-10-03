import HeroBanner from "../models/HeroBanner.js";

const extractFileUrl = (file) => {
  if (!file) return "";
  if (file.path && (file.path.startsWith("http://") || file.path.startsWith("https://"))) {
    return file.path;
  }
  if (file.secure_url) {
    return file.secure_url;
  }
  if (file.filename) {
    return `/uploads/${file.filename}`;
  }
  return file.path || "";
};

// GET /api/hero-banners - Public
export const getHeroBanners = async (req, res) => {
  try {
    const banners = await HeroBanner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: banners.length, banners });
  } catch (error) {
    console.error("Get Hero Banners Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch hero banners" });
  }
};

// GET /api/hero-banners/all - Admin (all banners including inactive)
export const getAllHeroBanners = async (req, res) => {
  try {
    const banners = await HeroBanner.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: banners.length, banners });
  } catch (error) {
    console.error("Get All Hero Banners Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch hero banners" });
  }
};

// POST /api/hero-banners - Admin (Max 8 limit)
export const createHeroBanner = async (req, res) => {
  try {
    const existingCount = await HeroBanner.countDocuments();
    if (existingCount >= 8) {
      return res.status(400).json({
        success: false,
        message: "Maximum limit of 8 hero banners reached. Please delete an existing banner before adding a new one.",
      });
    }

    let imageUrl = "";
    let publicId = "";

    if (req.file) {
      imageUrl = extractFileUrl(req.file);
      publicId = req.file.filename || req.file.public_id || "";
    } else if (req.body.imageUrl && typeof req.body.imageUrl === "string") {
      imageUrl = req.body.imageUrl.trim();
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image file or imageUrl is required.",
      });
    }

    const nextOrder = req.body.order !== undefined ? Number(req.body.order) : existingCount;
    const title = req.body.title || "";

    const newBanner = new HeroBanner({
      imageUrl,
      publicId,
      title,
      order: nextOrder,
      isActive: true,
    });

    await newBanner.save();
    res.status(201).json({ success: true, banner: newBanner });
  } catch (error) {
    console.error("Create Hero Banner Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/hero-banners/:id - Admin
export const deleteHeroBanner = async (req, res) => {
  try {
    const banner = await HeroBanner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Hero banner not found" });
    }
    res.status(200).json({ success: true, message: "Hero banner deleted successfully" });
  } catch (error) {
    console.error("Delete Hero Banner Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hero-banners/reorder - Admin
export const reorderHeroBanners = async (req, res) => {
  try {
    const { items } = req.body; // Expect array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Invalid payload format. Expected items array." });
    }

    const updates = items.map((item, index) => ({
      updateOne: {
        filter: { _id: item.id || item._id },
        update: { $set: { order: item.order !== undefined ? item.order : index } },
      },
    }));

    await HeroBanner.bulkWrite(updates);
    const banners = await HeroBanner.find().sort({ order: 1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error("Reorder Hero Banners Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hero-banners/seed - Admin/Public Seed
export const seedDefaultHeroBanners = async (req, res) => {
  try {
    const count = await HeroBanner.countDocuments();
    if (count > 0 && !req.query.force) {
      return res.status(200).json({
        success: true,
        message: "Collection already contains hero banners.",
        count,
      });
    }

    const defaultBanners = [
      {
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        title: "Exclusive Travel Offers & Coupon Fair",
        order: 0,
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1600&q=80",
        title: "Andaman & Nicobar Islands Escapes",
        order: 1,
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80",
        title: "Serene Kerala Backwaters & Houseboats",
        order: 2,
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
        title: "Dubai Luxury & Desert Safari Packages",
        order: 3,
      },
    ];

    await HeroBanner.deleteMany({});
    const inserted = await HeroBanner.insertMany(defaultBanners);
    res.status(201).json({
      success: true,
      message: "Default hero banners seeded successfully",
      count: inserted.length,
      banners: inserted,
    });
  } catch (error) {
    console.error("Seed Hero Banners Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
