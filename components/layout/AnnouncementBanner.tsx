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
        background: bgColor || "#FFEFDA",
        color: textColor || "#2D4A3E",
        overflow: "hidden",
        height: "34px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <style>{`
        @keyframes bannerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .banner-track {
          display: flex;
          animation: bannerScroll 25s linear infinite;
          white-space: nowrap;
        }
        .banner-track:hover {
          animation-play-state: paused;
        }
        .banner-item {
          display: inline-flex;
          align-items: center;
          gap: 24px;
          padding: 0 32px;
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .banner-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.35;
          flex-shrink: 0;
        }
      `}</style>

      <div className="banner-track">
        {/* Duplicate content for seamless loop */}
        {[0, 1].map((loop) => (
          <div key={loop} className="banner-item">
            <span>{text}</span>
            <span className="banner-dot" />
            <span>{text}</span>
            <span className="banner-dot" />
            <span>{text}</span>
            <span className="banner-dot" />
            <span>{text}</span>
            <span className="banner-dot" />
          </div>
        ))}
      </div>

      <button
        onClick={() => setVisible(false)}
        aria-label="Fermer"
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(45,74,62,0.08)",
          border: "none",
          borderRadius: "50%",
          width: "22px",
          height: "22px",
          color: textColor || "#2D4A3E",
          cursor: "pointer",
          opacity: 0.5,
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(45,74,62,0.15)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.background = "rgba(45,74,62,0.08)"; }}
      >
        <X size={11} strokeWidth={2.5} />
      </button>
    </div>
  );
}
