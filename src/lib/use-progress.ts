import { useEffect, useRef, useState } from "react";

export type ProgressRef = { current: number };

export function useProgress<T extends HTMLElement>(trackReactState = true) {
  const ref = useRef<T>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight || 1;
      let next = 0;
      if (rect.height <= view) {
        const center = rect.top + rect.height / 2;
        next = 1 - center / view;
      } else {
        const total = rect.height - view;
        next = -rect.top / total;
      }
      next = Math.min(1, Math.max(0, next));
      progressRef.current = next;
      const quant = Math.round(next * 48) / 48;
      if (trackReactState) {
        setProgress((prev) => (Math.abs(prev - quant) < 0.0001 ? prev : quant));
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [trackReactState]);

  return { ref, progressRef, progress };
}
