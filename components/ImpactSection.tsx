"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Heart, TrendingUp, Shield, Smile, Users, Award } from "lucide-react";
import { gsap, ScrollTrigger, ease, useCounter } from "@/lib/motion";
import type { ImpactContent } from "@/lib/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  Heart: <Heart size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  Shield: <Shield size={20} />,
  Smile: <Smile size={20} />,
  Users: <Users size={20} />,
  Award: <Award size={20} />,
};

const COLOR_MAP: Record<string, string> = {
  Heart: "var(--sage)", Smile: "var(--sage)",
  TrendingUp: "var(--green-deep)", Users: "var(--green-deep)",
  Shield: "#B8744A", Award: "#B8744A",
};

function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useCounter(value, { suffix });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 900);
  }, []);

  // On mobile, ScrollTrigger isn't registered so useCounter stays at 0.
  // Display the final value directly instead.
  if (isMobile) {
    return <span>{prefix}{value}{suffix}</span>;
  }

  return <span>{prefix}<span ref={ref}>0{suffix}</span></span>;
}

/* ─── Data ─── */
const stats = [
  { value: 50, prefix: "+", suffix: "", label: "Entreprises" },
  { value: 98, prefix: "", suffix: "%", label: "Satisfaction" },
  { value: 100, prefix: "", suffix: "%", label: "Made in France" },
];

const impacts = [
  { icon: <Heart size={20} />, title: "Améliorez la QVT", desc: "Un geste tangible aux moments clés de la vie de vos collaborateurs.", color: "var(--sage)" },
  { icon: <TrendingUp size={20} />, title: "Fidélisez vos talents", desc: "Taux de rétention 40% supérieur pour les entreprises qui célèbrent les moments de vie.", badge: "+40%", color: "var(--green-deep)" },
  { icon: <Shield size={20} />, title: "Renforcez votre RSE", desc: "Produits naturels, artisans français. Des données concrètes pour vos rapports.", color: "#B8744A" },
];

const images = [
  { src: "/RH%20cadeau%20maternit%C3%A9.JPG", alt: "RH offrant un coffret" },
  { src: "/uploads/femme-enceinte-travail.webp", alt: "Femme enceinte au travail" },
];

