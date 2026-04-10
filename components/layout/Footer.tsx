"use client";

import { Linkedin, Mail, MapPin, ArrowRight, Heart } from "lucide-react";
import Image from "next/image";
import type { FooterContent } from "@/lib/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  Linkedin: <Linkedin size={16} />,
  Mail: <Mail size={16} />,
};

export default function Footer({ content }: { content?: FooterContent }) {
  const description = content?.description ?? "Coffrets cadeaux premium pour entreprises. Produits naturels, marques françaises, expérience mémorable.";
  const socialLinks = content?.socialLinks ?? [{ icon: "Linkedin", href: "https://linkedin.com" }, { icon: "Mail", href: "mailto:pro@o-mea.fr" }];
  const navLinks = content?.navigationLinks ?? [
    { label: "Engagements", href: "#pourquoi" },
    { label: "Impact RH", href: "#impact" },
    { label: "Coffrets & Tarifs", href: "#produits" },
    { label: "Processus", href: "#processus" },
    { label: "FAQ", href: "#faq" },
    { label: "À propos", href: "/a-propos" },
  ];
  const services = content?.services ?? ["Coffret Grossesse", "Coffret Naissance", "Coffret Fêtes de fin d'année", "Coffret CSE"];
  const srvHref = content?.servicesHref ?? "#produits";
  const contactEmail = content?.contactEmail ?? "pro@o-mea.fr";
  const contactCtaHref = content?.contactCtaHref ?? "#devis";
  const legalLinks = content?.legalLinks ?? [
    { label: "Mentions légales", href: "#" },
    { label: "Politique de confidentialité", href: "#" },
  ];

  return (
    <footer data-dark-bg="true" style={{ position: "relative", overflow: "hidden" }}>
      <style>{`
        .ft-link {
          font-size: 0.82rem; color: rgba(255,255,255,0.4);
          text-decoration: none; font-weight: 500;
          transition: all 0.3s ease; display: inline-block;
        }
        .ft-link:hover { color: white; letter-spacing: 0.02em; }

        .ft-social {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--green-deep); text-decoration: none;
          background: var(--pink);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ft-social:hover {
          transform: translateY(-4px) scale(1.08);
          box-shadow: 0 12px 32px rgba(255,239,218,0.3);
        }

        @media (max-width: 900px) {
          .ft-headline { font-size: 2.2rem !important; }
          .ft-cols { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .ft-top { flex-direction: column !important; text-align: center; gap: 24px !important; }
          .ft-top-left { align-items: center !important; }
          .ft-bottom-bar { flex-direction: column; text-align: center; }
        }
        @media (max-width: 500px) {
          .ft-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ═══ SECTION 1 — Big statement ═══ */}
      <div style={{ background: "var(--green-deep)", position: "relative", overflow: "hidden" }}>
        {/* Deco */}
        <Image src="/SYMBOLE_RVB-03.png" alt="" width={400} height={400} aria-hidden="true"
          style={{ position: "absolute", top: "50%", right: "-5%", transform: "translateY(-50%) rotate(15deg)", opacity: 0.04, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "-100px", left: "-80px", width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(255,239,218,0.05) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "72px 32px 64px", position: "relative", zIndex: 1 }}>
          {/* Headline row */}
          <div className="ft-top" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "48px", marginBottom: "48px" }}>
            <div className="ft-top-left" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Image src="/Omea LOGO B2B.png" alt="O'Méa" width={180} height={60}
                style={{ height: "44px", width: "auto", objectFit: "contain", marginBottom: "20px" }} />
              <h2 className="ft-headline" style={{
                fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "white",
                letterSpacing: "-0.04em", lineHeight: 1.05, maxWidth: "500px",
              }}>
                Le cadeau d&apos;entreprise qui a du <em style={{ fontStyle: "italic", color: "var(--pink)" }}>sens</em>.
              </h2>
            </div>

            {/* CTA */}
            <a href={contactCtaHref} style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "16px 32px", background: "var(--pink)", color: "var(--green-deep)",
              borderRadius: "999px", fontFamily: "'Manrope', sans-serif",
              fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              flexShrink: 0, whiteSpace: "nowrap",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 44px rgba(255,239,218,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Demander un devis <ArrowRight size={15} />
            </a>
          </div>

          {/* Separator line */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "40px" }} />

          {/* Stats row */}
          <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
            {[
              { val: "+50", label: "Entreprises" },
              { val: "98%", label: "Satisfaction" },
              { val: "100%", label: "Made in France" },
              { val: "24h", label: "Délai devis" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: "var(--sage-light)", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "6px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2 — Links & info ═══ */}
      <div style={{ background: "var(--green-darker)", position: "relative" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px 24px", position: "relative", zIndex: 1 }}>

          <div className="ft-cols" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr", gap: "40px", paddingBottom: "36px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Brand */}
            <div>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "20px", maxWidth: "260px" }}>
                {description}
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                {socialLinks.map((link) => (
                  <a key={link.href} href={link.href} className="ft-social"
                    {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {ICON_MAP[link.icon] ?? <Mail size={16} />}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.68rem", color: "var(--sage)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Navigation</h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {navLinks.map((l) => <a key={l.href} href={l.href} className="ft-link">{l.label}</a>)}
              </nav>
            </div>

            {/* Coffrets */}
            <div>
              <h4 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.68rem", color: "var(--sage)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Nos coffrets</h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {services.map((l) => <a key={l} href={srvHref} className="ft-link">{l}</a>)}
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.68rem", color: "var(--sage)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Contact</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <a href={`mailto:${contactEmail}`} className="ft-link" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={13} style={{ color: "var(--sage)", flexShrink: 0 }} /> {contactEmail}
                </a>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
                  <MapPin size={13} style={{ color: "var(--sage)", flexShrink: 0 }} /> France
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="ft-bottom-bar" style={{
            paddingTop: "20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "12px",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: "4px", margin: 0 }}>
                © {new Date().getFullYear()} O&apos;Méa & Cie — Fabriqué avec <Heart size={8} style={{ color: "var(--pink)" }} /> en France
              </p>
              <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", margin: 0 }}>
                Site conçu par{" "}
                <a
                  href="https://otika.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    textDecoration: "none",
                    fontWeight: 600,
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--pink)"; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}
                >
                  Otika — Agence digitale
                </a>
              </p>
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
              {legalLinks.map((item) => (
                <a key={item.label} href={item.href} style={{
                  fontSize: "0.65rem", color: "rgba(255,255,255,0.2)",
                  textDecoration: "none", transition: "color 0.2s ease",
                }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.2)"; }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
