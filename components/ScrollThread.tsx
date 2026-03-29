"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SVG scroll-animated "fil conducteur" — organic line connecting sections.
 * Draws progressively as the user scrolls down the page.
 * Hidden on mobile and when prefers-reduced-motion is active.
 */
export default function ScrollThread() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pageHeight, setPageHeight] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide on mobile or reduced motion
    const mql = window.matchMedia("(max-width: 900px)");
    const mqr = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => setVisible(!mql.matches && !mqr.matches);
    check();
    mql.addEventListener("change", check);
    mqr.addEventListener("change", check);
    return () => {
      mql.removeEventListener("change", check);
      mqr.removeEventListener("change", check);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    const updateHeight = () => {
      const h = document.documentElement.scrollHeight;
      setPageHeight(h);
    };
    updateHeight();

    // Recalculate on resize
    const ro = new ResizeObserver(updateHeight);
    ro.observe(document.documentElement);

    return () => ro.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || !pathRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);
      path.style.strokeDashoffset = `${length * (1 - progress)}`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial
    return () => window.removeEventListener("scroll", onScroll);
  }, [visible, pageHeight]);

  if (!visible || pageHeight === 0) return null;

  // Build an organic S-curve path that weaves left and right down the page
  const w = 120; // SVG viewport width
  const h = pageHeight;
  const segments = 8;
  const segH = h / segments;

  let d = `M ${w / 2} 0`;
  for (let i = 0; i < segments; i++) {
    const startY = i * segH;
    const endY = startY + segH;
    const midY = startY + segH / 2;
    // Alternate between left and right curves
    const cx = i % 2 === 0 ? w * 0.15 : w * 0.85;
    d += ` Q ${cx} ${midY}, ${w / 2} ${endY}`;
  }

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        marginLeft: "540px", // offset right of the 1200px container
        width: "120px",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.35,
      }}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        ref={pathRef}
        d={d}
        stroke="url(#thread-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        style={{ transition: "stroke-dashoffset 0.05s linear" }}
      />
      <defs>
        <linearGradient id="thread-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sage-light)" stopOpacity="0.6" />
          <stop offset="40%" stopColor="var(--pink-dark)" stopOpacity="0.5" />
          <stop offset="70%" stopColor="var(--sage)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--green-deep)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
