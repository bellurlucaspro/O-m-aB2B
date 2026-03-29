"use client";

import { Linkedin, Mail, MapPin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      data-dark-bg="true"
      style={{
        background: "var(--green-darker)",
        padding: "60px 0 32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Leaf decoration */}
      <svg
        width="280"
        height="280"
        viewBox="0 0 1024 1024"
        style={{
          position: "absolute",
          top: "-40px",
          right: "3%",
          opacity: 0.06,
          transform: "rotate(15deg)",
          pointerEvents: "none",
        }}
      >
        <path
          d="M450.72 418.17c-42.29-21.86-144.5-220-171.65-198.22s-40.59 114.28 0.29 171.31 132 97 153.52 129.58 18.45 57.07 13.36 63.2S262.49 462 217.66 485.53s-28.41 84.69 17.56 132.54S427 651.39 455.57 672.76s32.72 55 20.49 55-145.88-32.38-192.77-24.15-68.25 39.89 0.12 73.42 180.26 8.87 199.28 28.21 6.8 28.54-7.47 29.58-110.14-4.91-143.78 0.24 6.21 56.07 23.57 69.3 80.59 19.24 98.94 16.15 36.67-26.58 51-20.48 3.14 45.88 8.25 53 46.92 9.1 53-0.09-10.26-37.71-0.09-51 32.65 11.16 66.28-1.13 109-70.55 111-104.2-132.52 27.76-167.19 26.8c-24.48-4-34.71-21.36-19.43-30.56s228.33-55.45 244.57-96.27 4-34.68-21.47-34.63S605.6 724.45 590.26 700 791 610 813.3 555.9s29.37-119.36-0.22-127.47-147.62 137.92-194.54 130.86-1.06-21.41 19.29-48 132.36-120.51 133.32-154.16 10.08-67.32-27.65-71.33-129.27 135.84-149.69 123.63 52.89-78.61 64-143.89S632.09 133 611.7 137.14s-19.37 4.11-19.34 22.47 10.33 79.52-1.85 114.21-13.14 60.18-23.35 54.08-10.27-43.83-4.2-73.41 23.3-92.83 13.07-112.19S545.27 48.53 467.8 68s-72.25 89.86-65 136.75 27.67 83.57 45.09 128.41 21.71 94.77 2.83 85.01z"
          fill="#F3F0E8"
        />
      </svg>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "48px",
            paddingBottom: "48px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <style>{`
            @media (max-width: 900px) {
              .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
            }
            @media (max-width: 500px) {
              .footer-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <Image
                src="/O_MEA_TEXTE_-15 (1).png"
                alt="O'Méa"
                width={160}
                height={56}
                style={{ height: "36px", width: "auto", objectFit: "contain" }}
              />
            </div>
            <p
              style={{
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.65,
                maxWidth: "240px",
                marginBottom: "20px",
              }}
            >
              Coffrets cadeaux premium pour entreprises. Produits naturels, marques
              françaises, expérience mémorable.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(255,255,255,0.12)";
                  el.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(255,255,255,0.06)";
                  el.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                <Linkedin size={15} />
              </a>
              <a
                href="mailto:contact@o-mea.fr"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(255,255,255,0.12)";
                  el.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(255,255,255,0.06)";
                  el.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Navigation
            </h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Nos coffrets", href: "#produits" },
                { label: "Nos engagements", href: "#pourquoi" },
                { label: "Impact RH", href: "#impact" },
                { label: "Sur-mesure", href: "#personnalisation" },
                { label: "\À propos", href: "/a-propos" },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: "0.83rem",
                    color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = "white")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)")
                  }
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Nos coffrets
            </h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Coffret Grossesse",
                "Coffret Naissance",
                "Coffret Fêtes de fin d'année",
                "Coffret CSE",
                "Coffret Événements CSE",
              ].map((l) => (
                <a
                  key={l}
                  href="#produits"
                  style={{
                    fontSize: "0.83rem",
                    color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = "white")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)")
                  }
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Contact
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a
                href="mailto:contact@o-mea.fr"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.83rem",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "white")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")
                }
              >
                <Mail size={13} />
                contact@o-mea.fr
              </a>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.83rem",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <MapPin size={13} />
                France
              </div>
            </div>

            <a
              href="#devis"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                marginTop: "20px",
                padding: "10px 18px",
                background: "var(--sage)",
                color: "white",
                borderRadius: "999px",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--sage-light)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--sage)")
              }
            >
              Demander un devis
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            © {new Date().getFullYear()} O&apos;Méa. Tous droits réservés.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {["Mentions légales", "Politique de confidentialité", "CGV"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    fontSize: "0.73rem",
                    color: "rgba(255,255,255,0.25)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.25)")
                  }
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
