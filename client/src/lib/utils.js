import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price, currency = "INR") => {
  if (!price && price !== 0) return "";
  const cleanPrice = typeof price === "string" ? price.replace(/[^0-9.]/g, "") : price;
  const numericPrice = Number(cleanPrice);
  if (isNaN(numericPrice)) return price;

  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    AED: "AED ",
    SGD: "S$",
    THB: "฿",
  };

  const symbol = currencySymbols[currency] || "₹";

  if (currency === "INR") {
    return `${symbol}${numericPrice.toLocaleString("en-IN")}`;
  }
  return `${symbol}${numericPrice.toLocaleString("en-US")}`;
};

export const getImageUrl = (imagePath) => {
  if (
    !imagePath ||
    typeof imagePath !== "string" ||
    imagePath.trim() === "" ||
    imagePath === "null" ||
    imagePath === "undefined" ||
    imagePath === "[object Object]"
  ) {
    return "https://via.placeholder.com/800x500?text=Tour+Package";
  }

  const cleanPath = imagePath.trim();
  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://") ||
    cleanPath.startsWith("data:")
  ) {
    return cleanPath;
  }

  const baseUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://padham-travel-api.onrender.com"
  ).replace(/\/api\/?$/, "");

  return `${baseUrl}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
};

export const getTourImageUrl = (tour) => {
  if (!tour) return "https://via.placeholder.com/800x500?text=Tour+Package";

  if (typeof tour === "string") {
    return getImageUrl(tour);
  }

  const rawImage =
    Array.isArray(tour.images) && tour.images.length > 0 && tour.images[0]
      ? tour.images[0]
      : tour.image || tour.coverImage;

  return getImageUrl(rawImage);
};

