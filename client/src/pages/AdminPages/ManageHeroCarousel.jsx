import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ConfirmModal from "@/components/common/ConfirmModal";
import { apiGet, apiPost, apiDelete, apiPut } from "@/apiClient";
import { getImageUrl } from "@/lib/utils";
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Layers,
  Sparkles,
  X,
} from "lucide-react";

export const ManageHeroCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [bannerTitle, setBannerTitle] = useState("");

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    bannerId: null,
    isDeleting: false,
  });

  const MAX_BANNERS = 8;

  // Load hero banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGet("/hero-banners/all");
      const data = await res.json();
      if (data.banners && Array.isArray(data.banners)) {
        setBanners(data.banners);
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error("LOAD HERO BANNERS ERROR:", err);
      setError("Failed to load hero carousel banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        alert("File size exceeds 20MB. Please select an optimized image.");
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select an image file to upload.");
      return;
    }

    if (banners.length >= MAX_BANNERS) {
      alert("Maximum limit of 8 hero banners reached. Please delete an existing banner before adding a new one.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("title", bannerTitle.trim());
      formData.append("order", banners.length);

      const res = await apiPost("/hero-banners", formData);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not upload banner.");
      }

      setBanners((prev) => [...prev, data.banner]);
      setSelectedFile(null);
      setBannerTitle("");
      if (document.getElementById("hero-file-upload")) {
        document.getElementById("hero-file-upload").value = "";
      }
    } catch (err) {
      console.error("UPLOAD BANNER ERROR:", err);
      setError(err.message || "Failed to upload hero banner.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModalState({ isOpen: true, bannerId: id, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.bannerId) return;
    try {
      setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
      const res = await apiDelete(`/hero-banners/${deleteModalState.bannerId}`);
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => (b._id || b.id) !== deleteModalState.bannerId));
      } else {
        alert("Could not delete banner.");
      }
    } catch (err) {
      console.error("DELETE BANNER ERROR:", err);
      alert("Error deleting banner.");
    } finally {
      setDeleteModalState({ isOpen: false, bannerId: null, isDeleting: false });
    }
  };

  const handleReorder = async (currentIndex, targetIndex) => {
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const reordered = [...banners];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update local state immediately for snappy UX
    const updated = reordered.map((b, i) => ({ ...b, order: i }));
    setBanners(updated);

    // Sync to backend
    try {
      const itemsPayload = updated.map((b, i) => ({ id: b._id || b.id, order: i }));
      await apiPut("/hero-banners/reorder", { items: itemsPayload });
    } catch (err) {
      console.error("REORDER ERROR:", err);
      fetchBanners(); // Rollback if error
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setLoading(true);
      const res = await apiPost("/hero-banners/seed?force=true", {});
      const data = await res.json();
      if (data.banners) {
        setBanners(data.banners);
      } else {
        fetchBanners();
      }
    } catch (err) {
      console.error("SEED DEFAULT ERROR:", err);
      alert("Failed to load default banners.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = banners.length >= MAX_BANNERS;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER & COUNTER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Layers className="text-cyan-600 w-7 h-7 shrink-0" />
            Manage Homepage Hero Carousel
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload, reorder & delete homepage promotional banners (Max 8 slides)
          </p>
        </div>

        {/* Counter Pill Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-2xl border font-bold text-sm flex items-center gap-2 ${
              isLimitReached
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-cyan-50 text-cyan-800 border-cyan-200"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
            Banner Slots Used: {banners.length} / {MAX_BANNERS}
          </div>

          {banners.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={handleSeedDefaults}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Load Default Banners
            </Button>
          )}
        </div>
      </div>

      {/* UPLOAD FORM BOX */}
      <Card className="bg-white border-slate-200 shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-600" />
              Add New Carousel Banner
            </h2>
            {isLimitReached && (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                Limit Reached (8/8) — Delete a banner to upload a new one
              </span>
            )}
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
              {/* Optional Title Input */}
              <div className="lg:col-span-1">
                <Label htmlFor="bannerTitle" className="mb-1.5 block font-bold text-slate-700 text-xs uppercase">
                  Banner Title / Offer Text (Optional)
                </Label>
                <Input
                  id="bannerTitle"
                  type="text"
                  placeholder="e.g. Exclusive Coupon Fair 2026"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  disabled={isLimitReached || uploading}
                  className="bg-slate-50 border-slate-200 focus:border-cyan-500 rounded-xl"
                />
              </div>

              {/* File Input & Preview */}
              <div className="lg:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input
                  type="file"
                  id="hero-file-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLimitReached || uploading}
                  className="hidden"
                />

                {!selectedFile ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    icon={UploadCloud}
                    disabled={isLimitReached || uploading}
                    onClick={() => document.getElementById("hero-file-upload")?.click()}
                    className="cursor-pointer bg-slate-50 hover:bg-slate-100 border-dashed border-slate-300 w-full sm:w-auto shrink-0"
                  >
                    Select Device Image
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 p-2 bg-cyan-50 border border-cyan-200 rounded-xl grow truncate">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="h-12 w-20 object-contain rounded-lg border border-cyan-200 shrink-0 bg-white"
                    />
                    <div className="truncate grow">
                      <span className="text-xs font-bold text-cyan-900 block truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-[11px] text-cyan-700 font-semibold block">
                        Ready to upload to Cloudinary
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={X}
                      onClick={() => {
                        setSelectedFile(null);
                        if (document.getElementById("hero-file-upload")) {
                          document.getElementById("hero-file-upload").value = "";
                        }
                      }}
                      className="p-1.5 cursor-pointer shrink-0"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Plus}
                  isLoading={uploading}
                  disabled={isLimitReached || !selectedFile || uploading}
                  className="w-full sm:w-auto shrink-0 cursor-pointer"
                >
                  Upload Banner
                </Button>
              </div>
            </div>
          </form>

          {error && <p className="text-red-500 text-xs font-bold mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* BANNERS LIST / GRID */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-extrabold text-slate-800">Active Carousel Banners</h2>
          <span className="text-xs font-semibold text-slate-500">
            Use arrows to reorder slides horizontal sequence
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 font-semibold text-sm">
            Loading hero banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3 p-6">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">No Carousel Banners Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Upload your own device promotional images (up to 8 banners) or click below to load default travel slides.
            </p>
            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              onClick={handleSeedDefaults}
              className="cursor-pointer"
            >
              Load Default Banners
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {banners.map((banner, index) => (
              <Card
                key={banner._id || banner.id || index}
                className="bg-white border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow rounded-2xl flex flex-col justify-between"
              >
                {/* Banner Thumbnail */}
                <div className="relative aspect-[16/10] w-full bg-slate-900/5 p-2 flex items-center justify-center border-b border-slate-100">
                  <img
                    src={getImageUrl(banner.imageUrl)}
                    alt={banner.title || `Banner ${index + 1}`}
                    className="w-full h-full object-contain rounded-xl block"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/800x500?text=Hero+Banner";
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-lg backdrop-blur-md">
                    #{index + 1}
                  </span>
                </div>

                {/* Banner Details & Actions */}
                <CardContent className="p-4 space-y-3 flex flex-col grow justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1">
                      {banner.title || `Carousel Banner #${index + 1}`}
                    </h4>
                    <span className="text-[11px] text-slate-400 block font-medium mt-0.5">
                      Uploaded: {new Date(banner.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Controls: Reorder & Delete */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleReorder(index, index - 1)}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Move Left / Earlier"
                        aria-label="Move banner left"
                      >
                        <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
                      </button>
                      <button
                        type="button"
                        disabled={index === banners.length - 1}
                        onClick={() => handleReorder(index, index + 1)}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Move Right / Later"
                        aria-label="Move banner right"
                      >
                        <ArrowRight className="w-5 h-5" strokeWidth={2.2} />
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteClick(banner._id || banner.id)}
                      className="cursor-pointer text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Carousel Banner"
        message="Are you sure you want to delete this hero banner? It will be removed from the homepage carousel immediately."
        confirmText="Delete Banner"
        cancelText="Keep Banner"
        isLoading={deleteModalState.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, bannerId: null, isDeleting: false })}
      />
    </div>
  );
};

export default ManageHeroCarousel;
