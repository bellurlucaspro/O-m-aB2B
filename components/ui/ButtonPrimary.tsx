"use client";

import { ArrowRight } from "lucide-react";

interface ButtonPrimaryProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  arrow?: boolean;
  type?: "button" | "submit";
  style?: React.CSSProperties;
}

export default function ButtonPrimary({
  href,
  onClick,
  children,
  arrow = true,
  type = "button",
  style,
}: ButtonPrimaryProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "15px 28px",
    background: "var(--green-deep)",
    color: "white",
    borderRadius: "999px",
    fontFamily: "var(--font-manrope)",
    fontWeight: 700,
    fontSize: "0.9rem",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 28px rgba(45,74,62,0.25)",
    transition: "all 0.25s ease",
    ...style,
  };

  const handleEnter = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.background = "var(--green-darker)";
    el.style.transform = "translateY(-2px)";
  };

  const handleLeave = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.background = style?.background as string || "var(--green-deep)";
    el.style.transform = "translateY(0)";
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
      type={type}
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
