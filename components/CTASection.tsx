"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Send, CheckCircle2, ArrowRight, Sparkles, Shield, Clock, Package } from "lucide-react";
import { gsap, ScrollTrigger, ease, duration, distance } from "@/lib/motion";

interface CTAProps {
  sectionTitle?: string;
  subtitle?: string;
  guarantees?: string[];
  testimonial?: {
    quote: string;
    name: string;
    role: string;
    initials: string;
  };
}

const guaranteeItems = [
  { icon: <Clock size={16} />, text: "Devis sous 24h" },
  { icon: <Shield size={16} />, text: "100% exonéré URSSAF" },
  { icon: <Package size={16} />, text: "Livraison individuelle" },
  { icon: <Sparkles size={16} />, text: "Sur-mesure" },
];

export default function CTASection({
  sectionTitle = "Offrez l'excellence\nà vos collaboratrices",
  subtitle = "Un interlocuteur dédié vous accompagne de la sélection à la livraison.",
  guarantees,
  testimonial,
}: CTAProps) {
  const displayGuarantees = guarantees && guarantees.length > 0
    ? guarantees.map((text, i) => ({ icon: [<Clock size={16} key="c" />, <Shield size={16} key="s" />, <Package size={16} key="p" />, <Sparkles size={16} key="sp" />][i % 4], text }))
    : guaranteeItems;
  const sectionRef = useRef<HTMLElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: "",
    representative: "",
    role: "",
    email: "",
    phone: "",
    quantity: "",
    message: "",
  });

  /* ─── GSAP entrance ─── */
  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(sectionRef.current.querySelectorAll(".cta2-el"), { opacity: 1, y: 0, scale: 1 });
      return;
    }

    // On mobile, show everything instantly — no scroll animations
    if (window.innerWidth < 900) {
      gsap.set(sectionRef.current.querySelectorAll(".cta2-el, .cta2-left-el, .cta2-guarantee, .cta2-field, .cta2-submit"), { opacity: 1, y: 0, x: 0, scale: 1 });
      gsap.set(formCardRef.current, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Image parallax
      gsap.to(".cta2-img", {
        y: -30,
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });

      // Left column elements
      gsap.fromTo(".cta2-left-el", {
        opacity: 0, y: distance.md,
      }, {
        opacity: 1, y: 0,
        duration: duration.enter, ease: ease.enter,
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", toggleActions: "play none none none" },
      });

      // Guarantee pills
      gsap.fromTo(".cta2-guarantee", {
        opacity: 0, y: distance.sm, scale: 0.95,
      }, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.45, ease: "back.out(1.5)", stagger: 0.06, delay: 0.3,
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", toggleActions: "play none none none" },
      });

      // Form card
      gsap.fromTo(formCardRef.current, {
        opacity: 0, y: 40, scale: 0.97,
      }, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.9, ease: "power3.out", delay: 0.15,
        scrollTrigger: { trigger: formCardRef.current, start: "top 85%", toggleActions: "play none none none" },
      });

      // Form fields stagger
      gsap.fromTo(".cta2-field", {
        opacity: 0, x: -12,
      }, {
        opacity: 1, x: 0,
        duration: 0.35, ease: ease.enter, stagger: 0.05, delay: 0.5,
        scrollTrigger: { trigger: formCardRef.current, start: "top 85%", toggleActions: "play none none none" },
      });

      // Submit button
      gsap.fromTo(".cta2-submit", {
        opacity: 0, y: 12, scale: 0.96,
      }, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.5, ease: "back.out(1.5)", delay: 0.7,
        scrollTrigger: { trigger: formCardRef.current, start: "top 85%", toggleActions: "play none none none" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ─── Success animation ─── */
  useEffect(() => {
    if (!sent || !formCardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".cta2-success-icon", { scale: 0, rotation: -180 }, {
        scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.4)",
      });
      gsap.fromTo(".cta2-success-text", { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.5, ease: ease.enter, delay: 0.3,
      });
      gsap.fromTo(".cta2-success-sub", { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.4, ease: ease.enter, delay: 0.5,
      });
    }, formCardRef);
    return () => ctx.revert();
  }, [sent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    if (sectionRef.current) {
      gsap.to(".cta2-submit", { scale: 0.97, duration: 0.15, ease: "power2.in", yoyo: true, repeat: 1 });
    }
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
    } catch {
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
    setSending(false);
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "rgba(135,163,141,0.15)",
    borderRadius: "12px",
    background: "white",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.88rem",
    color: "var(--text-dark)",
    outline: "none",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const inputFocused: React.CSSProperties = {
    borderColor: "var(--sage)",
    boxShadow: "0 0 0 3px rgba(135,163,141,0.1)",
  };

  const getInputStyle = (name: string): React.CSSProperties => ({
    ...inputBase,
    ...(focusedField === name ? inputFocused : {}),
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "var(--text-light)",
    marginBottom: "7px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontFamily: "'Manrope', sans-serif",
  };

  return (
    <section
      id="devis"
      ref={sectionRef}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--cream)",
        padding: "100px 0 80px",
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .cta2-layout { grid-template-columns: 1fr !important; gap: 48px !important; }
          .cta2-left { text-align: center !important; align-items: center !important; }
          .cta2-guarantees { justify-content: center !important; }
          .cta2-img-col { display: none !important; }
        }
        @media (max-width: 600px) {
          .cta2-form-grid { grid-template-columns: 1fr !important; }
        }
        .cta2-field-input:focus {
          border-color: var(--sage) !important;
          box-shadow: 0 0 0 3px rgba(135,163,141,0.1) !important;
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", position: "relative" }}>
        <div
          className="cta2-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: "60px",
            alignItems: "center",
          }}
        >
          {/* ═══ LEFT: Copy + guarantees + image ═══ */}
          <div
            className="cta2-left"
            style={{ display: "flex", flexDirection: "column" }}
          >
            {/* Tag */}
            <span className="cta2-left-el" style={{
              fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--sage)",
              marginBottom: "16px", width: "fit-content",
            }}>
              Demande de devis · Réponse en 24h
            </span>

            {/* Title */}
            <h2 className="cta2-left-el" style={{ marginBottom: "16px" }}>
              <span style={{
                display: "block",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "var(--text-dark)",
                lineHeight: 1.1,
              }}>
                Simplifiez vos cadeaux
              </span>
              <span style={{
                display: "block",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "var(--green-deep)",
                lineHeight: 1.1,
              }}>
                d&apos;entreprise avec O&apos;Méa
              </span>
            </h2>

            {/* Subtitle */}
            <p className="cta2-left-el" style={{
              fontSize: "1.02rem", color: "var(--text-mid)",
              lineHeight: 1.7, marginBottom: "28px", maxWidth: "440px",
            }}>
              Recevez votre devis personnalisé sous 24h. Un interlocuteur dédié vous accompagne de A à Z.
            </p>

            {/* Guarantees — horizontal pills */}
            <div className="cta2-guarantees" style={{
              display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px",
            }}>
              {displayGuarantees.map((g, i) => {
                const isUrssaf = g.text.includes("URSSAF");
                return (
                  <div
                    key={i}
                    className="cta2-guarantee"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      padding: "10px 16px", borderRadius: "999px",
                      background: isUrssaf ? "rgba(45,74,62,0.06)" : "white",
                      borderWidth: isUrssaf ? "1.5px" : "1px",
                      borderStyle: "solid",
                      borderColor: isUrssaf ? "rgba(45,74,62,0.2)" : "rgba(135,163,141,0.1)",
                      boxShadow: "0 2px 8px rgba(45,74,62,0.04)",
                      fontSize: "0.78rem", fontWeight: isUrssaf ? 700 : 600,
                      color: isUrssaf ? "var(--green-deep)" : "var(--text-mid)",
                      fontFamily: "'Manrope', sans-serif",
                      transition: "all 0.3s ease",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--sage)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(45,74,62,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isUrssaf ? "rgba(45,74,62,0.2)" : "rgba(135,163,141,0.1)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(45,74,62,0.04)";
                    }}
                  >
                    <span style={{ color: isUrssaf ? "var(--green-deep)" : "var(--sage)" }}>{g.icon}</span>
                    {g.text}
                  </div>
                );
              })}
            </div>

            {/* Image — moved below copy */}
            <div
              className="cta2-img-col cta2-left-el"
              style={{
                position: "relative",
                borderRadius: "20px",
                overflow: "hidden",
                height: "220px",
                boxShadow: "0 16px 48px rgba(45,74,62,0.1)",
              }}
            >
              <Image
                src="/RH%20cadeau%20maternit%C3%A9.JPG"
                alt="Collaboratrice recevant un coffret O'Méa"
                fill
                className="cta2-img"
                style={{ objectFit: "cover" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, transparent 60%, rgba(45,74,62,0.08) 100%)",
              }} />
            </div>
          </div>

          {/* ═══ RIGHT: Form ═══ */}
          <div
            ref={formCardRef}
            className="cta2-form-card"
            style={{
              borderRadius: "24px",
              background: "white",
              padding: "36px 32px",
              border: "1px solid rgba(135,163,141,0.1)",
              boxShadow: "0 16px 60px rgba(45,74,62,0.08)",
            }}
          >
            {sent ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div className="cta2-success-icon" style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--sage), var(--green-deep))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px",
                  boxShadow: "0 12px 40px rgba(135,163,141,0.25)",
                }}>
                  <CheckCircle2 size={32} style={{ color: "white" }} />
                </div>
                <h3 className="cta2-success-text" style={{
                  fontFamily: "'Manrope', sans-serif", fontWeight: 800,
                  fontSize: "1.4rem", color: "var(--text-dark)",
                  marginBottom: "10px", letterSpacing: "-0.02em",
                }}>
                  Demande envoyée !
                </h3>
                <p className="cta2-success-sub" style={{
                  fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.65,
                }}>
                  Notre équipe vous recontacte sous 24h<br />avec votre devis personnalisé.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ marginBottom: "4px" }}>
                  <h3 style={{
                    fontFamily: "'Manrope', sans-serif", fontWeight: 800,
                    fontSize: "1.05rem", color: "var(--text-dark)",
                    letterSpacing: "-0.02em", marginBottom: "4px",
                  }}>
                    Recevoir un devis personnalisé
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--sage)", lineHeight: 1.5, fontWeight: 600 }}>
                    Réponse garantie sous 24h ouvrées
                  </p>
                </div>

                <div className="cta2-form-grid cta2-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label htmlFor="cta-company" style={labelStyle}>Entreprise *</label>
                    <input id="cta-company" className="cta2-field-input" style={getInputStyle("company")}
                      placeholder="Nom de l'entreprise" required value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      onFocus={() => setFocusedField("company")} onBlur={() => setFocusedField(null)} />
                  </div>
                  <div>
                    <label htmlFor="cta-rep" style={labelStyle}>Représentant *</label>
                    <input id="cta-rep" className="cta2-field-input" style={getInputStyle("representative")}
                      placeholder="Prénom et nom" required value={form.representative}
                      onChange={(e) => setForm({ ...form, representative: e.target.value })}
                      onFocus={() => setFocusedField("representative")} onBlur={() => setFocusedField(null)} />
                  </div>
                </div>

                <div className="cta2-form-grid cta2-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label htmlFor="cta-role" style={labelStyle}>Rôle *</label>
                    <input id="cta-role" className="cta2-field-input" style={getInputStyle("role")}
                      placeholder="Ex : DRH, Office Manager..." required value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      onFocus={() => setFocusedField("role")} onBlur={() => setFocusedField(null)} />
                  </div>
                  <div>
                    <label htmlFor="cta-email" style={labelStyle}>Email pro *</label>
                    <input id="cta-email" type="email" className="cta2-field-input" style={getInputStyle("email")}
                      placeholder="vous@entreprise.fr" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} />
                  </div>
                </div>

                <div className="cta2-form-grid cta2-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label htmlFor="cta-phone" style={labelStyle}>Téléphone</label>
                    <input id="cta-phone" type="tel" className="cta2-field-input" style={getInputStyle("phone")}
                      placeholder="+33 6 00 00 00 00" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)} />
                  </div>
                  <div>
                    <label htmlFor="cta-qty" style={labelStyle}>Quantité estimée</label>
                    <select id="cta-qty" className="cta2-field-input" style={{
                      ...getInputStyle("quantity"), cursor: "pointer",
                      appearance: "none", WebkitAppearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A6B5C' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 14px center",
                      paddingRight: "38px",
                    }} value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      onFocus={() => setFocusedField("quantity")} onBlur={() => setFocusedField(null)}>
                      <option value="">Choisir...</option>
                      <option>5–50 coffrets</option>
                      <option>50–200 coffrets</option>
                      <option>+200 coffrets</option>
                    </select>
                  </div>
                </div>

                <div className="cta2-field">
                  <label htmlFor="cta-msg" style={labelStyle}>Message (optionnel)</label>
                  <textarea id="cta-msg" className="cta2-field-input" style={{
                    ...getInputStyle("message"), height: "80px", resize: "vertical",
                  }} placeholder="Besoins, délais, personnalisation..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    onFocus={() => setFocusedField("message")} onBlur={() => setFocusedField(null)} />
                </div>

                <button type="submit" disabled={sending} className="cta2-submit" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  padding: "15px 24px",
                  background: "var(--green-deep)",
                  color: "white", borderRadius: "14px",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.92rem",
                  border: "none", cursor: sending ? "wait" : "pointer",
                  boxShadow: "0 8px 28px rgba(45,74,62,0.2)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  opacity: sending ? 0.8 : 1,
                }}
                  onMouseEnter={(e) => {
                    if (sending) return;
                    e.currentTarget.style.background = "var(--green-darker)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 14px 40px rgba(45,74,62,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--green-deep)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(45,74,62,0.2)";
                  }}
                >
                  <Send size={15} />
                  {sending ? "Envoi en cours..." : "Recevoir mon devis sous 24h"}
                  {!sending && <ArrowRight size={15} />}
                </button>

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap",
                }}>
                  {["Aucun engagement", "Réponse sous 24h", "Données protégées"].map((txt) => (
                    <span key={txt} style={{
                      fontSize: "0.68rem", color: "var(--text-light)", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: "4px",
                    }}>
                      <CheckCircle2 size={10} style={{ color: "var(--sage)" }} />
                      {txt}
                    </span>
                  ))}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
