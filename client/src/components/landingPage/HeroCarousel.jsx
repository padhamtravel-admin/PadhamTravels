import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet } from "@/apiClient";
import { getImageUrl } from "@/lib/utils";

// Imports for default Package Banners from src/assets/TripsAndPackages/
import AndamanAndNicobarImg from "@/assets/TripsAndPackages/AndamanAndNicobar.jpeg";
import CharDhamYatraImg from "@/assets/TripsAndPackages/CharDhamYatra.jpeg";
import DubaiImg from "@/assets/TripsAndPackages/Dubai.jpeg";
import KeralaImg from "@/assets/TripsAndPackages/Kerala.jpg";
import SikkimAndDarjeelingImg from "@/assets/TripsAndPackages/SikkimAndDarjeeling.jpg";
import SingaporeImg from "@/assets/TripsAndPackages/Singapore.jpeg";
import ThailandImg from "@/assets/TripsAndPackages/Thailand.jpeg";

const defaultSlides = [
  { id: 1, image: AndamanAndNicobarImg, title: "Andaman & Nicobar" },
  { id: 2, image: CharDhamYatraImg, title: "Char Dham Yatra" },
  { id: 3, image: KeralaImg, title: "Kerala Backwaters" },
  { id: 4, image: SikkimAndDarjeelingImg, title: "Sikkim & Darjeeling" },
  { id: 5, image: SingaporeImg, title: "Singapore" },
  { id: 6, image: ThailandImg, title: "Thailand" },
  { id: 7, image: DubaiImg, title: "Dubai" },
];

