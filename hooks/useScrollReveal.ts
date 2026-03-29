"use client";

import { useEffect, useRef } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  stagger?: number;
  rootMargin?: string;
}

export function useScrollReveal(options?: ScrollRevealOptions) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll("[data-anim]")
              .forEach((child, i) => {
                setTimeout(() => {
                  const htmlEl = child as HTMLElement;
                  htmlEl.style.opacity = "1";
                  htmlEl.style.transform = "translateY(0) scale(1)";
                }, i * (options?.stagger ?? 120));
              });
          }
        });
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.stagger, options?.rootMargin]);

  return ref;
}
