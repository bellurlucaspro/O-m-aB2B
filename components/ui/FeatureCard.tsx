"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor?: string;
  iconColor?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  accentColor = "var(--pink)",
  iconColor = "var(--accent-mauve)",
}: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--cream)",
        border: "1.5px solid rgba(135,163,141,0.12)",
        borderRadius: "24px",
        padding: "36px",
        cursor: "default",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 56px rgba(45,74,62,0.12)"
          : "0 2px 12px rgba(45,74,62,0.04)",
        borderColor: hovered
          ? "rgba(135,163,141,0.25)"
          : "rgba(135,163,141,0.12)",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          background: accentColor,
          opacity: hovered ? 0.5 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor,
          marginBottom: "20px",
          transition: "transform 0.3s ease",
          transform: hovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "var(--font-manrope)",
          fontWeight: 800,
          fontSize: "1.1rem",
          color: "var(--text-dark)",
          marginBottom: "10px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: "0.88rem",
          color: "var(--text-dark)",
          lineHeight: 1.65,
        }}
      >
        {description}
      </p>
    </div>
  );
}
