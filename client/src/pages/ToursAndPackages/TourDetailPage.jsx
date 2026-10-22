import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthUser } from "@/hooks/useAuthUser";
import { apiGet, apiPost, apiPatch } from "@/apiClient";
import { formatPrice, getTourImageUrl } from "@/lib/utils";
import MainNavbar from "@/components/layout/MainNavbar";
import {
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  FileText,
  MessageCircle,
  Send,
  ArrowLeft,
  Calendar,
  Phone,
  User,
  Users,
  X,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/common/Button";
import ConfirmModal from "@/components/common/ConfirmModal";
import CustomDatePicker from "@/components/common/CustomDatePicker";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

export const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthUser();
  const whatsappPhone = import.meta.env.VITE_WHATSAPP_NUMBER || "919944229209";

  const [tour, setTour] = useState(location.state?.tour || null);
  const [loading, setLoading] = useState(!location.state?.tour);
  const [error, setError] = useState(null);

  const [countryCode, setCountryCode] = useState("+91");
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    phone: "",
    travelDate: "",
    travelers: 2,
    message: "",
  });

  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Active Inquiry Persistence State
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [checkingInquiry, setCheckingInquiry] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingInquiry, setCancellingInquiry] = useState(false);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Earliest selectable travel date (At least tomorrow YYYY-MM-DD in local time)
  const getTomorrowDateStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const minTravelDate = getTomorrowDateStr();

  // Auto-fill form from authenticated user if available
  useEffect(() => {
    if (user) {
      const userName = user.name || user.fullName || "";
      let userCode = "+91";
      let userPhone = "";

      const rawPhone = user.phone || user.phoneNumber || "";
      if (rawPhone) {
        if (rawPhone.includes(" ")) {
          const parts = rawPhone.split(" ");
          userCode = parts[0] || "+91";
          userPhone = parts.slice(1).join("").replace(/\D/g, "");
        } else if (rawPhone.startsWith("+")) {
          userCode = rawPhone.substring(0, 3);
          userPhone = rawPhone.substring(3).replace(/\D/g, "");
        } else {
          userPhone = rawPhone.replace(/\D/g, "").slice(-10);
        }
      }

      setCountryCode(userCode || "+91");
      setInquiryForm((prev) => ({
        ...prev,
        name: prev.name || userName,
        phone: prev.phone || userPhone,
      }));
    }
  }, [user]);

  // Check if logged-in user already has an active inquiry for this tour
  useEffect(() => {
    const checkActiveInquiry = async () => {
      if (!user || !id) return;
      try {
        setCheckingInquiry(true);
        const res = await apiGet("/inquiries/my-inquiries");
        const data = await res.json();
        if (Array.isArray(data)) {
          const found = data.find(
            (inq) =>
              (inq.tourId?._id === id || inq.tourId === id) &&
              inq.status !== "Cancelled"
          );
          if (found) {
            setActiveInquiry(found);
          }
        }
      } catch (err) {
        console.error("Error checking active inquiries:", err);
      } finally {
        setCheckingInquiry(false);
      }
    };

    checkActiveInquiry();
  }, [user, id]);

  useEffect(() => {
    if (!tour && id) {
      const fetchSingleTour = async () => {
        try {
          setLoading(true);
          const res = await apiGet(`/tours/${id}`);
          if (!res.ok) throw new Error("Tour not found");
          const data = await res.json();
          setTour(data);
        } catch (err) {
          setError(err.message || "Failed to load tour details.");
        } finally {
          setLoading(false);
        }
      };
      fetchSingleTour();
    }
  }, [id, tour]);

  // Full Name constraint: Prevent numeric digits and special symbols (except spaces, dots, hyphens)
  const handleNameChange = (e) => {
    const clean = e.target.value.replace(/[^a-zA-Z\s.-]/g, "");
    setInquiryForm((prev) => ({ ...prev, name: clean }));
  };

  // Phone Number constraint: Numbers only, 10-digit hard limit for +91
  const handlePhoneChange = (e) => {
    const clean = e.target.value.replace(/\D/g, "");
    const maxLen = countryCode === "+91" ? 10 : 15;
    if (clean.length <= maxLen) {
      setInquiryForm((prev) => ({ ...prev, phone: clean }));

      if (phoneTouched) {
        if (countryCode === "+91" && clean.length > 0 && clean.length < 10) {
          setPhoneError("Please enter a valid 10-digit Indian mobile number");
        } else {
          setPhoneError("");
        }
      }
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    const clean = inquiryForm.phone.replace(/\D/g, "");
    if (!clean) {
      setPhoneError("Phone number is required");
    } else if (countryCode === "+91" && clean.length < 10) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number");
    } else {
      setPhoneError("");
    }
  };

  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    if (newCode === "+91") {
      const clamped = inquiryForm.phone.replace(/\D/g, "").slice(0, 10);
      setInquiryForm((prev) => ({ ...prev, phone: clamped }));
      if (phoneTouched && clamped.length > 0 && clamped.length < 10) {
        setPhoneError("Please enter a valid 10-digit Indian mobile number");
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("");
    }
  };

  const handleTravelersChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setInquiryForm((prev) => ({ ...prev, travelers: "" }));
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    if (num <= 0) {
      setInquiryForm((prev) => ({ ...prev, travelers: 1 }));
    } else if (num > 10) {
      setInquiryForm((prev) => ({ ...prev, travelers: 10 }));
    } else {
      setInquiryForm((prev) => ({ ...prev, travelers: num }));
    }
  };

  const handleTravelersBlur = () => {
    if (!inquiryForm.travelers || Number(inquiryForm.travelers) < 1) {
      setInquiryForm((prev) => ({ ...prev, travelers: 1 }));
    } else if (Number(inquiryForm.travelers) > 10) {
      setInquiryForm((prev) => ({ ...prev, travelers: 10 }));
    }
  };

  const handleWhatsAppClick = () => {
    const packageName = tour?.name || tour?.title || "Tour Package";
    const travelerCount =
      activeInquiry?.travelers || inquiryForm.travelers || 2;
    const msg = encodeURIComponent(
      `Hi Padham Travels, I am interested in booking the "${packageName}" package for ${travelerCount} traveler(s).`
    );
    window.open(`https://wa.me/${whatsappPhone}?text=${msg}`, "_blank");
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to send an inquiry.");
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    if (!inquiryForm.name.trim()) {
      toast.error("Please provide your name.");
      return;
    }

    setPhoneTouched(true);
    const cleanPhone = inquiryForm.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      setPhoneError("Phone number is required");
      return;
    }
    if (countryCode === "+91" && cleanPhone.length < 10) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    const numTravelers = Number(inquiryForm.travelers);
    if (!numTravelers || numTravelers < 1) {
      toast.error("Please specify at least 1 traveler.");
      return;
    }
    if (numTravelers > 10) {
      setIsBulkModalOpen(true);
      toast.error(
        "Online inquiries are limited to 10 travelers. Please contact our group desk for bulk/group booking rates."
      );
      return;
    }

    if (!inquiryForm.travelDate) {
      toast.error("Please select your intended travel date.");
      return;
    }

    if (inquiryForm.travelDate < minTravelDate) {
      toast.error("Please select a future travel date (at least tomorrow).");
      return;
    }

    const fullPhone = `${countryCode} ${cleanPhone}`;

    try {
      setSubmitting(true);
      const res = await apiPost("/inquiries", {
        name: inquiryForm.name.trim(),
        phone: fullPhone,
        email: user?.email,
        travelDate: inquiryForm.travelDate,
        travelers: numTravelers,
        numberOfTravelers: numTravelers,
        message: inquiryForm.message,
        tourId: tour?._id || tour?.id || id,
        tourTitle: tour?.name || tour?.title,
        destination: tour?.destination,
      });

      const data = await res.json();

      if (res.ok) {
        setActiveInquiry(data.data);
        toast.success("Inquiry submitted successfully!");
      } else {
        toast.error(data.message || "Submission failed. Please try again or inquire via WhatsApp.");
      }
    } catch (err) {
      console.error("Inquiry error:", err);
      toast.error("Error submitting inquiry. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelActiveInquiry = async () => {
    if (!activeInquiry?._id) return;
    try {
      setCancellingInquiry(true);
      await apiPatch(`/inquiries/${activeInquiry._id}/cancel`);
      setActiveInquiry(null);
      toast.success("Inquiry withdrawn. You can submit a new inquiry if needed.");
      setIsCancelModalOpen(false);
    } catch (err) {
      console.error("Error cancelling inquiry:", err);
      toast.error("Failed to withdraw inquiry. Please try again.");
    } finally {
      setCancellingInquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <MainNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
          className="mb-6 cursor-pointer"
        >
          Back to Tour Packages
        </Button>

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium text-lg">
            Loading tour details...
          </div>
        ) : error || !tour ? (
          <div className="py-20 text-center text-red-500 font-semibold text-lg">
            {error || "Tour package not found."}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT 2 COLS: Tour Info & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title Bar */}
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    {tour.destination}
                  </span>
                  {tour.duration && (
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" />
                      {tour.duration}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
                  {tour.title || tour.name}
                </h1>
              </div>

              {/* Showcase Image */}
              <div className="w-full bg-slate-900/5 rounded-3xl overflow-hidden border border-slate-200/80 flex items-center justify-center p-2 sm:p-4 shadow-sm">
                <img
                  src={getTourImageUrl(tour)}
                  alt={tour.title || tour.name}
                  className="w-full h-auto max-h-[650px] object-contain rounded-2xl block mx-auto transition-transform hover:scale-[1.01]"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/800x500?text=Tour+Package";
                  }}
                />
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white rounded-2xl shadow-xs border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <Star size={20} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                      Rating
                    </div>
                    <div className="font-bold text-slate-800 text-sm">
                      {tour.rating || 4.8} / 5
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                      Duration
                    </div>
                    <div className="font-bold text-slate-800 text-sm">
                      {tour.duration || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                      Location
                    </div>
                    <div className="font-bold text-slate-800 text-sm truncate">
                      {tour.destination}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                      Itinerary
                    </div>
                    {tour.itinerary ? (
                      <a
                        href={
                          tour.itinerary.startsWith("http")
                            ? tour.itinerary
                            : `${API_BASE}${tour.itinerary}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-cyan-600 hover:underline"
                      >
                        PDF Download
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">Available</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Highlights Section */}
              {tour.highlights && tour.highlights.length > 0 && (
                <Card className="border-slate-100 bg-white rounded-2xl shadow-xs">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Star className="text-amber-400 fill-amber-400" size={20} />
                      Package Highlights
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tour.highlights.map((h, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-slate-700 font-medium text-sm"
                        >
                          <CheckCircle2
                            size={18}
                            className="text-cyan-600 shrink-0 mt-0.5"
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-100 bg-white rounded-2xl shadow-xs">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-emerald-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                      <span>Package Inclusions</span>
                    </h3>
                    {tour.inclusions && tour.inclusions.length > 0 ? (
                      <ul className="space-y-2">
                        {tour.inclusions.map((inc, i) => (
                          <li
                            key={i}
                            className="text-sm text-slate-700 flex items-start gap-2.5"
                          >
                            <CheckCircle2
                              size={16}
                              className="text-emerald-500 shrink-0 mt-0.5"
                            />
                            <span className="leading-snug">{inc}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Accommodation, Daily Breakfast, Sightseeing Transfers, and Local Guide Support.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-100 bg-white rounded-2xl shadow-xs">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                      <XCircle size={20} className="text-red-600 shrink-0" />
                      <span>Package Exclusions</span>
                    </h3>
                    {tour.exclusions && tour.exclusions.length > 0 ? (
                      <ul className="space-y-2">
                        {tour.exclusions.map((exc, i) => (
                          <li
                            key={i}
                            className="text-sm text-slate-700 flex items-start gap-2.5"
                          >
                            <XCircle
                              size={16}
                              className="text-red-500 shrink-0 mt-0.5"
                            />
                            <span className="leading-snug">{exc}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Personal Expenses, Airfare/Train Tickets unless specified, Extra Meal Services.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* RIGHT 1 COL: Pricing & Inquiry Card */}
            <div className="space-y-6">
              <Card className="border-slate-100 bg-white rounded-2xl shadow-lg sticky top-24 overflow-visible">
                <CardContent className="p-6 space-y-6 overflow-visible">
                  {/* Price Banner */}
                  <div className="pb-4 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Price Estimate
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {formatPrice(tour.price, tour.currency)}
                      </span>
                      <span className="text-slate-500 text-sm font-medium capitalize">
                        /{tour.pricingUnit || "person"}
                      </span>
                    </div>
                  </div>

                  {/* 1. STATE PERSISTENCE: Active Inquiry Card for Logged-In User */}
                  {user && activeInquiry ? (
                    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5 border border-emerald-100">
                          <CheckCircle2 size={22} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">
                            You have an active inquiry for this package
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            Ref #{activeInquiry._id?.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* Inquiry Summary */}
                      <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Status</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${getStatusBadgeClass(
                              activeInquiry.status
                            )}`}
                          >
                            {activeInquiry.status || "Inquiry Received"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Travel Date</span>
                          <span className="font-semibold text-slate-800">
                            {new Date(activeInquiry.travelDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Travelers</span>
                          <span className="font-semibold text-slate-800">
                            {activeInquiry.travelers ||
                              activeInquiry.numberOfTravelers ||
                              2}{" "}
                            Traveler(s)
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed bg-sky-50/60 p-3 rounded-xl border border-sky-100/70">
                        Our travel representative has received your request. Need to change plans?
                      </p>

                      <div className="space-y-2.5 pt-1">
                        <Button
                          variant="success"
                          size="md"
                          icon={MessageCircle}
                          onClick={handleWhatsAppClick}
                          className="w-full font-bold cursor-pointer"
                        >
                          Chat on WhatsApp
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCancelModalOpen(true)}
                          className="w-full text-slate-600 hover:text-rose-600 hover:border-rose-300 cursor-pointer text-xs"
                        >
                          Cancel / Withdraw Inquiry
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* WhatsApp Direct Action */}
                      <Button
                        variant="success"
                        size="md"
                        icon={MessageCircle}
                        onClick={handleWhatsAppClick}
                        className="w-full font-bold cursor-pointer"
                      >
                        Book via WhatsApp
                      </Button>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-3 text-xs uppercase font-bold text-slate-400">
                          OR SEND INQUIRY
                        </span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      {!user ? (
                        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 text-center mt-3">
                          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">Please sign in to send an inquiry</h4>
                          <p className="text-xs text-slate-500 mt-1 mb-4">
                            Track your inquiry status, itinerary details, and booking updates directly from your profile.
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Link
                              className="px-4 py-2 bg-[#008ba3] hover:bg-[#00758a] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                              to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                            >
                              Sign In
                            </Link>
                            <Link
                              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all"
                              to={`/register?redirect=${encodeURIComponent(location.pathname)}`}
                            >
                              Register
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleInquirySubmit} className="space-y-4">
                          {/* Full Name */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">
                              Full Name *
                            </label>
                            <div className="relative">
                              <User size={16} className="absolute left-3 top-3 text-slate-400" />
                              <Input
                                required
                                type="text"
                                placeholder="John Doe"
                                className="pl-9 bg-slate-50 border-slate-200 focus:border-cyan-500"
                                value={inquiryForm.name}
                                onChange={handleNameChange}
                              />
                            </div>
                          </div>

                          {/* Phone Number with Country Code */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">
                              Phone Number *
                            </label>
                            <div className="flex gap-2">
                              <select
                                value={countryCode}
                                onChange={handleCountryCodeChange}
                                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:border-cyan-500 outline-none cursor-pointer shrink-0"
                              >
                                <option value="+91">+91 (IN)</option>
                                <option value="+1">+1 (US/CA)</option>
                                <option value="+44">+44 (UK)</option>
                                <option value="+971">+971 (UAE)</option>
                                <option value="+65">+65 (SG)</option>
                                <option value="+66">+66 (TH)</option>
                              </select>
                              <div className="relative flex-1">
                                <Phone
                                  size={16}
                                  className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                                />
                                <Input
                                  required
                                  type="tel"
                                  placeholder={countryCode === "+91" ? "9876543210" : "Mobile number"}
                                  maxLength={countryCode === "+91" ? 10 : 15}
                                  className={`pl-9 bg-slate-50 transition ${
                                    phoneError
                                      ? "border-red-400 focus:border-red-400 focus:ring-red-300 ring-1 ring-red-300"
                                      : "border-slate-200 focus:border-cyan-500"
                                  }`}
                                  value={inquiryForm.phone}
                                  onChange={handlePhoneChange}
                                  onBlur={handlePhoneBlur}
                                />
                              </div>
                            </div>
                            {phoneError && (
                              <p className="text-red-500 text-xs mt-1 font-medium">{phoneError}</p>
                            )}
                          </div>

                          {/* Travelers & Travel Date */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                            <div className="flex flex-col">
                              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                                No. of Travelers *
                              </label>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                required
                                placeholder="1 - 10"
                                value={inquiryForm.travelers ?? ""}
                                onChange={handleTravelersChange}
                                onBlur={handleTravelersBlur}
                                className="bg-slate-50 border-slate-200 focus:border-cyan-500"
                              />
                            </div>

                            <div className="flex flex-col">
                              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                                Travel Date *
                              </label>
                              <CustomDatePicker
                                value={inquiryForm.travelDate}
                                onChange={(val) =>
                                  setInquiryForm((prev) => ({ ...prev, travelDate: val }))
                                }
                                minDate={minTravelDate}
                                placement="top"
                                placeholder="Select travel date"
                                required
                              />
                            </div>
                          </div>

                          {/* Single-Line Contact Notice (Full Width) */}
                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => setIsBulkModalOpen(true)}
                              className="text-xs text-slate-600 hover:text-sky-700 transition-colors whitespace-nowrap inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Booking for 10+ Travelers,</span>
                              <span className="text-sky-600 font-semibold underline">Contact us.</span>
                            </button>
                          </div>

                          <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={submitting}
                            className="w-full font-bold cursor-pointer"
                          >
                            Submit Lead Inquiry
                          </Button>
                        </form>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Bulk / Group Booking Contact Modal */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsBulkModalOpen(false)}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Bulk / Group Booking Inquiry
                  </h3>
                  <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-100">
                    Dedicated Group Desk
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                For customized corporate groups, family reunions, or tours with more than 10 travelers, please reach out directly to our dedicated group desk:
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone size={13} className="text-cyan-600" />
                      Mobile / WhatsApp
                    </span>
                    <span className="text-xs font-bold text-slate-800">+91 99442 29209</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="tel:+919944229209"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                    >
                      <Phone size={13} />
                      <span>Call Now</span>
                    </a>
                    <a
                      href="https://wa.me/919944229209?text=Hi%20Padham%20Travels,%20I%20am%20inquiring%20about%20a%20bulk%20group%20booking%20(10+%20travelers)."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail size={13} className="text-cyan-600" />
                      Email
                    </span>
                  </div>
                  <a
                    href="mailto:info@padhamtravel.com?subject=Bulk%20Group%20Booking%20Inquiry"
                    className="flex items-center justify-between py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition cursor-pointer"
                  >
                    <span>info@padhamtravel.com</span>
                    <Send size={13} />
                  </a>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="w-full sm:w-auto font-bold cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Active Inquiry Confirmation Modal */}
        <ConfirmModal
          isOpen={isCancelModalOpen}
          title="Withdraw Tour Package Inquiry"
          message="Are you sure you want to cancel / withdraw this inquiry? Our travel team will be notified, and you will be able to submit a new inquiry if needed."
          confirmText="Yes, Withdraw Inquiry"
          cancelText="Keep Inquiry"
          isDanger={true}
          isLoading={cancellingInquiry}
          onConfirm={handleCancelActiveInquiry}
          onCancel={() => setIsCancelModalOpen(false)}
        />
      </main>
    </div>
  );
};

export default TourDetailPage;
