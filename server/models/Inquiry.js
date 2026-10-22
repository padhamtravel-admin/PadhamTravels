import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
    tourTitle: { type: String, default: "" },
    destination: { type: String, default: "" },
    travelers: { type: Number, default: 2 },
    numberOfTravelers: { type: Number, default: 2 },
    travelDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Inquiry Received", "Contacted", "Booked", "Cancelled", "Pending", "Closed"],
      default: "Inquiry Received",
    },
    statusNotes: { type: String, default: "" },
    message: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
