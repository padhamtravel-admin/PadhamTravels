import React from "react";
import MainNavbar from "@/components/layout/MainNavbar";
import { TopBarContactUs } from "@/components/landingPage/TopBarContactUs";
import { Header, FeatureBadges } from "@/components/landingPage/Header";
import { Services } from "@/components/landingPage/Services";
import { ToursAndTrips } from "@/components/landingPage/ToursAndTrips";
import { BrandsScroller } from "@/components/landingPage/BrandsScroller";
import ReviewsCarousel from "@/components/landingPage/ReviewsCarousel";
import { StatSection } from "@/components/landingPage/StatSection";
import { Footer } from "@/components/landingPage/Footer";

export const HomePage = () => {
  return (
    <div className="w-full min-h-screen box-border bg-slate-100">
      <TopBarContactUs />
      <MainNavbar />
      <Header />
      <ToursAndTrips />
      <FeatureBadges />
      <Services />
      <BrandsScroller />
      <ReviewsCarousel />
      <StatSection />
      <Footer />
    </div>
  );
};

export default HomePage;
