"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Eleman görünür hale geldiğinde bir kez `true` döner.
 * Flutter'daki VisibilityDetector + AnimationController.forward() karşılığı.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, visible]);

  return { ref, visible };
}

