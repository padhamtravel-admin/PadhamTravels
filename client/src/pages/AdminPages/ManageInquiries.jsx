import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiDelete } from "@/apiClient";
import { formatPrice, getTourImageUrl } from "@/lib/utils";
import ConfirmModal from "@/components/common/ConfirmModal";
import Button from "@/components/common/Button";
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  MessageCircle,
  Trash2,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const ManageInquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedTour, setSelectedTour] = useState(null);

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    inquiryId: null,
    isDeleting: false,
  });

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/inquiries");
      const data = await res.json();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch inquiries error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const promptDeleteInquiry = (id) => {
    setDeleteModalState({ isOpen: true, inquiryId: id, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.inquiryId) return;
    try {
      setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
      await apiDelete(`/inquiries/${deleteModalState.inquiryId}`);
      setInquiries((prev) => prev.filter((i) => i._id !== deleteModalState.inquiryId));
      setDeleteModalState({ isOpen: false, inquiryId: null, isDeleting: false });
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      (inquiry.name || inquiry.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.phone || "").includes(searchTerm) ||
      (inquiry.tourTitle || inquiry.tourId?.title || inquiry.tourId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.destination || inquiry.tourId?.destination || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" ||
      inquiry.status === filterStatus ||
      (filterStatus === "Inquiry Received" && inquiry.status === "Pending") ||
      (filterStatus === "Booked" && inquiry.status === "Closed");

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Contacted":
        return "bg-sky-50 text-sky-700 border border-sky-200";
      case "Booked":
      case "Closed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Cancelled":
        return "bg-slate-100 text-slate-600 border border-slate-200";
      case "Inquiry Received":
      case "Pending":
      default:
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Customer Inquiries & Leads
          </h1>
          <p className="text-slate-500 text-sm">
            Track and manage customer leads submitted via website & tour packages
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchInquiries}
          isLoading={loading}
          className="cursor-pointer"
        >
          Refresh Leads
        </Button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or package..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
          />
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap">
          {["ALL", "Inquiry Received", "Contacted", "Booked", "Cancelled"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="cursor-pointer text-xs"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* INQUIRIES LIST / TABLE */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-semibold text-sm">
          Loading inquiries...
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium">
          No inquiry leads found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            >
              {/* LEFT COLUMN: Customer Information */}
              <div className="space-y-2 md:col-span-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">
                    {inquiry.fullName || inquiry.name}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getStatusBadge(
                      inquiry.status
                    )}`}
                  >
                    {inquiry.status || "Inquiry Received"}
                  </span>
                  <span className="text-xs text-slate-400">
                    Submitted: {new Date(inquiry.createdAt || inquiry.submittedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`tel:${inquiry.phone}`} className="hover:text-emerald-600">
                    {inquiry.phone}
                  </a>
                </div>

                {inquiry.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span className="truncate">{inquiry.email}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Intended Travel Date: <strong className="text-slate-700">{inquiry.travelDate || "Flexible"}</strong>
                    {(inquiry.travelers || inquiry.numberOfTravelers) &&
                      ` (${inquiry.travelers || inquiry.numberOfTravelers} Traveler${
                        (inquiry.travelers || inquiry.numberOfTravelers) > 1 ? "s" : ""
                      })`}
                  </span>
                </div>

                {inquiry.message && (
                  <div className="p-2 bg-slate-50 rounded-lg text-xs text-slate-600 italic border border-slate-100 mt-1">
                    "{inquiry.message}"
                  </div>
                )}
              </div>

              {/* CENTER COLUMN: Clickable Tour & Destination Block */}
              <div className="md:col-span-5 flex flex-col items-start md:items-center justify-center text-left md:text-center border-t md:border-t-0 md:border-x border-slate-100 pt-4 md:pt-0 px-0 md:px-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Inquired Package
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedTour(inquiry.tourId || inquiry)}
                  className="group flex flex-col items-start md:items-center gap-1 hover:opacity-90 transition cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition flex items-center gap-1.5 uppercase">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    {inquiry.tourTitle || inquiry.tourId?.title || inquiry.tourId?.name || "Tour Package"}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 bg-cyan-50 group-hover:bg-cyan-100 border border-cyan-200/80 px-2.5 py-0.5 rounded-full transition">
                    <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
                    {inquiry.tourId?.destination || inquiry.destination || "View Itinerary & Inclusions"}
                  </span>
                </button>
              </div>

              {/* RIGHT COLUMN: Actions */}
              <div className="md:col-span-3 flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2.5 w-full">
                <a
                  href={`https://wa.me/${inquiry.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hi ${inquiry.fullName || inquiry.name}, thank you for your inquiry about the ${
                      inquiry.tourTitle || inquiry.tourId?.title || inquiry.tourId?.name || "Tour"
                    } package with Padham Travels.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full"
                >
                  <Button
                    variant="success"
                    size="sm"
                    icon={MessageCircle}
                    className="w-full cursor-pointer"
                  >
                    WhatsApp Contact
                  </Button>
                </a>

                <div className="flex items-center justify-between md:justify-end gap-2 w-full">
                  <select
                    value={inquiry.status || "Inquiry Received"}
                    onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Inquiry Received">Inquiry Received</option>
                    <option value="Contacted">Mark Contacted</option>
                    <option value="Booked">Mark Booked</option>
                    <option value="Cancelled">Mark Cancelled</option>
                  </select>

                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => promptDeleteInquiry(inquiry._id)}
                    title="Delete Inquiry"
                    className="cursor-pointer px-2.5"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TOUR DETAILS QUICK-VIEW MODAL */}
      {selectedTour && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-100">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTour(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {selectedTour.destination && (
                  <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} />
                    {selectedTour.destination}
                  </span>
                )}
                {selectedTour.duration && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full flex items-center gap-1">
                    <Clock size={12} />
                    {selectedTour.duration}
                  </span>
                )}
                {selectedTour.price && (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold rounded-full capitalize">
                    {formatPrice(selectedTour.price, selectedTour.currency)} /{selectedTour.pricingUnit || "person"}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedTour.title || selectedTour.name || selectedTour.tourTitle || "Tour Details"}
              </h2>
            </div>

            {/* Poster / Image Thumbnail */}
            {(selectedTour.images || selectedTour.image) && (
              <div className="w-full bg-slate-900/5 rounded-2xl overflow-hidden border border-slate-200/80 flex items-center justify-center p-2 max-h-72">
                <img
                  src={getTourImageUrl(selectedTour)}
                  alt={selectedTour.title || selectedTour.name}
                  className="h-full max-h-64 object-contain rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x500?text=Tour+Package";
                  }}
                />
              </div>
            )}

            {/* Specifications & Highlights */}
            {selectedTour.highlights && selectedTour.highlights.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  Package Highlights
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                  {selectedTour.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 size={14} className="text-cyan-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              {/* Inclusions */}
              <div>
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Inclusions
                </h4>
                {selectedTour.inclusions && selectedTour.inclusions.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {selectedTour.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No inclusions listed.</p>
                )}
              </div>

              {/* Exclusions */}
              <div>
                <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <XCircle size={14} className="text-red-600" />
                  Exclusions
                </h4>
                {selectedTour.exclusions && selectedTour.exclusions.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {selectedTour.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No exclusions listed.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `/tours/${selectedTour._id || selectedTour.id || selectedTour.tourId?._id}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                View Public Page ↗
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedTour(null);
                  navigate("/admin/tours");
                }}
                className="cursor-pointer"
              >
                Edit Tour in Admin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETION */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Customer Inquiry"
        message="Are you sure you want to delete this customer lead? This action cannot be undone."
        confirmText="Delete Lead"
        cancelText="Keep Inquiry"
        isLoading={deleteModalState.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, inquiryId: null, isDeleting: false })}
      />
    </div>
  );
};

export default ManageInquiries;
