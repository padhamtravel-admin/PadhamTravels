import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthUser } from "@/hooks/useAuthUser";
import MainNavbar from "@/components/layout/MainNavbar";
import { Footer } from "@/components/landingPage/Footer";
import { apiGet, apiPut, apiPatch } from "@/apiClient";
import CustomDatePicker from "@/components/common/CustomDatePicker";
import ConfirmModal from "@/components/common/ConfirmModal";
import Button from "@/components/common/Button";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Save,
  Sparkles,
  Compass,
  Palmtree,
  Globe,
  Luggage,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

// Dynamic Country Phone Number Length Constraints
const COUNTRY_PHONE_LIMITS = {
  "+91": 10,   // India
  "+1": 10,    // US / Canada
  "+44": 10,   // UK
  "+61": 9,    // Australia
  "+971": 9,   // UAE
  "+65": 8,    // Singapore
  "IN": 10,
  "US": 10,
  "CA": 10,
  "UK": 10,
  "AU": 9,
  "AE": 9,
  "SG": 8,
};

const getPhoneLimit = (code) => {
  return COUNTRY_PHONE_LIMITS[code] || 10;
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Contacted":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "Booked":
    case "Closed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Cancelled":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "Inquiry Received":
    case "Pending":
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

export const ProfilePage = () => {
  const { user, setUser } = useAuthUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "personal";

  // Personal Details State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Cancellation Modal State
  const [cancelModalState, setCancelModalState] = useState({
    isOpen: false,
    inquiryId: null,
    isCancelling: false,
  });

  // Date of birth bounds (enforce min 12 years old up to 100 years ago)
  const today = new Date();
  const maxDobDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
  const minDobDate = new Date(today.getFullYear() - 100, 0, 1);

  useEffect(() => {
    if (user) {
      let code = "+91";
      let number = "";

      if (user.phone) {
        if (user.phone.includes(" ")) {
          const parts = user.phone.split(" ");
          code = parts[0];
          number = parts.slice(1).join(" ");
        } else if (user.phone.startsWith("+")) {
          code = user.phone.substring(0, 3);
          number = user.phone.substring(3);
        } else {
          number = user.phone;
        }
      }

      const cleanNumber = number.replace(/\D/g, "").slice(0, getPhoneLimit(code));

      setFormData({
        name: user.name || "",
        email: user.email || "",
        countryCode: code,
        phoneNumber: cleanNumber,
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        address: user.address || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "inquiries") {
      fetchMyInquiries();
    }
  }, [activeTab]);

  const fetchMyInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const response = await apiGet("/inquiries/my-inquiries");
      const data = await response.json();
      if (Array.isArray(data)) {
        setInquiries(data);
      } else {
        setInquiries([]);
      }
    } catch (error) {
      console.error("Failed to fetch inquiries:", error);
      toast.error("Failed to load your inquiries.");
    } finally {
      setLoadingInquiries(false);
    }
  };

  // Full Name Field: Prevent numeric digits and special symbols (except spaces, dots, hyphens)
  const handleNameChange = (e) => {
    const clean = e.target.value.replace(/[^a-zA-Z\s.-]/g, "");
    setFormData((prev) => ({ ...prev, name: clean }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    const maxDigits = getPhoneLimit(newCode);
    const updatedPhone = formData.phoneNumber.replace(/\D/g, "").slice(0, maxDigits);
    setFormData((prev) => ({
      ...prev,
      countryCode: newCode,
      phoneNumber: updatedPhone,
    }));

    if (phoneTouched) {
      if (newCode === "+91" && updatedPhone.length > 0 && updatedPhone.length < 10) {
        setPhoneError("Please enter a valid 10-digit Indian mobile number");
      } else {
        setPhoneError("");
      }
    }
  };

  // Phone Number Field: Strictly accept numbers only, enforce 10 digits for +91
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    const maxDigits = getPhoneLimit(formData.countryCode);
    if (rawVal.length <= maxDigits) {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: rawVal,
      }));

      if (phoneTouched) {
        if (formData.countryCode === "+91" && rawVal.length > 0 && rawVal.length < 10) {
          setPhoneError("Please enter a valid 10-digit Indian mobile number");
        } else {
          setPhoneError("");
        }
      }
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    if (formData.countryCode === "+91" && formData.phoneNumber && formData.phoneNumber.length < 10) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number");
    } else {
      setPhoneError("");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validate phone number length if provided
    if (formData.phoneNumber) {
      if (formData.countryCode === "+91" && formData.phoneNumber.length < 10) {
        setPhoneTouched(true);
        setPhoneError("Please enter a valid 10-digit Indian mobile number");
        toast.error("Please enter a valid 10-digit Indian mobile number");
        return;
      }

      const phoneLimit = getPhoneLimit(formData.countryCode);
      if (formData.phoneNumber.length < phoneLimit) {
        setPhoneTouched(true);
        setPhoneError(`Phone number must be strictly ${phoneLimit} digits for ${formData.countryCode}.`);
        toast.error(`Phone number must be strictly ${phoneLimit} digits for ${formData.countryCode}.`);
        return;
      }
    }

    // Validate Date of Birth limits if provided
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      if (dob > maxDobDate) {
        toast.error("User must be at least 12 years old.");
        return;
      }
      if (dob < minDobDate) {
        toast.error("Please enter a realistic date of birth.");
        return;
      }
    }

    setIsSaving(true);

    const combinedPhone = formData.phoneNumber
      ? `${formData.countryCode} ${formData.phoneNumber}`
      : "";

    const payload = {
      ...formData,
      phone: combinedPhone,
    };
    delete payload.countryCode;
    delete payload.phoneNumber;

    try {
      const response = await apiPut("/auth/update-profile", payload);
      const data = await response.json();
      if (data.status) {
        toast.success("Profile updated successfully!");
        setUser(data.user);

        const storedUser = JSON.parse(localStorage.getItem("authUser")) || {};
        const updatedLocalUser = { ...storedUser, ...data.user };
        localStorage.setItem("authUser", JSON.stringify(updatedLocalUser));
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error("An error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const promptCancelInquiry = (id) => {
    setCancelModalState({
      isOpen: true,
      inquiryId: id,
      isCancelling: false,
    });
  };

  const handleConfirmCancelInquiry = async () => {
    if (!cancelModalState.inquiryId) return;
    try {
      setCancelModalState((prev) => ({ ...prev, isCancelling: true }));
      await apiPatch(`/inquiries/${cancelModalState.inquiryId}/cancel`);
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === cancelModalState.inquiryId ? { ...item, status: "Cancelled" } : item
        )
      );
      toast.success("Inquiry cancelled successfully.");
      setCancelModalState({ isOpen: false, inquiryId: null, isCancelling: false });
    } catch (err) {
      console.error("Cancel inquiry error:", err);
      toast.error("Failed to cancel inquiry. Please try again.");
      setCancelModalState((prev) => ({ ...prev, isCancelling: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <MainNavbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header Banner - Soft Cyan-Slate Gradient */}
        <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-teal-50 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 z-10">
            {/* Avatar & Gradient Circle */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 text-white font-extrabold flex items-center justify-center text-3xl sm:text-4xl shadow-md ring-4 ring-white shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            {/* User Information */}
            <div className="text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {user?.name || "Traveler"}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200">
                  <CheckCircle2 size={13} className="text-cyan-600" />
                  {user?.role === "admin" ? "Administrator" : "Verified Traveler"}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={15} className="text-slate-400" />
                {user?.email}
              </p>
            </div>
          </div>

          {/* Right Side Decorative Travel Art Icons */}
          <div className="hidden md:flex items-center gap-6 opacity-35 text-cyan-600 pr-2 shrink-0 select-none z-10">
            <Compass className="w-11 h-11 stroke-[1.5] -rotate-12 hover:rotate-0 transition duration-300 pointer-events-auto cursor-pointer" title="Explorer Compass" />
            <Palmtree className="w-10 h-10 stroke-[1.5] hover:scale-110 transition duration-300 pointer-events-auto cursor-pointer" title="Tropical Getaways" />
            <Globe className="w-12 h-12 stroke-[1.2] hover:rotate-45 transition duration-500 pointer-events-auto cursor-pointer" title="World Destinations" />
            <Luggage className="w-10 h-10 stroke-[1.5] rotate-6 hover:rotate-0 transition duration-300 pointer-events-auto cursor-pointer" title="Travel Ready" />
            <Camera className="w-9 h-9 stroke-[1.5] hover:scale-110 transition duration-300 pointer-events-auto cursor-pointer" title="Capture Memories" />
          </div>
        </div>

        {/* Layout: Left Sidebar Nav & Right Content Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-4 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 sticky top-24 space-y-1">
              <button
                onClick={() => setSearchParams({ tab: "personal" })}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === "personal"
                    ? "bg-cyan-50 text-cyan-700 border border-cyan-200/60 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <User size={18} className={activeTab === "personal" ? "text-cyan-600" : "text-slate-400"} />
                <span>Personal Details</span>
              </button>

              <button
                onClick={() => setSearchParams({ tab: "inquiries" })}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === "inquiries"
                    ? "bg-cyan-50 text-cyan-700 border border-cyan-200/60 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <MessageCircle size={18} className={activeTab === "inquiries" ? "text-cyan-600" : "text-slate-400"} />
                <span>My Package Inquiries</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-8">
            {/* Personal Details Tab */}
            {activeTab === "personal" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 animate-in fade-in-50 duration-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User className="text-cyan-600" size={22} />
                  Personal Information
                </h2>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleNameChange}
                        placeholder="John Doe"
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition"
                      />
                    </div>

                    {/* Email Address (Disabled) */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full bg-slate-100/70 border border-slate-200 text-slate-400 cursor-not-allowed rounded-xl px-4 py-2.5 text-sm"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Email address cannot be changed.</p>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-400" />
                        Phone Number
                      </label>
                      <div className="flex gap-2 w-full">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleCountryCodeChange}
                          className="w-[105px] shrink-0 bg-slate-50/50 border border-slate-200 rounded-xl px-2 py-2.5 text-slate-800 text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition font-medium cursor-pointer"
                        >
                          <option value="+91">+91 (IN)</option>
                          <option value="+1">+1 (US/CA)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+61">+61 (AU)</option>
                          <option value="+971">+971 (AE)</option>
                          <option value="+65">+65 (SG)</option>
                        </select>
                        <div className="flex-1 min-w-0">
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handlePhoneChange}
                            onBlur={handlePhoneBlur}
                            maxLength={getPhoneLimit(formData.countryCode)}
                            placeholder={`Enter ${getPhoneLimit(formData.countryCode)}-digit number`}
                            className={`w-full bg-slate-50/50 rounded-xl px-4 py-2.5 text-slate-800 text-sm outline-none transition ${
                              phoneError
                                ? "border border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-300 ring-1 ring-red-300"
                                : "border border-slate-200 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                            }`}
                          />
                        </div>
                      </div>
                      {phoneError && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{phoneError}</p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Calendar size={14} className="text-cyan-600" />
                        Date of Birth
                      </label>
                      <CustomDatePicker
                        value={formData.dateOfBirth}
                        onChange={(val) =>
                          setFormData((prev) => ({ ...prev, dateOfBirth: val }))
                        }
                        maxDate={maxDobDate}
                        minDate={minDobDate}
                        placeholder="Select date of birth"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Enter your full address"
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition"
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                    >
                      <Save size={16} />
                      <span>{isSaving ? "Saving Changes..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* My Package Inquiries Tab */}
            {activeTab === "inquiries" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageCircle className="text-cyan-600" size={22} />
                    My Package Inquiries
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/tours-and-packages")}
                    className="text-xs cursor-pointer"
                  >
                    Explore Packages
                  </Button>
                </div>

                {loadingInquiries ? (
                  <div className="py-16 text-center text-slate-500 font-medium">
                    Loading your package inquiries...
                  </div>
                ) : inquiries.length > 0 ? (
                  <div className="space-y-4">
                    {inquiries.map((inq) => {
                      const tourId = inq.tourId?._id || inq.tourId;
                      const tourTitle =
                        inq.tourTitle || inq.tourId?.title || inq.tourId?.name || "Tour Package";
                      const destination =
                        inq.destination || inq.tourId?.destination || "View Tour Package";
                      const canCancel =
                        inq.status === "Inquiry Received" ||
                        inq.status === "Contacted" ||
                        inq.status === "Pending";

                      return (
                        <div
                          key={inq._id}
                          className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:shadow-xs transition space-y-3.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                {tourId ? (
                                  <Link
                                    to={`/tours/${tourId}`}
                                    className="font-bold text-slate-900 text-base hover:text-cyan-600 transition"
                                  >
                                    {tourTitle}
                                  </Link>
                                ) : (
                                  <h3 className="font-bold text-slate-900 text-base">
                                    {tourTitle}
                                  </h3>
                                )}
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                                    inq.status
                                  )}`}
                                >
                                  {inq.status || "Inquiry Received"}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin size={13} className="text-cyan-600 shrink-0" />
                                {tourId ? (
                                  <Link
                                    to={`/tours/${tourId}`}
                                    className="text-cyan-600 hover:underline font-semibold"
                                  >
                                    {destination}
                                  </Link>
                                ) : (
                                  <span>{destination}</span>
                                )}
                              </p>
                            </div>

                            {canCancel && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => promptCancelInquiry(inq._id)}
                                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 self-start sm:self-center cursor-pointer shrink-0"
                              >
                                Cancel Inquiry
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                            <div>
                              <span className="text-slate-400 block font-medium">Submitted</span>
                              <span className="font-semibold text-slate-800">
                                {new Date(inq.createdAt || Date.now()).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">
                                Requested Travel Date
                              </span>
                              <span className="font-semibold text-slate-800">
                                {inq.travelDate
                                  ? new Date(inq.travelDate).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "Flexible"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Travelers</span>
                              <span className="font-semibold text-slate-800">
                                {inq.travelers || inq.numberOfTravelers || 2} Traveler(s)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl p-8">
                    <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-100">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">
                      No Package Inquiries Found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                      You haven't submitted any tour package inquiries yet. Discover our curated domestic, international, and yatra packages!
                    </p>
                    <button
                      onClick={() => navigate("/tours-and-packages")}
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs transition"
                    >
                      <span>Browse Tour Packages</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cancellation Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalState.isOpen}
        title="Cancel Package Inquiry"
        message="Are you sure you want to cancel this inquiry? Our travel team will be notified."
        confirmText="Yes, Cancel Inquiry"
        cancelText="Keep Inquiry"
        isDanger={true}
        isLoading={cancelModalState.isCancelling}
        onConfirm={handleConfirmCancelInquiry}
        onCancel={() =>
          setCancelModalState({ isOpen: false, inquiryId: null, isCancelling: false })
        }
      />

      <Footer />
    </div>
  );
};

export default ProfilePage;