export const HeroCarousel = () => {
  const [slides, setSlides] = useState(defaultSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [hasCompletedFirstTransition, setHasCompletedFirstTransition] = useState(false);

  const containerRef = useRef(null);
  const dragStartX = useRef(0);
  const dragOffset = useRef(0);
  const hasDragged = useRef(false);

  // 1. Viewport Intersection Observer (Pauses autoplay when out of view)
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 } // Pauses when less than 20% visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle tab visibility and window blur to prevent background transition queuing & drift
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsInView(false);
      } else if (containerRef.current && typeof IntersectionObserver !== "undefined") {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const visible = rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2;
        setIsInView(visible);
      } else {
        setIsInView(true);
      }
    };

    const handleWindowBlur = () => {
      setIsHovered(false);
      setIsDragging(false);
      dragOffset.current = 0;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  // Fetch dynamic hero banners from backend
  useEffect(() => {
    let isMounted = true;
    const fetchHeroBanners = async () => {
      try {
        const res = await apiGet("/hero-banners");
        const data = await res.json();
        if (isMounted && data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
          const formatted = data.banners.map((b, i) => ({
            id: b._id || b.id || i + 1,
            image: getImageUrl(b.imageUrl),
            title: b.title || `Hero Slide ${i + 1}`,
          }));
          setSlides(formatted);
          setActiveIndex((prev) => (prev >= formatted.length ? 0 : prev));
        }
      } catch (err) {
        console.error("Fetch Hero Banners Error:", err);
      }
    };
    fetchHeroBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  // Responsive window check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNext = useCallback(() => {
    if (slides.length <= 1) return;
    setHasCompletedFirstTransition(true);
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    if (slides.length <= 1) return;
    setHasCompletedFirstTransition(true);
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Dynamic Autoplay Duration: 2.8s for initial slide cue, 4.0s for subsequent slides
  useEffect(() => {
    if (!isInView || isHovered || isDragging || slides.length <= 1) return;

    // 2800ms for the very first transition, 4000ms for everything afterwards
    const currentDuration = !hasCompletedFirstTransition ? 2800 : 4000;

    const timer = setTimeout(() => {
      handleNext();
      if (!hasCompletedFirstTransition) {
        setHasCompletedFirstTransition(true);
      }
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [
    isInView,
    isHovered,
    isDragging,
    activeIndex,
    hasCompletedFirstTransition,
    slides.length,
    handleNext,
  ]);

  // Touch and Mouse gesture handlers
  const handleTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX;
    hasDragged.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - dragStartX.current;
    dragOffset.current = diff;
    if (Math.abs(diff) > 10) {
      hasDragged.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    if (dragOffset.current > 40) {
      handlePrev();
    } else if (dragOffset.current < -40) {
      handleNext();
    }
    setIsDragging(false);
    dragOffset.current = 0;
  };

  const handleMouseDown = (e) => {
    dragStartX.current = e.clientX;
    hasDragged.current = false;
    setIsDragging(true);
  };

  // Global mousemove and mouseup listeners to prevent stuck drag state when released outside
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      const diff = e.clientX - dragStartX.current;
      dragOffset.current = diff;
      if (Math.abs(diff) > 10) {
        hasDragged.current = true;
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragOffset.current > 40) {
        handlePrev();
      } else if (dragOffset.current < -40) {
        handleNext();
      }
      setIsDragging(false);
      dragOffset.current = 0;
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, handleNext, handlePrev]);

  // Helper for minimal circular distance loop
  const getDiff = (index, currentActive) => {
    const total = slides.length || 1;
    let diff = index - currentActive;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  // Compute 3D Coverflow positioning styles with balanced horizontal separation
  const getCardStyle = (diff) => {
    const absDiff = Math.abs(diff);
    const step = isMobile ? 100 : 165;

    // Active Center Slide
    if (diff === 0) {
      return {
        transform: `translate3d(-50%, -50%, 0px) scale(1) rotateY(0deg)`,
        zIndex: 30,
        opacity: 1,
        filter: "blur(0px)",
        pointerEvents: "auto",
        boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(226, 232, 240, 0.8)",
      };
    }

    const direction = diff > 0 ? 1 : -1;

    // Immediate Left / Right Slides (scale-90 z-20 opacity-70)
    if (absDiff === 1) {
      const xPx = direction * step;
      const rot = direction * -14;
      return {
        transform: `translate3d(calc(-50% + ${xPx}px), -50%, -60px) scale(0.90) rotateY(${rot}deg)`,
        zIndex: 20,
        opacity: 0.70,
        filter: "blur(0.3px)",
        pointerEvents: "auto",
        boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.15)",
      };
    }

    // Outer Left / Right Slides (scale-80 z-10 opacity-40)
    if (absDiff === 2) {
      const xPx = direction * (step * 1.7);
      const rot = direction * -25;
      return {
        transform: `translate3d(calc(-50% + ${xPx}px), -50%, -130px) scale(0.80) rotateY(${rot}deg)`,
        zIndex: 10,
        opacity: 0.40,
        filter: "blur(0.8px)",
        pointerEvents: "auto",
        boxShadow: "0 4px 12px -2px rgba(15, 23, 42, 0.1)",
      };
    }

    // Completely Hidden Offscreen Slides
    const xPx = direction * (step * 2.3);
    const rot = direction * -35;
    return {
      transform: `translate3d(calc(-50% + ${xPx}px), -50%, -200px) scale(0.65) rotateY(${rot}deg)`,
      zIndex: 0,
      opacity: 0,
      filter: "blur(2px)",
      pointerEvents: "none",
    };
  };

  return (
    <div
      ref={containerRef}
      className="w-full relative py-2 sm:py-4 select-none overflow-visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Perspective Container */}
      <div
        className="relative w-full h-[260px] sm:h-[380px] md:h-[430px] lg:h-[460px] xl:h-[480px] flex items-center justify-center overflow-visible"
        style={{ perspective: "1100px", transformStyle: "preserve-3d" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {slides.map((slide, idx) => {
          const diff = getDiff(idx, activeIndex);
          const style = getCardStyle(diff);
          const isActive = diff === 0;

          return (
            <div
              key={slide.id}
              onClick={() => {
                if (hasDragged.current) return;
                if (!isActive) {
                  setHasCompletedFirstTransition(true);
                  setActiveIndex(idx);
                }
              }}
              style={{
                ...style,
                willChange: "transform, opacity",
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden",
              }}
              className="absolute top-1/2 left-1/2 w-[290px] sm:w-[420px] md:w-[490px] lg:w-[530px] xl:w-[570px] aspect-[16/11] bg-white rounded-2xl overflow-hidden border border-slate-100 transition-[transform,opacity,filter,box-shadow] duration-500 ease-out cursor-pointer group flex items-center justify-center p-1 sm:p-1.5"
            >
              {/* Pure Framed Poster Image with Crisp Uncropped Artwork */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-contain block select-none rounded-xl"
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-0 sm:left-2 lg:left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-cyan-600 text-slate-700 hover:text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 border border-slate-200 hover:border-cyan-600 cursor-pointer shadow-lg hover:scale-110"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-0 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-cyan-600 text-slate-700 hover:text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 border border-slate-200 hover:border-cyan-600 cursor-pointer shadow-lg hover:scale-110"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-2 mt-4 sm:mt-6">
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 shadow-xs">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setHasCompletedFirstTransition(true);
                setActiveIndex(idx);
              }}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === activeIndex
                  ? "w-7 h-2 bg-cyan-600"
                  : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
