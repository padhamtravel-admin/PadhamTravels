import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import ReviewCard from "./ReviewCards";

import avatarWomanPurple from "@/assets/13482117.png";
import avatarManGreen from "@/assets/13481854.png";
import avatarCurlyPurple from "@/assets/13482148.png";
import avatarWomanGlasses from "@/assets/avatar_13482193.png";
import avatarWomanBindi from "@/assets/avatar_13482216.png";
import avatarManBlue from "@/assets/man_13481986.png";

const reviews = [
  {
    id: 1,
    name: "Hemangi Joshi",
    location: "Google Reviewer",
    avatar: avatarWomanGlasses,
    rating: 5,
    review:
      "Our Andaman trip with Padham Travels was exceptional. The coordination was seamless, from airport pickup to inter-island transfers. The hotels selected were top-notch and the local guides were very knowledgeable. Highly recommended!",
    serviceType: "tour",
    date: "2024-02-01",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    location: "Google Reviewer",
    avatar: avatarCurlyPurple,
    rating: 5,
    review:
      "Booked a family package for Kerala. The itinerary was well-paced and the houseboat experience was the highlight. Padham Travels staff was available 24/7 for any queries we had during the trip.",
    serviceType: "package",
    date: "2024-01-20",
  },
  {
    id: 3,
    name: "Sneha Patil",
    location: "Google Reviewer",
    avatar: avatarWomanPurple,
    rating: 5,
    review:
      "The best travel agency for international flights. They managed to get me a great deal on a last-minute flight to London. The visa assistance provided was also very professional and quick.",
    serviceType: "flight",
    date: "2024-01-15",
  },
  {
    id: 4,
    name: "Amit Sharma",
    location: "Google Reviewer",
    avatar: avatarManGreen,
    rating: 5,
    review:
      "We took the Himachal tour package. The driver was very polite and the car provided was in excellent condition. Padham Travels ensures safety and comfort for their travelers. Truly a 5-star experience.",
    serviceType: "tour",
    date: "2024-01-05",
  },
  {
    id: 5,
    name: "Priyanka Reddy",
    location: "Google Reviewer",
    avatar: avatarWomanBindi,
    rating: 5,
    review:
      "I have been using Padham Travels for my business trips for 2 years now. Their efficiency in booking and handling rescheduling is unmatched. Reliable and trustworthy service every single time.",
    serviceType: "flight",
    date: "2023-12-28",
  },
  {
    id: 6,
    name: "Vikram Singh",
    location: "Google Reviewer",
    avatar: avatarManBlue,
    rating: 5,
    review:
      "Thank you Padham Travels for an unforgettable Dubai trip! The desert safari and Burj Khalifa tours were perfectly scheduled. Everything was handled with great care and professionalism.",
    serviceType: "package",
    date: "2023-12-15",
  },
];

const ReviewsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 640px)": { slidesPerView: 2 },
      "(min-width: 768px)": { slidesPerView: 3 },
      "(min-width: 1024px)": { slidesPerView: 3 } /* Only 3 */,
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="py-6 md:py-8 bg-background">
      <div className="container mx-auto px-10">
        {/* Section Header */}
        <div className="text-center mb-5 md:mb-8">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Real stories from adventurers who trusted us with their journeys
          </p>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-md font-medium mt-4">
            Reviews
          </span>
        </div>

        {/* Carousel */}
        <div className="relative px-4 md:px-8">
          <div className="embla reviews overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex h-full">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] p-2 md:p-4"
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex bg-card border-border hover:bg-primary hover:text-primary-foreground shadow-card"
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex bg-card border-border hover:bg-primary hover:text-primary-foreground shadow-card"
            disabled={!canScrollNext}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2.5 mt-6">
          {reviews.map((_, index) => {
            const isActive = selectedIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                className={`h-3 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? "w-8 bg-cyan-600 shadow-sm"
                    : "w-3 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
