"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { gsap, ease as gsapEase, duration as gsapDuration } from "@/lib/motion";

export default function Navbar({ bannerOffset = 0 }: { bannerOffset?: number }) {
  const [currentBannerOffset, setCurrentBannerOffset] = useState(bannerOffset);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const links = [
    { label: "Nos engagements", href: "/#pourquoi" },
    { label: "Impact RH", href: "/#impact" },
    { label: "Nos coffrets", href: "/#produits" },
    { label: "Sur-mesure", href: "/#personnalisation" },
    { label: "\À propos", href: "/a-propos" },
  ];

  // Watch for banner dismiss
  useEffect(() => {
    if (bannerOffset === 0) return;
    const observer = new MutationObserver(() => {
      const banner = document.querySelector("[data-announcement-banner]");
      setCurrentBannerOffset(banner ? bannerOffset : 0);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [bannerOffset]);

  useEffect(() => {
    const NAV_HEIGHT = 80;

    const checkDarkSection = () => {
      const darkSections = document.querySelectorAll("[data-dark-bg]");
      let dark = false;
      darkSections.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= NAV_HEIGHT && rect.bottom >= 0) dark = true;
      });
      setIsDark(dark);
    };

    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      checkDarkSection();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    checkDarkSection();

    // Active section tracking (only on homepage)
    const sectionIds = links
      .map((l) => l.href.replace("/#", ""))
      .filter((id) => !id.startsWith("/"));

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection("/#" + entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observerRef.current?.disconnect();
    };
  }, []);

  // GSAP mobile menu animation
  useEffect(() => {
    if (!menuOpen || !mobileMenuRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(mobileMenuRef.current,
        { opacity: 0, y: -10, height: 0 },
        { opacity: 1, y: 0, height: "auto", duration: gsapDuration.state, ease: gsapEase.snap }
      );
      gsap.fromTo(
        mobileMenuRef.current!.querySelectorAll("a"),
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: gsapDuration.state, ease: gsapEase.enter, stagger: 0.05, delay: 0.1 }
      );
    });
    return () => ctx.revert();
  }, [menuOpen]);

  return (
    <header
      style={{
        position: "fixed",
        top: currentBannerOffset,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.35s ease",
        background: scrolled ? "rgba(250,247,242,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(135,163,141,0.15)" : "none",
        padding: scrolled ? "14px 0" : "22px 0",
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .mobile-cta { display: none !important; }
          .burger-btn { display: flex !important; }
        }
        .nav-link {
          position: relative;
          font-family: var(--font-inter);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-dark);
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.2s ease;
          padding-bottom: 3px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: var(--green-deep);
          transition: width 0.25s ease;
          border-radius: 2px;
        }
        .nav-link:hover {
          color: var(--green-deep) !important;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .nav-link.active {
          color: var(--green-deep) !important;
          font-weight: 600;
        }
        .nav-link.active::after {
          width: 100%;
        }
        .nav-link-page {
          opacity: 0.75;
        }
        .nav-link-page:hover {
          opacity: 1;
        }
        .cta-outline {
          font-family: var(--font-manrope);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--green-deep);
          text-decoration: none;
          padding: 9px 18px;
          border: 1.5px solid rgba(45,74,62,0.2);
          border-radius: 999px;
          transition: all 0.2s ease;
        }
        .cta-outline:hover {
          background: var(--green-deep) !important;
          color: white !important;
          border-color: var(--green-deep) !important;
        }
        .cta-solid {
          font-family: var(--font-manrope);
          font-size: 0.82rem;
          font-weight: 700;
          color: white;
          text-decoration: none;
          padding: 10px 22px;
          background: var(--green-deep);
          border-radius: 999px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(45,74,62,0.25);
        }
        .cta-solid:hover {
          background: var(--green-darker) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(45,74,62,0.3);
        }
      `}</style>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a href="#" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Image
            src="/Omea LOGO B2B.png"
            alt="O'M\éa"
            width={160}
            height={56}
            style={{ height: "40px", width: "auto", objectFit: "contain" }}
            priority
          />
        </a>

        {/* Desktop nav */}
        <nav
          style={{ display: "flex", alignItems: "center", gap: "28px" }}
          className="hidden-mobile"
        >
          {links.map((l, i) => (
            <React.Fragment key={l.href}>
              {i === links.length - 1 && (
                <span
                  style={{
                    width: "1px",
                    height: "16px",
                    background: "rgba(135,163,141,0.35)",
                    display: "block",
                  }}
                />
              )}
              <a
                href={l.href}
                className={`nav-link${activeSection === l.href ? " active" : ""}${!l.href.includes("#") ? " nav-link-page" : ""}`}
              >
                {l.label}
              </a>
            </React.Fragment>
          ))}
        </nav>

        {/* CTA */}
        <div
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
          className="mobile-cta"
        >
          <a href="/#devis" className="cta-outline">
            Demander un devis
          </a>
          <a href="/#produits" className="cta-solid">
            Voir les offres
          </a>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-dark)",
          }}
          className="burger-btn"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          ref={mobileMenuRef}
          style={{
            background: "var(--cream)",
            borderTop: "1px solid var(--cream-dark)",
            padding: "24px 32px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            overflow: "hidden",
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: "1.1rem",
                fontWeight: activeSection === l.href ? 700 : 600,
                color: activeSection === l.href ? "var(--green-deep)" : "var(--text-dark)",
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#devis"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: "8px",
              padding: "14px",
              background: "var(--green-deep)",
              color: "white",
              borderRadius: "12px",
              fontFamily: "var(--font-manrope)",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Demander un devis
          </a>
        </div>
      )}
    </header>
  );
}
