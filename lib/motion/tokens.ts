/**
 * O'Méa Motion Design Tokens
 *
 * Grammaire de mouvement premium pour un univers B2B doux et artisanal.
 * Chaque token est nommé sémantiquement pour refléter son intention,
 * pas sa valeur technique.
 */

// ─── Durées ────────────────────────────────────────────────
// Organisées par intention, pas par milliseconde
export const duration = {
  /** Micro-interactions : hover, focus, toggle (instant feedback) */
  micro: 0.2,
  /** Transitions d'état : tab switch, accordion, boutons */
  state: 0.35,
  /** Entrées d'éléments : cards, textes, images (scroll-triggered) */
  enter: 0.6,
  /** Entrées majuscules : hero, sections entières, visuels larges */
  reveal: 0.8,
  /** Morph / crossfade entre états complexes */
  morph: 1.0,
  /** Compteurs animés */
  count: 1.8,
  /** Boucles continues (float, pulse) */
  loop: 7,
} as const;

// ─── Easings ───────────────────────────────────────────────
// GSAP string format — tous testés pour un rendu premium/organique
export const ease = {
  /** Entrées standard (scroll reveals) — départ vif, arrivée douce */
  enter: "power2.out",
  /** Sorties (éléments qui disparaissent) */
  exit: "power2.in",
  /** Interactions snappy (hover, click, accordion) — rebond contenu */
  snap: "power3.out",
  /** Mouvement organique/naturel (float, décorations) */
  organic: "sine.inOut",
  /** Rebond subtil pour les éléments ludiques (badges, compteurs) */
  bounce: "back.out(1.4)",
  /** Élastique léger pour les CTA et éléments d'attention */
  elastic: "elastic.out(1, 0.5)",
  /** Linéaire pour les marquees et progress bars */
  linear: "none",
} as const;

// ─── Distances ─────────────────────────────────────────────
// Amplitudes de déplacement en px — cohérentes sur tout le site
export const distance = {
  /** Micro-nudge : hover lift, icon scale feedback */
  xs: 4,
  /** Petit : stagger items, sous-éléments */
  sm: 12,
  /** Standard : fadeInUp pour cartes et textes */
  md: 24,
  /** Large : hero elements, visuels principaux */
  lg: 40,
  /** Float : amplitude de l'animation continue */
  float: 14,
} as const;

// ─── Stagger ───────────────────────────────────────────────
// Délais entre éléments d'un groupe (en secondes)
export const stagger = {
  /** Rapide : listes, badges, petits éléments */
  fast: 0.06,
  /** Standard : cartes, items de grille */
  default: 0.1,
  /** Lent : sections majeures, reveals séquentiels */
  slow: 0.15,
} as const;

// ─── Scale ─────────────────────────────────────────────────
export const scale = {
  /** État initial pour les entrées (légèrement réduit) */
  from: 0.96,
  /** Hover sur cartes (léger agrandissement) */
  hover: 1.03,
  /** Hover sur icônes/boutons */
  hoverIcon: 1.08,
} as const;

// ─── Blur ──────────────────────────────────────────────────
export const blur = {
  /** Léger flou d'entrée pour les éléments textuels */
  enter: 4,
  /** Flou de fond pour les modals */
  backdrop: 14,
} as const;

// ─── ScrollTrigger defaults ────────────────────────────────
export const scrollDefaults = {
  /** Trigger standard : déclenche quand 15% de l'élément est visible */
  start: "top 85%",
  /** Fin pour les animations pin (parallax) */
  end: "bottom 20%",
  /** Pas de scrub par défaut — les animations jouent une fois */
  toggleActions: "play none none none",
} as const;

// ─── Présets composés ──────────────────────────────────────
// Combinaisons prêtes à l'emploi pour les cas les plus fréquents

export const preset = {
  /** FadeInUp standard — utilisé partout pour les entrées au scroll */
  fadeInUp: {
    from: { opacity: 0, y: distance.md, filter: `blur(${blur.enter}px)` },
    to: { opacity: 1, y: 0, filter: "blur(0px)", duration: duration.enter, ease: ease.enter },
  },

  /** FadeInUp pour les éléments majeurs (hero, titres de section) */
  fadeInUpLarge: {
    from: { opacity: 0, y: distance.lg, filter: `blur(${blur.enter}px)` },
    to: { opacity: 1, y: 0, filter: "blur(0px)", duration: duration.reveal, ease: ease.enter },
  },

  /** ScaleIn pour les cartes et conteneurs */
  scaleIn: {
    from: { opacity: 0, scale: scale.from, y: distance.sm },
    to: { opacity: 1, scale: 1, y: 0, duration: duration.enter, ease: ease.snap },
  },

  /** SlideInLeft pour les éléments venant de la gauche */
  slideInLeft: {
    from: { opacity: 0, x: -distance.md },
    to: { opacity: 1, x: 0, duration: duration.enter, ease: ease.enter },
  },

  /** SlideInRight pour les éléments venant de la droite */
  slideInRight: {
    from: { opacity: 0, x: distance.md },
    to: { opacity: 1, x: 0, duration: duration.enter, ease: ease.enter },
  },

  /** Float continu — boîtes produit, éléments décoratifs */
  float: {
    y: -distance.float,
    rotation: 1,
    duration: duration.loop,
    ease: ease.organic,
    repeat: -1,
    yoyo: true,
  },

  /** Hover lift pour les cartes */
  hoverLift: {
    y: -distance.xs,
    scale: scale.hover,
    duration: duration.micro,
    ease: ease.snap,
  },
} as const;
