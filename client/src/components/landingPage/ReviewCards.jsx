import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const serviceBadgeStyles = {
  tour: "badge-tour",
  package: "badge-package",
  flight: "badge-flight",
};

const serviceLabels = {
  tour: "Tour Experience",
  package: "Travel Package",
  flight: "Flight Booking",
};

const ReviewCard = ({ review }) => {
  return (
    <Card className="h-full flex flex-col border-slate-300">
      <CardContent className="px-4 py-2 flex flex-col h-full">
        {/* Quote Icon */}
        <div className="mb-2">
          <Quote className="w-8 h-8 text-primary/40" />
        </div>

        {/* Review Text */}
        <p className="text-slate-700 leading-relaxed grow mb-6 font-body text-sm md:text-base">
          "{review.review}"
        </p>

        {/* Rating Stars */}
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? "star-filled fill-yellow-400"
                  : "star-empty"
              }`}
            />
          ))}
        </div>

        {/* User Info & Badge */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-300">
          <div className="flex items-center gap-3">
            <img
              src={review.avatar}
              alt={review.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover shrink-0 overflow-hidden ring-2 ring-cyan-500/10"
            />
            <div>
              <p className="font-display font-semibold text-slate-900">
                {review.name}
              </p>
              <p className="text-sm text-slate-500">{review.location}</p>
            </div>
          </div>
          <span className={serviceBadgeStyles[review.serviceType]}>
            {serviceLabels[review.serviceType]}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
