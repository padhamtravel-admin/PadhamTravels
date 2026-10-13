import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window scroll position to the top on every route transition
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use instant so content does not awkwardly animate scroll up
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
