import { useState, useEffect } from "react";
export function useResponsive() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return {
    isMobile: w < 640,      // Small phones
    isTablet: w >= 640 && w < 1024,  // Tablets and large phones
    isDesktop: w >= 1024,   // Desktop and laptops
    isLargeDesktop: w >= 1280, // Large desktops
    width: w
  };
}
