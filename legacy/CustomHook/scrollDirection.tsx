import { useEffect, useState } from "react";

export function useScrollDirection(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY + threshold
        ? "down"
        : currentScrollY < lastScrollY - threshold
        ? "up"
        : null;

      if (direction && direction !== scrollDirection) {
        setScrollDirection(direction);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", updateScrollDirection);
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [scrollDirection, threshold]);

  return scrollDirection;
}