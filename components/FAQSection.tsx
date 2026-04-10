"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, ease, duration, distance } from "@/lib/motion";
import type { FAQContent } from "@/lib/types";

const DEFAULT_FAQS = [
  {
    q: "Quels types d'occasions couvrez-vous ?",
    a: "Maternité, naissance, fêtes de fin d'année, événements CSE, welcome pack, départ en congé… Nous proposons des coffrets pour chaque moment clé de la vie en entreprise, et nous composons aussi des coffrets sur-mesure.",
  },
  {
    q: "Les coffrets sont-ils conformes URSSAF ?",
    a: "Oui. Nos coffrets sont conçus pour respecter les seuils d'exonération de charges sociales. Nous fournissons les justificatifs nécessaires à votre CSE ou service comptable.",
  },
  {
    q: "Quel est le délai de livraison ?",
    a: "Comptez 5 à 10 jours ouvrables après validation de votre commande. Pour les commandes urgentes ou les volumes importants, contactez-nous pour un calendrier adapté.",
  },
  {
    q: "Peut-on personnaliser les coffrets avec notre logo ?",
    a: "Absolument. Nous intégrons votre logo, vos couleurs et un message personnalisé sur le packaging et les cartes de vœux. Dès 10 coffrets, le branding est inclus.",
  },
  {
    q: "Livrez-vous en multi-sites ou au domicile ?",
    a: "Oui, c'est notre spécialité. Livraison individuelle à domicile, sur site ou multi-sites. Nous gérons la logistique de bout en bout, y compris pour les collaborateurs en télétravail.",
  },
  {
    q: "À partir de combien de coffrets peut-on commander ?",
    a: "Dès 1 coffret. Les tarifs dégressifs s'appliquent à partir de 10 coffrets. Pour les volumes supérieurs à 50 unités, nous proposons des conditions préférentielles sur devis.",
  },
];

