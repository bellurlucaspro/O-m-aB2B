"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronRight, ArrowRight, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { gsap, ease as gsapEase, duration as gsapDuration } from "@/lib/motion";

export default function Navbar({ bannerOffset = 0 }: { bannerOffset?: number }) {
  const [currentBannerOffset, setCurrentBannerOffset] = useState(bannerOffset);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const links = [
    { label: "Engagements", href: "/#pourquoi" },
    { label: "Impact RH", href: "/#impact" },
    { label: "Coffrets", href: "/#produits" },
    { label: "Processus", href: "/#processus" },
    { label: "À propos", href: "/a-propos" },
  ];

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
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });

    const sectionIds = links
      .map((l) => l.href.replace("/#", ""))
      .filter((id) => !id.startsWith("/"));

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection("/#" + entry.target.id);
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

  useEffect(() => {
    if (!menuOpen || !mobileMenuRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(mobileMenuRef.current,
        { opacity: 0, y: -10, height: 0 },
        { opacity: 1, y: 0, height: "auto", duration: gsapDuration.state, ease: gsapEase.snap }
      );
      gsap.fromTo(
        mobileMenuRef.current!.querySelectorAll("a, button"),
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: gsapDuration.state, ease: gsapEase.enter, stagger: 0.04, delay: 0.08 }
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
      }}
    >
      <style>{`
        .nav-main {
          background: rgba(45, 74, 62, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          position: relative;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-main.compact {
          background: rgba(45, 74, 62, 0.98);
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }

        .nav-inner {
          display: flex;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 36px;
          height: 64px;
          transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-main.compact .nav-inner {
          height: 54px;
        }

        /* Logo — left */
        .nav-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          margin-right: 40px;
          flex-shrink: 0;
        }
        .nav-logo img {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Center: links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .nav-a {
          position: relative;
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(250, 247, 242, 0.55);
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: all 0.25s ease;
          padding: 7px 14px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .nav-a:hover {
          color: rgba(250, 247, 242, 0.9);
          background: rgba(250, 247, 242, 0.06);
        }
        .nav-a.active {
          color: rgba(250, 247, 242, 1);
          background: rgba(250, 247, 242, 0.1);
          font-weight: 600;
        }

        /* Right: actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .nav-icon-btn {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(250,247,242,0.5);
          background: rgba(250,247,242,0.06);
          border: 1px solid rgba(250,247,242,0.08);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-icon-btn:hover {
          color: white;
          background: rgba(250,247,242,0.12);
          border-color: rgba(250,247,242,0.15);
          transform: translateY(-1px);
        }

        .nav-divider {
          width: 1px; height: 24px;
          background: rgba(250,247,242,0.1);
          margin: 0 6px;
        }

        .nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--green-deep);
          text-decoration: none;
          padding: 9px 20px;
          background: var(--pink);
          border-radius: 999px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }
        .nav-cta:hover {
          background: var(--cream);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255,255,255,0.15);
        }
        .nav-cta svg {
          transition: transform 0.3s ease;
        }
        .nav-cta:hover svg {
          transform: translateX(3px);
        }

        /* Burger */
        .nav-burger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--cream);
          padding: 6px;
          border-radius: 8px;
          transition: background 0.2s ease;
        }
        .nav-burger:hover {
          background: rgba(250, 247, 242, 0.1);
        }

        @media (max-width: 960px) {
          .nav-inner { padding: 0 20px; height: 56px; }
          .nav-main.compact .nav-inner { height: 50px; }
          .nav-links { display: none; }
          .nav-actions.desktop { display: none; }
          .nav-logo { margin-right: auto; }
          .nav-burger { display: flex; align-items: center; justify-content: center; }
        }

        /* Mobile menu */
        .nav-mobile {
          background: rgba(45, 74, 62, 0.98);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(250, 247, 242, 0.06);
          padding: 16px 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav-mobile-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'Manrope', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: rgba(250, 247, 242, 0.7);
          text-decoration: none;
          padding: 14px 12px;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .nav-mobile-link:hover,
        .nav-mobile-link.active {
          color: rgba(250, 247, 242, 1);
          background: rgba(250, 247, 242, 0.06);
        }
        .nav-mobile-link.active {
          color: var(--pink);
        }
        .nav-mobile-cta {
          margin-top: 12px;
          padding: 16px;
          background: var(--pink);
          color: var(--green-deep);
          border-radius: 14px;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          text-align: center;
          display: block;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          width: 100%;
        }
        .nav-mobile-cta:hover {
          background: var(--pink-light);
        }
      `}</style>

      <div className={`nav-main${scrolled ? " compact" : ""}`}>
        <div className="nav-inner">
          {/* Logo */}
          <a href="/" className="nav-logo">
            <Image
              src="/Omea LOGO B2B.png"
              alt="O'Méa"
              width={180}
              height={60}
              style={{
                height: scrolled ? "30px" : "36px",
                width: "auto",
                objectFit: "contain",
              }}
              priority
            />
          </a>

          {/* Links */}
          <nav className="nav-links">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`nav-a${activeSection === l.href ? " active" : ""}`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="nav-actions desktop">
            <a href="mailto:pro@o-mea.fr" aria-label="Email" className="nav-icon-btn">
              <Mail size={15} />
            </a>
            <a href="https://wa.me/33756971031" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="nav-icon-btn">
              <Phone size={15} />
            </a>
            <div className="nav-divider" />
            <a href="/#devis" className="nav-cta">
              Devis gratuit
              <ArrowRight size={13} strokeWidth={2.5} />
            </a>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nav-burger"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div ref={mobileMenuRef} className="nav-mobile">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`nav-mobile-link${activeSection === l.href ? " active" : ""}`}
            >
              {l.label}
              <ChevronRight size={16} strokeWidth={2} style={{ opacity: 0.3 }} />
            </a>
          ))}
          <a
            href="/#devis"
            onClick={() => setMenuOpen(false)}
            className="nav-mobile-cta"
          >
            Demander un devis
          </a>
        </div>
      )}
    </header>
  );
}
