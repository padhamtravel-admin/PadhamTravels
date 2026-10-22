import Inquiry from "../models/Inquiry.js";
import User from "../models/user.model.js";

// Submit a new inquiry (Public / Authenticated)
export const createInquiry = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      destination,
      tourId,
      tourTitle,
      travelDate,
      numberOfTravelers,
      travelers,
      message,
      statusNotes,
    } = req.body;

    if (!name || !name.trim() || !phone || !phone.trim()) {
      return res.status(400).json({ message: "Name and Phone number are required." });
    }

    const cleanEmail = (email || req.user?.email || "").toLowerCase().trim();
    if (!cleanEmail) {
      return res.status(400).json({ message: "Email address is required." });
    }

    if (!tourId) {
      return res.status(400).json({ message: "Tour package ID is required." });
    }

    if (!travelDate) {
      return res.status(400).json({ message: "Travel date is required." });
    }

    const parsedDate = new Date(travelDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid travel date format." });
    }

    const count = Math.max(1, Math.min(10, Number(travelers || numberOfTravelers) || 2));

    // Determine associated userId
    let assignedUserId = null;
    const currentUserId = req.user?._id || req.user?.id;

    if (currentUserId) {
      // Authenticated session
      assignedUserId = currentUserId;
    } else if (cleanEmail) {
      // Unauthenticated: look up existing user account by email
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        assignedUserId = existingUser._id;
      }
    }

    const inquiry = new Inquiry({
      userId: assignedUserId,
      name: name.trim(),
      phone: phone.trim(),
      email: cleanEmail,
      tourId,
      tourTitle: tourTitle || "",
      destination: destination || "",
      travelDate: parsedDate,
      travelers: count,
      numberOfTravelers: count,
      message: message || "",
      status: "Inquiry Received",
      statusNotes: statusNotes || "",
    });

    const savedInquiry = await inquiry.save();
    res.status(201).json({
      success: true,
      data: savedInquiry,
      message: "Inquiry submitted successfully!",
    });
  } catch (err) {
    console.error("Create Inquiry Error:", err);
    res.status(500).json({ message: "Failed to submit inquiry.", error: err.message });
  }
};

// Get inquiries belonging to logged-in user
export const getMyInquiries = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const userEmail = (req.user?.email || "").toLowerCase().trim();

    if (!userId && !userEmail) {
      return res.status(401).json({ message: "Unauthorized. Please sign in." });
    }

    const conditions = [];
    if (userId) conditions.push({ userId });
    if (userEmail) conditions.push({ email: userEmail });

    const inquiries = await Inquiry.find({ $or: conditions })
      .populate(
        "tourId",
        "title name destination duration price currency inclusions exclusions highlights images image"
      )
      .sort({ createdAt: -1 });

    res.status(200).json(inquiries);
  } catch (err) {
    console.error("Get My Inquiries Error:", err);
    res.status(500).json({ message: "Failed to fetch inquiries." });
  }
};

// Cancel an inquiry (User / Admin)
export const cancelInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found." });
    }

    // Authorization check: verify ownership or admin role
    if (req.user) {
      const isOwner =
        (inquiry.userId && inquiry.userId.toString() === (req.user._id || req.user.id).toString()) ||
        (inquiry.email && inquiry.email.toLowerCase() === req.user.email?.toLowerCase());
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "You are not authorized to cancel this inquiry." });
      }
    }

    inquiry.status = "Cancelled";
    if (req.body?.statusNotes) {
      inquiry.statusNotes = req.body.statusNotes;
    }

    const updatedInquiry = await inquiry.save();

    res.status(200).json({
      success: true,
      message: "Inquiry cancelled successfully.",
      data: updatedInquiry,
    });
  } catch (err) {
    console.error("Cancel Inquiry Error:", err);
    res.status(500).json({ message: "Failed to cancel inquiry." });
  }
};

// Get all inquiries (Admin)
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate(
        "tourId",
        "title name destination duration price currency inclusions exclusions highlights images image"
      )
      .sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (err) {
    console.error("Get Inquiries Error:", err);
    res.status(500).json({ message: "Failed to fetch inquiries." });
  }
};

// Update inquiry status (Admin)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status, statusNotes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (statusNotes !== undefined) updateData.statusNotes = statusNotes;

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found." });
    }
    res.status(200).json(inquiry);
  } catch (err) {
    console.error("Update Inquiry Status Error:", err);
    res.status(500).json({ message: "Failed to update inquiry status." });
  }
};

// Delete inquiry (Admin)
export const deleteInquiry = async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Inquiry deleted successfully." });
  } catch (err) {
    console.error("Delete Inquiry Error:", err);
    res.status(500).json({ message: "Failed to delete inquiry." });
  }
};
