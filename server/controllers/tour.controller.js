import Tour from "../models/Tour.js";

// GET all tours
export const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.status(200).json(tours);
  } catch (err) {
    console.error("Get All Tours Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch tours" });
  }
};

export const getTours = getAllTours;

// GET single tour by ID
export const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found" });
    }
    res.status(200).json(tour);
  } catch (err) {
    console.error("Get Tour By ID Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch tour" });
  }
};

export const getSingleTour = getTourById;

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

// CREATE new tour
export const createTour = async (req, res) => {
  try {
    const { title, name, destination, duration, price, currency, pricingUnit, rating, reviews, inclusions, exclusions, highlights, isFeatured } = req.body;

    let imagePaths = [];
    let singleImage = "";
    let itineraryPath = "";

    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach((file) => {
          const fileUrl = extractFileUrl(file);
          if (file.fieldname === "itinerary") {
            itineraryPath = fileUrl;
          } else if (file.fieldname === "image") {
            singleImage = fileUrl;
            imagePaths.push(fileUrl);
          } else {
            imagePaths.push(fileUrl);
          }
        });
      } else if (typeof req.files === "object") {
        if (req.files.image && req.files.image.length > 0) {
          singleImage = extractFileUrl(req.files.image[0]);
          imagePaths.push(singleImage);
        }
        if (req.files.images && Array.isArray(req.files.images)) {
          req.files.images.forEach((file) => imagePaths.push(extractFileUrl(file)));
        }
        if (req.files.itinerary && req.files.itinerary.length > 0) {
          itineraryPath = extractFileUrl(req.files.itinerary[0]);
        }
      }
    } else if (req.file) {
      const fileUrl = extractFileUrl(req.file);
      if (req.file.fieldname === "itinerary") {
        itineraryPath = fileUrl;
      } else {
        singleImage = fileUrl;
        imagePaths.push(fileUrl);
      }
    }

    const parseListField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // Fallback: split by newline if present, otherwise by comma
          const separator = field.includes("\n") ? "\n" : ",";
          return field
            .split(separator)
            .map((item) => item.replace(/^[\s•\-\*]+/, "").trim())
            .filter((item) => item.length > 0);
        }
      }
      return [];
    };

    const newTour = new Tour({
      name: name || title || "Untitled Tour",
      destination: destination || "N/A",
      duration: duration || "",
      price: price !== undefined ? String(price) : "0",
      currency: currency || "INR",
      pricingUnit: pricingUnit || "per person",
      rating: rating ? Number(rating) : 0,
      reviews: reviews ? Number(reviews) : 0,
      inclusions: parseListField(inclusions),
      exclusions: parseListField(exclusions),
      highlights: parseListField(highlights),
      isFeatured: isFeatured === "true" || isFeatured === true,
      image: singleImage || (imagePaths.length > 0 ? imagePaths[0] : (req.body.image && typeof req.body.image === "string" ? req.body.image : "")),
      images: imagePaths,
      itinerary: itineraryPath || (req.body.itinerary && typeof req.body.itinerary === "string" ? req.body.itinerary : ""),
    });

    await newTour.save();
    const tourObj = newTour.toObject();
    res.status(201).json({ success: true, tour: newTour, ...tourObj });
  } catch (error) {
    console.error("Create Tour Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE tour
export const updateTour = async (req, res) => {
  try {
    const { title, name, destination, duration, price, currency, pricingUnit, rating, reviews, inclusions, exclusions, highlights, isFeatured } = req.body;

    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found" });
    }

    let updateData = { ...req.body };

    // Remove file fields from updateData initially to prevent accidental overwrites with empty values
    delete updateData.image;
    delete updateData.images;
    delete updateData.itinerary;

    if (name || title) updateData.name = name || title;
    if (destination) updateData.destination = destination;
    if (duration !== undefined) updateData.duration = duration;
    if (price !== undefined) updateData.price = String(price);
    if (currency) updateData.currency = currency;
    if (pricingUnit) updateData.pricingUnit = pricingUnit;
    if (rating !== undefined) updateData.rating = Number(rating);
    if (reviews !== undefined) updateData.reviews = Number(reviews);

    const parseListField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          const separator = field.includes("\n") ? "\n" : ",";
          return field
            .split(separator)
            .map((item) => item.replace(/^[\s•\-\*]+/, "").trim())
            .filter((item) => item.length > 0);
        }
      }
      return [];
    };

    if (inclusions !== undefined) {
      updateData.inclusions = parseListField(inclusions);
    }
    if (exclusions !== undefined) {
      updateData.exclusions = parseListField(exclusions);
    }
    if (highlights !== undefined) {
      updateData.highlights = parseListField(highlights);
    }
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured === "true" || isFeatured === true;
    }

    let imagePaths = [];
    let singleImage = "";
    let itineraryPath = "";

    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach((file) => {
          const fileUrl = extractFileUrl(file);
          if (file.fieldname === "itinerary") {
            itineraryPath = fileUrl;
          } else if (file.fieldname === "image") {
            singleImage = fileUrl;
            imagePaths.push(fileUrl);
          } else {
            imagePaths.push(fileUrl);
          }
        });
      } else if (typeof req.files === "object") {
        if (req.files.image && req.files.image.length > 0) {
          singleImage = extractFileUrl(req.files.image[0]);
          imagePaths.push(singleImage);
        }
        if (req.files.images && Array.isArray(req.files.images)) {
          req.files.images.forEach((file) => imagePaths.push(extractFileUrl(file)));
        }
        if (req.files.itinerary && req.files.itinerary.length > 0) {
          itineraryPath = extractFileUrl(req.files.itinerary[0]);
        }
      }
    }

    if (singleImage) {
      updateData.image = singleImage;
    } else if (
      req.body.image &&
      typeof req.body.image === "string" &&
      req.body.image.trim() !== "" &&
      req.body.image !== "null" &&
      req.body.image !== "undefined" &&
      req.body.image !== "[object Object]"
    ) {
      updateData.image = req.body.image;
    }

    if (imagePaths.length > 0) {
      updateData.images = imagePaths;
    }

    if (itineraryPath) {
      updateData.itinerary = itineraryPath;
    } else if (
      req.body.itinerary &&
      typeof req.body.itinerary === "string" &&
      req.body.itinerary.trim() !== "" &&
      req.body.itinerary !== "null" &&
      req.body.itinerary !== "undefined" &&
      req.body.itinerary !== "[object Object]"
    ) {
      updateData.itinerary = req.body.itinerary;
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    const tourObj = updatedTour.toObject();
    res.status(200).json({ success: true, tour: updatedTour, ...tourObj });
  } catch (error) {
    console.error("Update Tour Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE tour
export const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found" });
    }
    res.status(200).json({ success: true, message: "Tour deleted successfully" });
  } catch (error) {
    console.error("Delete Tour Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
