import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const VISIBILITY_THRESHOLD = 300;

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > VISIBILITY_THRESHOLD) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      aria-label="回到顶部"
      className="group fixed right-6 bottom-24 z-50 rounded-full border border-gray-200 bg-white p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      onClick={scrollToTop}
      type="button"
    >
      <ChevronUp
        className="text-gray-600 transition-colors group-hover:text-gray-800"
        size={20}
      />
    </button>
  );
}
