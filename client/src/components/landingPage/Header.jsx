import React from "react";
import { HeroCarousel } from "./HeroCarousel";
import { useNavigate } from "react-router-dom";
import { Compass, Clock, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import Button from "@/components/common/Button";

export const Header = () => {
  const navigate = useNavigate();
  const whatsappPhone = import.meta.env.VITE_WHATSAPP_NUMBER || "919944229209";

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent(
      "Hi Padham Travels, I would like to inquire about your customized tour packages."
    );
    window.open(`https://wa.me/${whatsappPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="w-full h-auto min-h-0 bg-[#f8fafc] text-slate-900 pt-6 pb-6 lg:pb-10 relative overflow-hidden border-b border-slate-200/60">
      {/* EXPANDED FULL-WIDTH HERO CONTAINER */}
      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT COLUMN: Text */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left pl-2 lg:pl-4 space-y-6">
            <div>
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold uppercase tracking-widest mb-4">
                EXPLORE THE WORLD
              </span>

              <h1 className="font-serif text-4xl md:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Travel Far, <br className="hidden sm:inline" />
                <span className="text-cyan-600">Live Fully</span>
              </h1>
            </div>

            <p className="text-slate-600 text-base md:text-lg font-normal leading-relaxed max-w-xl">
              Discover customized tour packages, spiritual yatras,
              and international holidays with Padham Travels. Experience seamless booking and 24/7 dedicated travel guidance.
            </p>

            <div className="flex flex-wrap items-center justify-start gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/tours-and-packages")}
                className="cursor-pointer group whitespace-nowrap"
              >
                <span>Explore Packages</span>
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ml-1" />
              </Button>

              <Button
                variant="success"
                size="lg"
                icon={MessageCircle}
                onClick={handleWhatsAppClick}
                className="cursor-pointer"
              >
                WhatsApp Us
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Hero Carousel */}
          <div className="lg:col-span-7 flex justify-center items-center w-full overflow-visible relative">
            <HeroCarousel />
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeatureBadges = () => {
  return (
    <div className="w-full bg-slate-50/70 py-10 border-y border-slate-200/80">
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 p-2">
              <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 shrink-0 border border-cyan-100">
                <Compass size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">
                  Curated Packages
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Handcrafted itineraries tailored for families, couples & groups.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 p-2">
              <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 shrink-0 border border-cyan-100">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">
                  Best Price Guarantee
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Transparent pricing with zero hidden fees and exclusive deals.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 p-2">
              <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 shrink-0 border border-cyan-100">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">
                  Seamless Support
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  24/7 dedicated travel guidance from departure to arrival.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-4 p-2">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100">
                <MessageCircle size={24} className="fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">
                  Instant Lead Response
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Direct WhatsApp inquiry with instant customized quotes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
