"use client";

import { ArrowRight } from "lucide-react";

interface ButtonSecondaryProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  arrow?: boolean;
  variant?: "outline" | "light";
  style?: React.CSSProperties;
}

export default function ButtonSecondary({
  href,
  onClick,
  children,
  arrow = false,
  variant = "outline",
  style,
}: ButtonSecondaryProps) {
  const isOutline = variant === "outline";

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "14px 24px",
    background: isOutline ? "transparent" : "white",
    color: "var(--green-deep)",
    borderRadius: "999px",
    fontFamily: "var(--font-manrope)",
    fontWeight: 700,
    fontSize: "0.88rem",
    textDecoration: "none",
    border: isOutline ? "1.5px solid var(--green-deep)" : "none",
    cursor: "pointer",
    boxShadow: isOutline ? "none" : "0 8px 28px rgba(0,0,0,0.15)",
    transition: "all 0.25s ease",
    ...style,
  };

  const handleEnter = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (isOutline) {
      el.style.background = "var(--green-deep)";
      el.style.color = "white";
    } else {
      el.style.transform = "translateY(-2px)";
      el.style.boxShadow = "0 12px 36px rgba(0,0,0,0.2)";
    }
  };

  const handleLeave = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (isOutline) {
      el.style.background = "transparent";
      el.style.color = "var(--green-deep)";
    } else {
      el.style.transform = "translateY(0)";
      el.style.boxShadow = "0 8px 28px rgba(0,0,0,0.15)";
    }
  };

  if (href) {
    return (
      <a
        href={href}
        style={baseStyle}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {children}
        {arrow && <ArrowRight size={15} />}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={baseStyle}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {arrow && <ArrowRight size={15} />}
    </button>
  );
}
