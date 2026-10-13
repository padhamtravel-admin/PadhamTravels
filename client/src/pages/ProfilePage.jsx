import React, { useState, useEffect } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import MainNavbar from "@/components/layout/MainNavbar";
import { Footer } from "@/components/landingPage/Footer";
import { apiGet, apiPut } from "@/apiClient";
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

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

// Custom Tailwind Date Picker Component
const CustomDatePicker = ({
  value,
  onChange,
  maxDate,
  minDate,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Normalize / Parse Date safely
  const parseDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val === "string") {
      const parts = val.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return new Date(y, m, d);
      }
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const selectedDate = parseDate(value);

  const today = new Date();
  const effectiveMaxDate = maxDate !== undefined 
    ? parseDate(maxDate) 
    : new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
  const effectiveMinDate = minDate !== undefined 
    ? parseDate(minDate) 
    : new Date(today.getFullYear() - 100, 0, 1);

  const maxYear = effectiveMaxDate ? effectiveMaxDate.getFullYear() : today.getFullYear() - 12;
  const minYear = effectiveMinDate ? effectiveMinDate.getFullYear() : today.getFullYear() - 100;

  // Active view year and month
  const [viewYear, setViewYear] = useState(() => {
    if (selectedDate) return selectedDate.getFullYear();
    return Math.min(maxYear, Math.max(minYear, 2000));
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (selectedDate) return selectedDate.getMonth();
    return 0;
  });

  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const yearOptions = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions.push(y);
  }

  const isPrevMonthDisabled = Boolean(
    effectiveMinDate &&
      (viewYear < minYear ||
        (viewYear === minYear && viewMonth <= effectiveMinDate.getMonth()))
  );

  const isNextMonthDisabled = Boolean(
    effectiveMaxDate &&
      (viewYear > maxYear ||
        (viewYear === maxYear && viewMonth >= effectiveMaxDate.getMonth()))
  );

  const prevMonth = () => {
    if (isPrevMonthDisabled) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (isNextMonthDisabled) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isMonthDisabled = (mIdx) => {
    if (effectiveMaxDate && viewYear === maxYear && mIdx > effectiveMaxDate.getMonth()) {
      return true;
    }
    if (effectiveMinDate && viewYear === minYear && mIdx < effectiveMinDate.getMonth()) {
      return true;
    }
    return false;
  };

  const handleYearChange = (newYear) => {
    let newMonth = viewMonth;
    if (effectiveMaxDate && newYear === maxYear && newMonth > effectiveMaxDate.getMonth()) {
      newMonth = effectiveMaxDate.getMonth();
    }
    if (effectiveMinDate && newYear === minYear && newMonth < effectiveMinDate.getMonth()) {
      newMonth = effectiveMinDate.getMonth();
    }
    setViewYear(newYear);
    setViewMonth(newMonth);
  };

  const isDayDisabled = (day) => {
    const targetDate = new Date(viewYear, viewMonth, day);
    targetDate.setHours(0, 0, 0, 0);

    if (effectiveMaxDate) {
      const maxLimit = new Date(
        effectiveMaxDate.getFullYear(),
        effectiveMaxDate.getMonth(),
        effectiveMaxDate.getDate()
      );
      maxLimit.setHours(0, 0, 0, 0);
      if (targetDate > maxLimit) return true;
    }

    if (effectiveMinDate) {
      const minLimit = new Date(
        effectiveMinDate.getFullYear(),
        effectiveMinDate.getMonth(),
        effectiveMinDate.getDate()
      );
      minLimit.setHours(0, 0, 0, 0);
      if (targetDate < minLimit) return true;
    }

    return false;
  };

  const handleSelectDay = (day) => {
    if (isDayDisabled(day)) return;
    const m = (viewMonth + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    const formatted = `${viewYear}-${m}-${d}`;
    onChange(formatted);
    setShowDatePicker(false);
  };

  const handleClear = () => {
    onChange("");
    setShowDatePicker(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const isToday = (day) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const formatDisplay = (val) => {
    if (!val) return "Select date of birth";
    const d = parseDate(val);
    if (!d) return val;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-left text-sm text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 transition cursor-pointer"
      >
        <span className={value ? "text-slate-800 font-medium" : "text-slate-400"}>
          {formatDisplay(value)}
        </span>
        <Calendar className="w-4 h-4 text-cyan-500 shrink-0" />
      </button>

      {showDatePicker && (
        <>
          {/* Backdrop overlay for quick click-outside close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDatePicker(false)}
          />

          {/* Calendar Dropdown Card */}
          <div className="absolute z-50 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 w-72 left-0 sm:left-auto right-0 sm:right-0 animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Header with Month/Year Navigation */}
            <div className="flex items-center justify-between px-1 mb-3">
              <button
                type="button"
                onClick={prevMonth}
                disabled={isPrevMonthDisabled}
                className={`p-1 rounded-lg text-slate-600 transition ${
                  isPrevMonthDisabled
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-slate-100 cursor-pointer"
                }`}
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Month & Year Selectors Wrapper */}
              <div className="flex items-center gap-2">
                {/* Month Selector */}
                <div className="relative">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      backgroundImage: "none",
                    }}
                    className="appearance-none bg-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  >
                    {months.map((m, idx) => (
                      <option key={m} value={idx} disabled={isMonthDisabled(idx)}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Year Selector */}
                <div className="relative">
                  <select
                    value={viewYear}
                    onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      backgroundImage: "none",
                    }}
                    className="appearance-none bg-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                disabled={isNextMonthDisabled}
                className={`p-1 rounded-lg text-slate-600 transition ${
                  isNextMonthDisabled
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-slate-100 cursor-pointer"
                }`}
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
                <div
                  key={dayName}
                  className="text-[11px] font-semibold text-slate-400 py-1"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Blank offset days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 text-xs" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const disabled = isDayDisabled(dayNum);
                const selected = isSelected(dayNum);
                const todayMatch = isToday(dayNum);

                let btnStyle = "text-xs p-2 rounded-lg text-center transition ";
                if (disabled) {
                  btnStyle += "text-slate-300 opacity-40 cursor-not-allowed bg-transparent";
                } else if (selected) {
                  btnStyle += "bg-cyan-500 text-white font-semibold shadow-sm hover:bg-cyan-600 cursor-pointer";
                } else if (todayMatch) {
                  btnStyle += "border border-cyan-400 font-medium text-cyan-700 hover:bg-cyan-50 cursor-pointer";
                } else {
                  btnStyle += "text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 cursor-pointer";
                }

                return (
                  <button
                    key={dayNum}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectDay(dayNum)}
                    className={btnStyle}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
              >
                Clear
              </button>
              <span className="text-[11px] text-slate-400 font-medium">
                Min. Age: 12 Years
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
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
  const [isSaving, setIsSaving] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

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
      const response = await apiGet("/inquiries");
      const data = await response.json();
      if (Array.isArray(data)) {
        // Filter inquiries matching user email or phone
        const myInquiries = data.filter(
          (inq) =>
            (user?.email && inq.email?.toLowerCase() === user.email.toLowerCase()) ||
            (user?.phone && inq.phone?.includes(formData.phoneNumber))
        );
        setInquiries(myInquiries);
      }
    } catch (error) {
      console.error("Failed to fetch inquiries:", error);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    const maxDigits = getPhoneLimit(newCode);
    setFormData((prev) => ({
      ...prev,
      countryCode: newCode,
      phoneNumber: prev.phoneNumber.replace(/\D/g, "").slice(0, maxDigits),
    }));
  };

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, ""); // Allow digits only
    const maxDigits = getPhoneLimit(formData.countryCode);
    if (rawVal.length <= maxDigits) {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: rawVal,
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validate phone number length if provided
    const phoneLimit = getPhoneLimit(formData.countryCode);
    if (formData.phoneNumber && formData.phoneNumber.length < phoneLimit) {
      toast.error(`Phone number must be strictly ${phoneLimit} digits for ${formData.countryCode}.`);
      return;
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

    const combinedPhone = `${formData.countryCode} ${formData.phoneNumber}`;
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
                        onChange={handleChange}
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
                          className="w-[100px] shrink-0 bg-slate-50/50 border border-slate-200 rounded-xl px-2 py-2.5 text-slate-800 text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition font-medium"
                        >
                          <option value="+91">+91 (IN)</option>
                          <option value="+1">+1 (US/CA)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+61">+61 (AU)</option>
                          <option value="+971">+971 (AE)</option>
                          <option value="+65">+65 (SG)</option>
                        </select>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handlePhoneChange}
                          maxLength={getPhoneLimit(formData.countryCode)}
                          placeholder={`Enter ${getPhoneLimit(formData.countryCode)}-digit number`}
                          className="flex-1 min-w-0 bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition"
                        />
                      </div>
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
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition"
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
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MessageCircle className="text-cyan-600" size={22} />
                  My Package Inquiries
                </h2>

                {loadingInquiries ? (
                  <div className="py-16 text-center text-slate-500 font-medium">
                    Loading your package inquiries...
                  </div>
                ) : inquiries.length > 0 ? (
                  <div className="space-y-4">
                    {inquiries.map((inq) => (
                      <div
                        key={inq._id}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">
                              {inq.tourTitle || "Customized Package Inquiry"}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 uppercase border border-cyan-200">
                              {inq.status || "Pending"}
                            </span>
                          </div>
                          {inq.destination && (
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin size={13} className="text-cyan-600" />
                              <span>{inq.destination}</span>
                            </p>
                          )}
                          {inq.travelDate && (
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar size={13} className="text-slate-400" />
                              <span>Travel Date: {inq.travelDate}</span>
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => navigate("/tours-and-packages")}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <span>Explore Tours</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
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

      <Footer />
    </div>
  );
};

export default ProfilePage;
