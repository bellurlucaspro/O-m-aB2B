"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  duration,
  ease,
  distance,
  stagger,
  scale,
  scrollDefaults,
  preset,
} from "./tokens";

// Enregistrement unique de ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Détection reduced-motion ──────────────────────────────
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ─── Détection mobile ──────────────────────────────────────
function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

// ─── Types ─────────────────────────────────────────────────
type MotionPreset = keyof typeof preset;

interface ScrollRevealOptions {
  /** Preset d'animation à utiliser */
  preset?: MotionPreset;
  /** Sélecteur CSS des enfants à animer en stagger (optionnel) */
  children?: string;
  /** Type de stagger */
  staggerSpeed?: "fast" | "default" | "slow";
  /** Délai avant le début de l'animation */
  delay?: number;
  /** Point de déclenchement ScrollTrigger */
  start?: string;
  /** Désactiver sur mobile */
  desktopOnly?: boolean;
  /** Custom from vars (override preset) */
  fromVars?: gsap.TweenVars;
  /** Custom to vars (override preset) */
  toVars?: gsap.TweenVars;
}

// ─── Hook principal : useScrollReveal ──────────────────────
/**
 * Hook GSAP pour les animations déclenchées au scroll.
 * Respecte reduced-motion et les contraintes mobile.
 *
 * @example
 * ```tsx
 * const ref = useScrollReveal({ preset: "fadeInUp" });
 * return <div ref={ref}>...</div>;
 * ```
 *
 * @example Avec stagger sur les enfants
 * ```tsx
 * const ref = useScrollReveal({
 *   preset: "fadeInUp",
 *   children: ".card",
 *   staggerSpeed: "default"
 * });
 * return <div ref={ref}>{cards.map(...)}</div>;
 * ```
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion : afficher directement sans animation
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" });
      if (options.children) {
        gsap.set(el.querySelectorAll(options.children), {
          opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)",
        });
      }
      return;
    }

    // Desktop-only : skip sur mobile
    if (options.desktopOnly && isMobile()) {
      gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" });
      return;
    }

    const presetName = options.preset || "fadeInUp";
    const p = preset[presetName];

    // Éléments cibles
    const targets = options.children
      ? el.querySelectorAll(options.children)
      : el;

    // "from" state
    const fromVars: gsap.TweenVars = {
      ...("from" in p ? p.from : {}),
      ...options.fromVars,
    };

    // "to" state
    const toVars: gsap.TweenVars = {
      ...("to" in p ? p.to : {}),
      ...options.toVars,
      delay: options.delay || 0,
      scrollTrigger: {
        trigger: el,
        start: options.start || scrollDefaults.start,
        toggleActions: scrollDefaults.toggleActions,
      },
    };

    // Stagger si on anime des enfants
    if (options.children && options.staggerSpeed) {
      toVars.stagger = stagger[options.staggerSpeed];
    }

    // Animation
    const ctx = gsap.context(() => {
      gsap.fromTo(targets, fromVars, toVars);
    }, el);

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── Hook : useFloat ───────────────────────────────────────
/**
 * Animation de flottement continu pour les éléments décoratifs.
 * Respecte reduced-motion (pas d'animation).
 * Sur mobile, l'amplitude est réduite de 50%.
 */
export function useFloat<T extends HTMLElement = HTMLDivElement>(
  customDuration?: number
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const mobile = isMobile();
    const amplitude = mobile ? distance.float * 0.5 : distance.float;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: -amplitude,
        rotation: mobile ? 0 : 1,
        duration: customDuration || duration.loop,
        ease: ease.organic,
        repeat: -1,
        yoyo: true,
      });
    }, el);

    return () => ctx.revert();
  }, [customDuration]);

  return ref;
}

// ─── Hook : useCounter ─────────────────────────────────────
/**
 * Compteur animé qui s'incrémente au scroll.
 * Utilise GSAP pour un easing premium (vs setInterval linéaire).
 */
