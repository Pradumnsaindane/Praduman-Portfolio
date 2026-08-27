import { useEffect, useRef, useState } from 'react';

/**
 * Reveal-on-scroll. Returns [ref, shown]; attach ref to an element and use
 * `shown` to toggle a class. Respects prefers-reduced-motion.
 */
export default function useReveal(options = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, shown];
}
