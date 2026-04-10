"use client";

import { useState } from "react";

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/omea.cie/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@omea.cie",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/omea.cie",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/catherine-rey-65056b76/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
      </svg>
    ),
  },
];

export default function SocialSidebar() {
  const [whatsappHovered, setWhatsappHovered] = useState(false);

  return (
    <>
      <style>{`
        .social-sidebar {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 999;
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow: hidden;
        }
        .social-sidebar__link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          color: var(--green-deep);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
          position: relative;
        }
        .social-sidebar__link:hover {
          background: rgba(135,163,141,0.15) !important;
          transform: scale(1.08);
        }
        .social-sidebar__link:first-child {
          border-radius: 12px 0 0 0;
        }
        .social-sidebar__link:last-child {
          border-radius: 0 0 0 12px;
        }
        .social-sidebar__tooltip {
          position: absolute;
          right: 54px;
          background: var(--cream-dark);
          color: var(--green-deep);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transform: translateX(8px);
          transition: all 0.25s ease;
          font-family: 'Inter', sans-serif;
        }
        .social-sidebar__link:hover .social-sidebar__tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        /* WhatsApp floating button */
        .whatsapp-btn {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 999;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          text-decoration: none;
        }
        .whatsapp-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(37, 211, 102, 0.5);
        }
        .whatsapp-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #25D366;
          animation: whatsappPulse 2s ease-in-out infinite;
        }
        @keyframes whatsappPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0; }
        }
        .whatsapp-label {
          position: absolute;
          bottom: 68px;
          right: 0;
          background: var(--cream);
          color: var(--text-dark);
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          white-space: nowrap;
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.3s ease;
          pointer-events: none;
        }
        .whatsapp-label.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .whatsapp-label::after {
          content: '';
          position: absolute;
          bottom: -6px;
          right: 24px;
          width: 12px;
          height: 12px;
          background: var(--cream);
          transform: rotate(45deg);
          border-radius: 2px;
        }

        @media (max-width: 768px) {
          .social-sidebar { display: none; }
          .whatsapp-btn {
            width: 52px;
            height: 52px;
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>

      {/* Social sidebar — right edge */}
      <div className="social-sidebar">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-sidebar__link"
            style={{ background: "rgba(135,163,141,0.08)" }}
            aria-label={s.name}
          >
            {s.icon}
            <span className="social-sidebar__tooltip">{s.name}</span>
          </a>
        ))}
      </div>

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/33756971031"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
        onMouseEnter={() => setWhatsappHovered(true)}
        onMouseLeave={() => setWhatsappHovered(false)}
        aria-label="Nous contacter sur WhatsApp"
      >
        <div className="whatsapp-pulse" />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
        <div className={`whatsapp-label ${whatsappHovered ? "visible" : ""}`}>
          Discutons sur WhatsApp
        </div>
      </a>
    </>
  );
}