export default function ImpactSection({ content }: { content?: ImpactContent }) {
  const ref = useRef<HTMLElement>(null);
  const [imgIdx, setImgIdx] = useState(0);

  // Parse CMS sectionTitle: "Text <accent>highlighted</accent>"
  const rawTitle = content?.sectionTitle ?? "Un investissement RH qui <accent>se mesure</accent>";
  const titleMatch = rawTitle.match(/^(.*?)<accent>(.*?)<\/accent>(.*)$/);
  const titleBefore = titleMatch ? titleMatch[1] : rawTitle;
  const titleAccent = titleMatch ? titleMatch[2] : "";
  const titleAfter = titleMatch ? titleMatch[3] : "";

  const subtitle = content?.subtitle ?? "Chaque coffret est un signal fort : ici, on prend soin de vous. L'impact sur l'engagement et la rétention est réel et documentable.";

  // CMS stats → Counter-compatible format
  const cmsStats = content?.stats?.map(s => {
    const numMatch = s.value.match(/^([+]?)(\d+)(%?)$/);
    return {
      value: numMatch ? parseInt(numMatch[2]) : 0,
      prefix: numMatch ? numMatch[1] : "",
      suffix: numMatch ? numMatch[3] : "",
      label: s.label,
      raw: s.value,
      isNumeric: !!numMatch,
    };
  });
  const displayStats = cmsStats ?? stats.map(s => ({ ...s, raw: `${s.prefix}${s.value}${s.suffix}`, isNumeric: true }));

  // CMS impact cards
  const descItems = Array.isArray(content?.description) ? content.description : [];
  const displayImpacts = descItems.length > 0
    ? descItems.map(d => ({
        icon: ICON_MAP[d.iconName] ?? <Heart size={20} />,
        title: d.title,
        desc: d.desc,
        badge: (d as unknown as Record<string, string>).highlight || undefined,
        color: COLOR_MAP[d.iconName] ?? "var(--sage)",
      }))
    : impacts;

  // Auto-slide images
  useEffect(() => {
    const t = setInterval(() => setImgIdx((p) => (p + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, []);

  // GSAP
  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // On mobile, show everything instantly — no scroll animations
    if (window.innerWidth < 900) {
      gsap.set(ref.current.querySelectorAll(".imp-tag, .imp-h2, .imp-card, .imp-stat, .imp-photo"), { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Pin left column while right scrolls
      ScrollTrigger.create({
        trigger: ".imp-pinned",
        start: "top 80px",
        end: () => {
          const rightCol = document.querySelector(".imp-right") as HTMLElement;
          return rightCol ? `+=${rightCol.scrollHeight - window.innerHeight + 160}` : "+=800";
        },
        pin: true,
        pinSpacing: false,
      });

      // Right column elements entrance
      gsap.fromTo(".imp-tag", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: ease.enter,
        scrollTrigger: { trigger: ".imp-tag", start: "top 85%", toggleActions: "play none none none" } });

      gsap.fromTo(".imp-h2", { opacity: 0, y: 24, filter: "blur(3px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: ease.enter,
        scrollTrigger: { trigger: ".imp-h2", start: "top 85%", toggleActions: "play none none none" } });

      gsap.fromTo(".imp-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: ease.enter,
        scrollTrigger: { trigger: ".imp-card-wrap", start: "top 85%", toggleActions: "play none none none" } });

      // Photo parallax
      gsap.to(".imp-photo", { y: -30, scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });

      // Stat cards pop
      gsap.fromTo(".imp-stat", { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: "back.out(1.3)",
        scrollTrigger: { trigger: ".imp-stats-row", start: "top 85%", toggleActions: "play none none none" } });
    }, ref);

    return () => ctx.revert();
  }, []);


  return (
    <section id="impact" ref={ref} style={{ background: "var(--cream)", position: "relative", overflow: "hidden" }}>
      <style>{`
        .imp-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 32px;
          align-items: start;
        }
        .imp-impact-card {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 16px 20px; border-radius: 14px;
          border: 1px solid rgba(135,163,141,0.1); background: white;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .imp-impact-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(45,74,62,0.08);
          border-color: rgba(135,163,141,0.22);
        }
        @media (max-width: 900px) {
          .imp-layout { grid-template-columns: 1fr !important; gap: 40px !important; padding: 48px 20px !important; }
          .imp-pinned { position: relative !important; top: auto !important; }
        }
      `}</style>

      <div className="imp-layout">
        {/* ════ LEFT: Pinned photo + stats ════ */}
        <div className="imp-pinned" style={{ paddingTop: "32px" }}>
          {/* Photo */}
          <div style={{
            borderRadius: "24px", overflow: "hidden",
            position: "relative", height: "440px",
            boxShadow: "0 24px 64px rgba(45,74,62,0.12)",
          }}>
            {images.map((img, i) => (
              <Image key={img.src} src={img.src} alt={img.alt} fill className="imp-photo"
                style={{ objectFit: "cover", opacity: imgIdx === i ? 1 : 0, transition: "opacity 0.8s ease" }}
                priority={i === 0} />
            ))}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
              background: "linear-gradient(transparent, rgba(0,0,0,0.25))", zIndex: 1,
            }} />
          </div>

          {/* Stats row — overlapping photo */}
          <div className="imp-stats-row" style={{
            display: "flex", gap: "10px",
            margin: "-32px 16px 0", position: "relative", zIndex: 2,
          }}>
            {displayStats.map((s, i) => (
              <div key={i} className="imp-stat" style={{
                flex: 1, background: "white", borderRadius: "16px",
                padding: "18px 14px", textAlign: "center",
                boxShadow: "0 8px 32px rgba(45,74,62,0.1)",
                border: "1px solid rgba(135,163,141,0.08)",
              }}>
                <div style={{
                  fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                  fontSize: "1.6rem", color: "var(--green-deep)",
                  letterSpacing: "-0.03em", lineHeight: 1,
                }}>
                  {s.isNumeric ? <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} /> : <span>{s.raw}</span>}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-mid)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "6px", fontFamily: "'Manrope', sans-serif" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ RIGHT: Impact + Testimonials (scrolls) ════ */}
        <div className="imp-right">
          {/* ── Impact RH block ── */}
          <span className="imp-tag" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sage)", marginBottom: "20px", display: "inline-block" }}>Impact RH</span>
          <h2 className="imp-h2" style={{
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            fontWeight: 800, letterSpacing: "-0.03em",
            color: "var(--text-dark)", marginTop: "16px", marginBottom: "16px", lineHeight: 1.15,
          }}>
            {titleBefore}
            {titleAccent && <span style={{ color: "var(--green-deep)" }}>{titleAccent}</span>}
            {titleAfter}
          </h2>
          <p style={{
            fontSize: "1.02rem", color: "var(--text-mid)",
            lineHeight: 1.7, maxWidth: "460px", marginBottom: "28px",
          }}>
            {subtitle}
          </p>

          {/* Impact cards */}
          <div className="imp-card-wrap" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
            {displayImpacts.map((c) => (
              <div key={c.title} className="imp-card imp-impact-card">
                <div style={{
                  flexShrink: 0, width: "42px", height: "42px", borderRadius: "12px",
                  background: `color-mix(in srgb, ${c.color} 18%, transparent)`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: c.color,
                  boxShadow: `0 2px 8px color-mix(in srgb, ${c.color} 15%, transparent)`,
                }}>
                  {c.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.02rem", color: "var(--text-dark)", letterSpacing: "-0.01em" }}>{c.title}</h3>
                    {c.badge && <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--green-deep)", background: "rgba(135,163,141,0.1)", padding: "2px 8px", borderRadius: "6px" }}>{c.badge}</span>}
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-mid)", lineHeight: 1.55 }}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <a href="#devis" style={{
            display: "inline-flex", alignItems: "center", gap: "9px",
            padding: "14px 24px", background: "var(--green-deep)",
            color: "white", borderRadius: "999px",
            fontFamily: "'Manrope', sans-serif", fontWeight: 700,
            fontSize: "0.88rem", textDecoration: "none",
            boxShadow: "0 8px 28px rgba(45,74,62,0.2)",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--green-darker)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--green-deep)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Demander un devis <ArrowRight size={14} />
          </a>
        </div>
      </div>

    </section>
  );
}