export function useCounter(
  endValue: number,
  opts?: { suffix?: string; duration?: number; decimals?: number }
) {
  const ref = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = `${endValue}${opts?.suffix || ""}`;
      return;
    }

    const obj = { value: 0 };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        value: endValue,
        duration: opts?.duration || duration.count,
        ease: ease.enter,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        onUpdate() {
          if (hasAnimated.current) return;
          const formatted = opts?.decimals
            ? obj.value.toFixed(opts.decimals)
            : Math.round(obj.value).toString();
          el.textContent = `${formatted}${opts?.suffix || ""}`;
        },
        onComplete() {
          hasAnimated.current = true;
          el.textContent = `${
            opts?.decimals ? endValue.toFixed(opts.decimals) : endValue
          }${opts?.suffix || ""}`;
        },
      });
    });

    return () => ctx.revert();
  }, [endValue, opts?.suffix, opts?.duration, opts?.decimals]);

  return ref;
}

// ─── Hook : useParallax ────────────────────────────────────
/**
 * Parallax léger au scroll — desktop uniquement.
 * speed : positif = plus lent que le scroll, négatif = plus rapide
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.15
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isMobile()) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: () => speed * 100,
        ease: ease.linear,
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

// ─── Hook : useStaggerReveal ───────────────────────────────
/**
 * Variante simplifiée : anime directement tous les enfants
 * correspondant au sélecteur avec un stagger.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  selector: string,
  options?: {
    staggerSpeed?: "fast" | "default" | "slow";
    delay?: number;
    desktopOnly?: boolean;
  }
) {
  return useScrollReveal<T>({
    preset: "fadeInUp",
    children: selector,
    staggerSpeed: options?.staggerSpeed || "default",
    delay: options?.delay,
    desktopOnly: options?.desktopOnly,
  });
}

// ─── Hook : useHoverLift ───────────────────────────────────
/**
 * Retourne des handlers onMouseEnter/onMouseLeave pour un hover GSAP.
 * Plus fluide que les transitions CSS pour les éléments interactifs premium.
 */
export function useHoverLift<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  const onEnter = useCallback(() => {
    if (!ref.current || prefersReducedMotion()) return;
    gsap.to(ref.current, {
      y: -distance.xs,
      scale: scale.hover,
      boxShadow: "0 12px 40px rgba(45, 74, 62, 0.12)",
      duration: duration.micro,
      ease: ease.snap,
    });
  }, []);

  const onLeave = useCallback(() => {
    if (!ref.current || prefersReducedMotion()) return;
    gsap.to(ref.current, {
      y: 0,
      scale: 1,
      boxShadow: "0 2px 8px rgba(45, 74, 62, 0.06)",
      duration: duration.state,
      ease: ease.enter,
    });
  }, []);

  return { ref, onMouseEnter: onEnter, onMouseLeave: onLeave };
}

// ─── Utilitaire : timeline de section ──────────────────────
/**
 * Crée une timeline GSAP avec ScrollTrigger pour orchestrer
 * une séquence d'animations dans une section.
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const tl = createSectionTimeline(sectionRef.current!);
 *   tl.from(".title", { opacity: 0, y: 24 })
 *     .from(".cards", { opacity: 0, y: 24, stagger: 0.1 }, "-=0.3")
 *     .from(".cta", { opacity: 0, y: 16 }, "-=0.2");
 *   return () => tl.scrollTrigger?.kill();
 * }, []);
 * ```
 */
export function createSectionTimeline(
  trigger: HTMLElement,
  options?: { start?: string }
): gsap.core.Timeline {
  return gsap.timeline({
    scrollTrigger: {
      trigger,
      start: options?.start || scrollDefaults.start,
      toggleActions: scrollDefaults.toggleActions,
    },
    defaults: {
      duration: duration.enter,
      ease: ease.enter,
    },
  });
}

// Re-export des tokens pour usage direct
export { duration, ease, distance, stagger, scale, scrollDefaults, preset };
export { gsap, ScrollTrigger };