function FAQItem({ q, a, index, highlighted }: { q: string; a: string; index: number; highlighted?: boolean }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    if (!contentRef.current || !itemRef.current) return;
    const willOpen = !open;
    setOpen(willOpen);

    if (willOpen) {
      // Measure natural height
      contentRef.current.style.height = "auto";
      const h = contentRef.current.scrollHeight;
      contentRef.current.style.height = "0px";

      gsap.to(contentRef.current, {
        height: h, opacity: 1,
        duration: 0.5, ease: "power3.out",
      });
      gsap.to(itemRef.current.querySelector(".faq-icon"), {
        rotation: 45, scale: 0.9,
        duration: 0.35, ease: "back.out(1.7)",
      });
      gsap.to(itemRef.current, {
        background: "#F3F0E8",
        boxShadow: "0 8px 32px rgba(45,74,62,0.06)",
        duration: 0.3,
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0, opacity: 0,
        duration: 0.35, ease: "power2.in",
      });
      gsap.to(itemRef.current.querySelector(".faq-icon"), {
        rotation: 0, scale: 1,
        duration: 0.3, ease: "power2.out",
      });
      gsap.to(itemRef.current, {
        background: "transparent",
        boxShadow: "0 0px 0px rgba(45,74,62,0)",
        duration: 0.3,
      });
    }
  }, [open]);

  return (
    <div
      ref={itemRef}
      className="faq-item"
      style={{
        borderRadius: "16px",
        padding: "0 24px",
        transition: "background 0.3s ease",
        cursor: "pointer",
        ...(highlighted ? {
          background: "rgba(45,74,62,0.04)",
          border: "1px solid rgba(45,74,62,0.1)",
          marginTop: "4px",
          marginBottom: "4px",
        } : {}),
      }}
      onClick={toggle}
    >
      {/* Question */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "22px 0",
        }}
      >
        {/* Number */}
        <span style={{
          fontFamily: "var(--font-manrope)",
          fontWeight: 800,
          fontSize: "0.75rem",
          color: "var(--sage)",
          flexShrink: 0,
          width: "28px",
          letterSpacing: "-0.02em",
        }}>
          {String(index + 1).padStart(2, "0")}
        </span>

        <span style={{
          flex: 1,
          fontFamily: "var(--font-manrope)",
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "var(--text-dark)",
          lineHeight: 1.45,
        }}>
          {q}
        </span>

        <div
          className="faq-icon"
          style={{
            flexShrink: 0,
            width: "32px", height: "32px",
            borderRadius: "50%",
            border: "1.5px solid rgba(135,163,141,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--sage)",
            transition: "border-color 0.3s ease",
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
        </div>
      </div>

      {/* Answer — collapsed */}
      <div
        ref={contentRef}
        style={{
          height: 0,
          opacity: 0,
          overflow: "hidden",
        }}
      >
        <div style={{
          paddingBottom: "22px",
          paddingLeft: "44px",
        }}>
          <p style={{
            fontSize: "0.88rem",
            color: "var(--text-mid)",
            lineHeight: 1.75,
            maxWidth: "560px",
          }}>
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection({ content }: { content?: FAQContent }) {
  const items = content?.items ?? DEFAULT_FAQS;
  const sectionLabel = content?.label ?? "FAQ";
  const sectionTitle = content?.title ?? "Questions fréquentes";
  const sectionSubtitle = content?.subtitle ?? "Tout ce que les RH et CSE nous demandent avant de commander.";
  const sectionImage = content?.image ?? "/uploads/5.1.png";
  const ctaText = content?.ctaText ?? "Demander un devis";
  const ctaHref = content?.ctaHref ?? "#devis";
  const ctaAdditionalText = content?.ctaAdditionalText ?? "Une autre question ?";

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // On mobile, show everything instantly — no scroll animations
    if (window.innerWidth < 900) {
      gsap.set(sectionRef.current.querySelectorAll(".faq-line, .faq-title, .faq-subtitle, .faq-item, .faq-divider, .faq-image, .faq-cta"), { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)", scaleX: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Section line grows
      gsap.fromTo(".faq-line", {
        scaleX: 0,
      }, {
        scaleX: 1,
        duration: 0.8, ease: ease.enter,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" },
      });

      // Title
      gsap.fromTo(".faq-title", {
        opacity: 0, y: distance.md, filter: "blur(4px)",
      }, {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: duration.reveal, ease: ease.enter,
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%", toggleActions: "play none none none" },
      });

      // Subtitle
      gsap.fromTo(".faq-subtitle", {
        opacity: 0, y: distance.sm,
      }, {
        opacity: 1, y: 0,
        duration: duration.enter, ease: ease.enter, delay: 0.15,
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%", toggleActions: "play none none none" },
      });

      // FAQ items — staggered reveal with slight scale
      gsap.fromTo(".faq-item", {
        opacity: 0, y: distance.sm, scale: 0.98,
      }, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.5, ease: ease.enter,
        stagger: 0.07,
        scrollTrigger: { trigger: ".faq-list", start: "top 80%", toggleActions: "play none none none" },
      });

      // Dividers fade in
      gsap.fromTo(".faq-divider", {
        scaleX: 0, opacity: 0,
      }, {
        scaleX: 1, opacity: 1,
        duration: 0.4, ease: ease.enter,
        stagger: 0.05, delay: 0.2,
        scrollTrigger: { trigger: ".faq-list", start: "top 80%", toggleActions: "play none none none" },
      });

      // Image
      gsap.fromTo(".faq-image", {
        opacity: 0, scale: 0.95, y: distance.md,
      }, {
        opacity: 1, scale: 1, y: 0,
        duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%", toggleActions: "play none none none" },
      });

      // Image parallax
      gsap.to(".faq-img-inner", {
        y: -20,
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });

      // CTA
      gsap.fromTo(".faq-cta", {
        opacity: 0, y: distance.sm,
      }, {
        opacity: 1, y: 0,
        duration: 0.5, ease: ease.enter, delay: 0.4,
        scrollTrigger: { trigger: ".faq-cta", start: "top 90%", toggleActions: "play none none none" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      style={{
        padding: "80px 0 80px",
        background: "var(--cream-dark)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .faq-grid { grid-template-columns: 1fr !important; }
          .faq-image { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
        <div className="faq-grid" style={{
          display: "grid",
          gridTemplateColumns: "0.6fr 1fr",
          gap: "56px",
          alignItems: "start",
        }}>
          {/* LEFT: Image */}
          <div className="faq-image" style={{ position: "sticky", top: "100px" }}>
            <div style={{
              borderRadius: "24px",
              overflow: "hidden",
              position: "relative",
              height: "440px",
              boxShadow: "0 24px 64px rgba(45,74,62,0.1)",
            }}>
              <Image
                src={sectionImage}
                alt="Coffret O'Méa CSE"
                fill
                className="faq-img-inner"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          {/* RIGHT: Header + FAQ list */}
          <div>
            {/* Header */}
            <div style={{ marginBottom: "40px" }}>
              <div style={{
                display: "flex", alignItems: "center",
                gap: "12px", marginBottom: "24px",
              }}>
                <div className="faq-line" style={{
                  width: "32px", height: "1px",
                  background: "rgba(45,74,62,0.12)",
                  transformOrigin: "right center",
                }} />
                <span style={{
                  fontSize: "0.7rem", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "var(--text-light)", fontFamily: "var(--font-manrope)",
                }}>
                  {sectionLabel}
                </span>
              </div>

              <h2 className="faq-title" style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
                fontWeight: 800, letterSpacing: "-0.03em",
                color: "var(--text-dark)", lineHeight: 1.15,
                marginBottom: "12px",
              }}>
                {sectionTitle}
              </h2>
              <p className="faq-subtitle" style={{
                fontSize: "1rem", color: "var(--text-mid)",
                lineHeight: 1.65, maxWidth: "460px", fontWeight: 400,
              }}>
                {sectionSubtitle}
              </p>
            </div>

            {/* FAQ list */}
            <div className="faq-list" style={{
              display: "flex", flexDirection: "column",
            }}>
              {items.map((faq, i) => (
                <div key={faq.q}>
                  {i > 0 && (
                    <div className="faq-divider" style={{
                      height: "1px",
                      background: "rgba(135,163,141,0.1)",
                      margin: "0 24px",
                      transformOrigin: "left center",
                    }} />
                  )}
                  <FAQItem q={faq.q} a={faq.a} index={i} highlighted={faq.q.includes("URSSAF")} />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="faq-cta" style={{
              marginTop: "40px",
              display: "flex", alignItems: "center", gap: "16px",
            }}>
              <a
                href={ctaHref}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "13px 24px",
                  background: "var(--green-deep)", color: "white",
                  borderRadius: "999px",
                  fontFamily: "var(--font-manrope)", fontWeight: 700,
                  fontSize: "0.85rem", textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(45,74,62,0.15)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--green-darker)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(45,74,62,0.22)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--green-deep)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(45,74,62,0.15)";
                }}
              >
                {ctaText}
                <ArrowRight size={14} />
              </a>
              <a href="mailto:pro@o-mea.fr" style={{
                fontSize: "0.82rem", color: "var(--text-mid)", fontWeight: 600,
                textDecoration: "none", transition: "color 0.2s ease",
                borderBottom: "1px solid rgba(135,163,141,0.3)",
                paddingBottom: "2px",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--green-deep)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-light)"; }}
              >
                {ctaAdditionalText}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
