"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

interface SectionWrapperProps {
  id?: string;
  children: React.ReactNode;
  background?: string;
  padding?: string;
  className?: string;
  threshold?: number;
  stagger?: number;
  darkBg?: boolean;
  style?: React.CSSProperties;
}

export default function SectionWrapper({
  id,
  children,
  background = "var(--cream)",
  padding = "100px 0",
  className,
  threshold = 0.1,
  stagger = 120,
  darkBg = false,
  style,
}: SectionWrapperProps) {
  const ref = useScrollReveal({ threshold, stagger });

  return (
    <section
      id={id}
      ref={ref}
      className={className}
      data-dark-bg={darkBg || undefined}
      style={{
        background,
        padding,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 32px",
          position: "relative",
        }}
      >
        {children}
      </div>
    </section>
  );
}
