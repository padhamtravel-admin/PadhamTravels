import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import CONSTANTS from "@/constants/AppConstants";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MessageCircle, ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";
import { apiGet } from "@/apiClient";
import { formatPrice, getTourImageUrl } from "@/lib/utils";

export const ToursAndTrips = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/tours");
      const data = await res.json();
      const tourList = Array.isArray(data) ? data : data.tours || [];

      // Filter featured tours first
      const featured = tourList.filter(
        (t) => t.isFeatured === true || t.isFeatured === "true"
      );
      const finalDisplayList = featured.length > 0 ? featured : tourList;

      setTours(finalDisplayList);
    } catch (err) {
      console.error("Fetch featured tours error:", err);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const fallbackTrips = CONSTANTS.TOURS_AND_PACKAGES;
  const displayItems = tours.length > 0 ? tours : fallbackTrips;

  return (
    <section className="w-full py-12 sm:py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER ROW */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs sm:text-sm font-bold tracking-widest text-cyan-600 uppercase mb-2 block">
              TOP DESTINATIONS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
              Where Will You <span className="text-cyan-600">Go Next?</span>
            </h2>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/tours-and-packages")}
            className="uppercase tracking-wider font-bold cursor-pointer"
          >
            <span>VIEW ALL PACKAGES</span>
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        {/* CAROUSEL GRID */}
        <div className="relative group/carousel">
          <div className="embla overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex -ml-4">
              {displayItems.map((tour, idx) => (
                <div
                  key={tour._id || tour.id || idx}
                  className="embla__slide flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] min-w-0"
                >
                  <ToursAndTripsCard tour={tour} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {displayItems.length > 0 && (
            <>
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full shadow-md transition-all z-10 bg-white border border-slate-200 text-slate-700 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 disabled:opacity-30 cursor-pointer"
                aria-label="Previous slide"
              >
                <FiChevronLeft size={20} />
              </button>

              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full shadow-md transition-all z-10 bg-white border border-slate-200 text-slate-700 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 disabled:opacity-30 cursor-pointer"
                aria-label="Next slide"
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const ToursAndTripsCard = ({ tour }) => {
  const navigate = useNavigate();
  const whatsappPhone = import.meta.env.VITE_WHATSAPP_NUMBER || "919944229209";

  const title = tour.name || tour.title || "Tour Package";
  const destination = tour.destination || "DESTINATION";
  const imageUrl = getTourImageUrl(tour);
  const priceDisplay = tour.price !== undefined ? formatPrice(tour.price, tour.currency) : (tour.amount || "₹35,000");
  const unitDisplay = tour.pricingUnit || "person";

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const msg = encodeURIComponent(
      `Hi Padham Travels, I am interested in booking the "${title}" package.`
    );
    window.open(`https://wa.me/${whatsappPhone}?text=${msg}`, "_blank");
  };

  const handleCardClick = () => {
    if (tour.id || tour._id) {
      navigate(`/tours/${tour.id || tour._id}`, { state: { tour } });
    } else {
      navigate("/tours-and-packages");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group/card h-full flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden p-3.5 cursor-pointer"
    >
      {/* Image Banner */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/800x500?text=Tour+Package";
          }}
        />

        {/* Category Pill Tag */}
        <span className="absolute top-3 left-3 bg-cyan-50/95 backdrop-blur-md text-cyan-800 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs border border-cyan-200">
          {tour.isFeatured ? "FEATURED" : destination}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col grow pt-3 px-1">
        <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1 line-clamp-1 group-hover/card:text-cyan-600 transition-colors">
          {title}
        </h3>

        <p className="text-xs text-slate-500 mb-3 line-clamp-1">
          {tour.duration ? tour.duration : "Customized Tour & Sightseeing Package"}
        </p>

        {/* Price & Action Section */}
        <div className="mt-auto pt-3 border-t border-slate-100 space-y-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Starting from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-cyan-600">
                {priceDisplay}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                /{unitDisplay}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="success"
              size="sm"
              icon={MessageCircle}
              onClick={handleWhatsApp}
              className="w-full cursor-pointer"
            >
              WhatsApp
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="w-full cursor-pointer"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
