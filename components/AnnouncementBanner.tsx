"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  text: string;
  bgColor: string;
  textColor: string;
}

export default function AnnouncementBanner({ text, bgColor, textColor }: Props) {
  const [visible, setVisible] = useState(true);

  if (!visible || !text) return null;

  return (
    <div
      data-announcement-banner
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 110,
        background: bgColor || "#4A5C4E",
        color: textColor || "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "7px 48px",
        fontFamily: "var(--font-inter)",
        fontSize: "0.75rem",
        fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1.4,
        textAlign: "center",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span>{text}</span>
      <button
        onClick={() => setVisible(false)}
        aria-label="Fermer"
        style={{
          position: "absolute",
          right: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          color: textColor || "#ffffff",
          cursor: "pointer",
          opacity: 0.6,
          transition: "opacity 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
