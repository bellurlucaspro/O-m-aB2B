"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Save, Check, ChevronDown, Plus, Trash2, GripVertical,
  Type, AlignLeft, MousePointerClick, Quote, BarChart3,
  Sparkles, BookOpen, Heart, TrendingUp, Target,
  Image as ImageIcon, LayoutGrid, ListChecks,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface HeroStat { value: string; label: string; }
interface HeroBadge { title: string; subtitle: string; position: string; style: string; }
interface HeroData {
  tag: string; image: string; secondaryImage: string;
  titleLine1: string; titleLine2: string; titleLine3: string;
  subtitleLines: string[]; ctaPrimary: string; ctaPrimaryHref: string;
  ctaSecondary: string; ctaSecondaryHref: string;
  stats: HeroStat[]; badges: HeroBadge[];
}

interface OriginData {
  tag: string; image: string; badgeTitle: string; badgeSubtitle: string;
  title: string; titleAccent: string; paragraphs: string[];
  quote: string; quoteAuthor: string;
}

interface ValueItem { num: string; title: string; text: string; image: string; accent: string; }
interface ValuesData { tag: string; title: string; subtitle: string; items: ValueItem[]; }

interface ChiffreItem { value: string; prefix: string; suffix: string; label: string; }
interface ChiffresData { title: string; items: ChiffreItem[]; }

interface BenefitItem { metric: string; metricLabel: string; title: string; text: string; image: string; }
interface BenefitsData { tag: string; title: string; subtitle: string; items: BenefitItem[]; }

interface CtaMetric { value: string; label: string; }
interface TrustPill { label: string; }
interface CtaTestimonial { quote: string; name: string; role: string; initials: string; }
interface CtaData {
  bgImage: string; testimonial: CtaTestimonial; metrics: CtaMetric[];
  title: string; subtitle: string; ctaPrimary: string; ctaPrimaryHref: string;
  ctaSecondary: string; ctaSecondaryHref: string; trustPills: TrustPill[];
}

interface AboutPage {
  hero: HeroData; origin: OriginData; values: ValuesData;
  chiffres: ChiffresData; benefits: BenefitsData; cta: CtaData;
}

/* ------------------------------------------------------------------ */
/*  Section config                                                     */
/* ------------------------------------------------------------------ */

interface SectionDef { key: string; label: string; icon: LucideIcon; color: string; }

const SECTIONS: SectionDef[] = [
  { key: "hero", label: "Hero", icon: Sparkles, color: "#87A38D" },
  { key: "origin", label: "Notre Histoire", icon: BookOpen, color: "#5F7263" },
  { key: "values", label: "Nos Valeurs", icon: Heart, color: "#E8A87C" },
  { key: "chiffres", label: "Chiffres", icon: BarChart3, color: "#6366f1" },
  { key: "benefits", label: "Bénéfices", icon: TrendingUp, color: "#0ea5e9" },
  { key: "cta", label: "CTA Final", icon: Target, color: "#f59e0b" },
];

/* ------------------------------------------------------------------ */
/*  Reusable field                                                     */
/* ------------------------------------------------------------------ */

function Field({
  label, hint, value, onChange, multiline = false, icon: Icon,
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; multiline?: boolean; icon?: LucideIcon;
}) {
  return (
    <div className="ce-field">
      <label className="ce-label">
        {Icon ? <Icon size={13} strokeWidth={2} style={{ opacity: 0.5 }} /> : null}
        {label}
      </label>
      {multiline ? (
        <textarea className="ce-input ce-textarea" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="ce-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint ? <p className="ce-hint">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline list item                                                   */
/* ------------------------------------------------------------------ */

function ListItem({
  value, onChange, onDelete, placeholder, multiline = false,
}: {
  value: string; onChange: (v: string) => void; onDelete: () => void;
  placeholder?: string; multiline?: boolean;
}) {
  return (
    <div className="ce-list-item">
      <GripVertical size={14} style={{ color: "#c4c9d1", flexShrink: 0 }} />
      {multiline ? (
        <textarea
          className="ce-input ce-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, minHeight: "56px" }}
        />
      ) : (
        <input
          className="ce-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
      )}
      <button className="ce-btn-icon ce-btn-icon--danger" onClick={onDelete} title="Supprimer">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card for array items                                               */
/* ------------------------------------------------------------------ */

function ItemCard({ label, index, onDelete, children }: {
  label: string; index: number; onDelete: () => void; children: React.ReactNode;
}) {
  return (
    <div className="ce-item-card">
      <div className="ce-item-card__header">
        <div className="ce-item-card__title">
          <span className="ce-item-card__index">{String(index + 1).padStart(2, "0")}</span>
          {label}
        </div>
        <button className="ce-btn-icon ce-btn-icon--danger" onClick={onDelete} title="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="ce-item-card__body">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Image upload field                                                 */
/* ------------------------------------------------------------------ */

function ImageField({ label, hint, value, onChange }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="ce-field">
      <label className="ce-label">
        <ImageIcon size={13} strokeWidth={2} style={{ opacity: 0.5 }} />
        {label}
      </label>
      {value && (
        <div style={{
          width: "100%", height: "80px", borderRadius: "8px", overflow: "hidden",
          marginBottom: "8px", border: "1.5px solid #e5e7eb",
        }}>
          <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          className="ce-input"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/mon-image.jpg"
          style={{ flex: 1 }}
        />
        <label style={{
          padding: "8px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600,
          background: "#5F7263", color: "white", cursor: "pointer", whiteSpace: "nowrap",
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px",
        }}>
          Choisir
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.append("file", file);
              try {
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                if (res.ok) {
                  const data = await res.json();
                  onChange(data.url);
                }
              } catch { /* silent */ }
            }}
          />
        </label>
        {value && (
          <button className="ce-btn-icon ce-btn-icon--danger" title="Supprimer l'image" onClick={() => onChange("")}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {hint ? <p className="ce-hint">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const isSuccess = message.toLowerCase().includes("succes");
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`ce-toast ${isSuccess ? "ce-toast--success" : "ce-toast--error"}`}>
      {isSuccess ? (
        <div className="ce-toast__icon"><Check size={14} strokeWidth={3} /></div>
      ) : null}
      {message}
    </div>
  );
}

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */

export default function AdminAboutPage() {
  const [fullContent, setFullContent] = useState<Record<string, unknown> | null>(null);
  const [about, setAbout] = useState<AboutPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const initialLoad = useRef(true);

  /* Load */
  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => { if (!r.ok) throw new Error("Erreur de chargement"); return r.json(); })
      .then((data) => {
        setFullContent(data);
        setAbout(data.aboutPage || {} as AboutPage);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  /* Save */
  const handleSave = useCallback(async () => {
    if (!fullContent || !about) return;
    setSaving(true);
    try {
      const payload = { ...fullContent, aboutPage: about };
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      setFullContent(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      setToast("Modifications enregistrées avec succès !");
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }, [fullContent, about]);

  /* Ctrl+S */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  /* Helper to update a top-level about key */
  const set = <K extends keyof AboutPage>(section: K, patch: Partial<AboutPage[K]>) => {
    setAbout((prev) => prev ? { ...prev, [section]: { ...prev[section], ...patch } } : prev);
  };

  /* ---- guards ---- */
  if (loading) return (
    <div className="ce-loading">
      <div className="ce-spinner" />
      <span>Chargement du contenu...</span>
    </div>
  );
  if (error || !about) return (
    <div className="ce-loading" style={{ color: "#dc2626" }}>
      {error || "Impossible de charger le contenu."}
    </div>
  );

  /* ================================================================ */
  /*  Section renderers                                                */
  /* ================================================================ */

  const renderHero = () => {
    const h = about.hero;
    if (!h) return <p className="ce-hint">Section non initialisée.</p>;
    return (
      <>
        <Field label="Tag" hint="Petit label au-dessus du titre (ex: Notre histoire)" value={h.tag || ""} onChange={(v) => set("hero", { tag: v })} />
        <ImageField label="Image principale" hint="Grande image à droite" value={h.image} onChange={(v) => set("hero", { image: v })} />
        <ImageField label="Image secondaire" hint="Petite image superposée en bas à gauche" value={h.secondaryImage || ""} onChange={(v) => set("hero", { secondaryImage: v })} />

        <Field icon={Type} label="Titre ligne 1" value={h.titleLine1} onChange={(v) => set("hero", { titleLine1: v })} />
        <Field icon={Type} label="Titre ligne 2 (en italique accent)" value={h.titleLine2} onChange={(v) => set("hero", { titleLine2: v })} />
        <Field icon={Type} label="Titre ligne 3" value={h.titleLine3} onChange={(v) => set("hero", { titleLine3: v })} />

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <AlignLeft size={15} />
            <span>Lignes de sous-titre</span>
            <span className="ce-badge">{h.subtitleLines?.length || 0}</span>
          </div>
          {(h.subtitleLines || []).map((line, i) => (
            <ListItem key={i} value={line} onChange={(v) => {
              const arr = [...(h.subtitleLines || [])]; arr[i] = v; set("hero", { subtitleLines: arr });
            }} onDelete={() => set("hero", { subtitleLines: (h.subtitleLines || []).filter((_, idx) => idx !== i) })} placeholder="Ligne de sous-titre" />
          ))}
          <button className="ce-btn-add" onClick={() => set("hero", { subtitleLines: [...(h.subtitleLines || []), ""] })}>
            <Plus size={14} /> Ajouter une ligne
          </button>
        </div>

        <div className="ce-row" style={{ marginTop: "14px" }}>
          <Field icon={MousePointerClick} label="CTA principal" value={h.ctaPrimary} onChange={(v) => set("hero", { ctaPrimary: v })} />
          <Field label="Lien CTA principal" value={h.ctaPrimaryHref} onChange={(v) => set("hero", { ctaPrimaryHref: v })} />
        </div>
        <div className="ce-row">
          <Field label="CTA secondaire" value={h.ctaSecondary} onChange={(v) => set("hero", { ctaSecondary: v })} />
          <Field label="Lien CTA secondaire" value={h.ctaSecondaryHref} onChange={(v) => set("hero", { ctaSecondaryHref: v })} />
        </div>

        {/* Mini stats */}
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <BarChart3 size={15} />
            <span>Mini statistiques</span>
            <span className="ce-badge">{h.stats?.length || 0}</span>
          </div>
          {(h.stats || []).map((s, i) => (
            <div key={i} className="ce-list-item">
              <GripVertical size={14} style={{ color: "#c4c9d1", flexShrink: 0 }} />
              <input className="ce-input" value={s.value} onChange={(e) => {
                const arr = [...(h.stats || [])]; arr[i] = { ...arr[i], value: e.target.value }; set("hero", { stats: arr });
              }} placeholder="Valeur (ex: +50)" style={{ flex: "0 0 100px" }} />
              <input className="ce-input" value={s.label} onChange={(e) => {
                const arr = [...(h.stats || [])]; arr[i] = { ...arr[i], label: e.target.value }; set("hero", { stats: arr });
              }} placeholder="Label" style={{ flex: 1 }} />
              <button className="ce-btn-icon ce-btn-icon--danger" onClick={() => set("hero", { stats: (h.stats || []).filter((_, idx) => idx !== i) })} title="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="ce-btn-add" onClick={() => set("hero", { stats: [...(h.stats || []), { value: "", label: "" }] })}>
            <Plus size={14} /> Ajouter une stat
          </button>
        </div>

        {/* Floating badges */}
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <LayoutGrid size={15} />
            <span>Badges flottants</span>
            <span className="ce-badge">{h.badges?.length || 0}</span>
          </div>
          {(h.badges || []).map((b, i) => (
            <ItemCard key={i} index={i} label={b.title || "Sans titre"} onDelete={() => set("hero", { badges: (h.badges || []).filter((_, idx) => idx !== i) })}>
              <div className="ce-row">
                <Field label="Titre" value={b.title} onChange={(v) => {
                  const arr = [...(h.badges || [])]; arr[i] = { ...arr[i], title: v }; set("hero", { badges: arr });
                }} />
                <Field label="Sous-titre" value={b.subtitle} onChange={(v) => {
                  const arr = [...(h.badges || [])]; arr[i] = { ...arr[i], subtitle: v }; set("hero", { badges: arr });
                }} />
              </div>
              <div className="ce-row">
                <Field label="Position" hint="top-right ou bottom-right" value={b.position} onChange={(v) => {
                  const arr = [...(h.badges || [])]; arr[i] = { ...arr[i], position: v }; set("hero", { badges: arr });
                }} />
                <Field label="Style" hint="dark (fond vert) ou light (fond blanc)" value={b.style} onChange={(v) => {
                  const arr = [...(h.badges || [])]; arr[i] = { ...arr[i], style: v }; set("hero", { badges: arr });
                }} />
              </div>
            </ItemCard>
          ))}
          <button className="ce-btn-add" onClick={() => set("hero", { badges: [...(h.badges || []), { title: "", subtitle: "", position: "top-right", style: "dark" }] })}>
            <Plus size={14} /> Ajouter un badge
          </button>
        </div>
      </>
    );
  };

  const renderOrigin = () => {
    const o = about.origin;
    if (!o) return <p className="ce-hint">Section non initialisée.</p>;
    return (
      <>
        <Field label="Tag" hint="Petit label au-dessus du titre" value={o.tag} onChange={(v) => set("origin", { tag: v })} />
        <ImageField label="Image" hint="Illustration de la section" value={o.image} onChange={(v) => set("origin", { image: v })} />
        <div className="ce-row">
          <Field label="Badge titre" value={o.badgeTitle} onChange={(v) => set("origin", { badgeTitle: v })} />
          <Field label="Badge sous-titre" value={o.badgeSubtitle} onChange={(v) => set("origin", { badgeSubtitle: v })} />
        </div>
        <div className="ce-row">
          <Field icon={Type} label="Titre" value={o.title} onChange={(v) => set("origin", { title: v })} />
          <Field label="Titre accent" hint="Partie colorée du titre" value={o.titleAccent} onChange={(v) => set("origin", { titleAccent: v })} />
        </div>

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <AlignLeft size={15} />
            <span>Paragraphes</span>
            <span className="ce-badge">{o.paragraphs?.length || 0}</span>
          </div>
          {(o.paragraphs || []).map((p, i) => (
            <ListItem key={i} value={p} onChange={(v) => {
              const arr = [...(o.paragraphs || [])]; arr[i] = v; set("origin", { paragraphs: arr });
            }} onDelete={() => set("origin", { paragraphs: (o.paragraphs || []).filter((_, idx) => idx !== i) })} placeholder="Texte du paragraphe" multiline />
          ))}
          <button className="ce-btn-add" onClick={() => set("origin", { paragraphs: [...(o.paragraphs || []), ""] })}>
            <Plus size={14} /> Ajouter un paragraphe
          </button>
        </div>

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <Quote size={15} />
            <span>Citation</span>
          </div>
          <Field icon={Quote} label="Citation" value={o.quote} onChange={(v) => set("origin", { quote: v })} multiline />
          <Field label="Auteur" value={o.quoteAuthor} onChange={(v) => set("origin", { quoteAuthor: v })} />
        </div>
      </>
    );
  };

  const renderValues = () => {
    const v = about.values;
    if (!v) return <p className="ce-hint">Section non initialisée.</p>;
    return (
      <>
        <Field label="Tag" value={v.tag} onChange={(val) => set("values", { tag: val })} />
        <Field icon={Type} label="Titre" value={v.title} onChange={(val) => set("values", { title: val })} />
        <Field label="Sous-titre" value={v.subtitle} onChange={(val) => set("values", { subtitle: val })} multiline />

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <LayoutGrid size={15} />
            <span>Valeurs</span>
            <span className="ce-badge">{v.items?.length || 0}</span>
          </div>
          <div className="ce-grid-2">
            {(v.items || []).map((item, i) => (
              <ItemCard key={i} index={i} label={item.title || "Sans titre"} onDelete={() => {
                set("values", { items: (v.items || []).filter((_, idx) => idx !== i) });
              }}>
                <div className="ce-row">
                  <Field label="Numéro" hint="Ex: 01" value={item.num} onChange={(val) => {
                    const arr = [...(v.items || [])]; arr[i] = { ...arr[i], num: val }; set("values", { items: arr });
                  }} />
                  <Field label="Titre" value={item.title} onChange={(val) => {
                    const arr = [...(v.items || [])]; arr[i] = { ...arr[i], title: val }; set("values", { items: arr });
                  }} />
                </div>
                <Field label="Texte" value={item.text} onChange={(val) => {
                  const arr = [...(v.items || [])]; arr[i] = { ...arr[i], text: val }; set("values", { items: arr });
                }} multiline />
                <ImageField label="Image" value={item.image} onChange={(val) => {
                  const arr = [...(v.items || [])]; arr[i] = { ...arr[i], image: val }; set("values", { items: arr });
                }} />
                <Field label="Couleur accent" hint="Code hex (ex: #87A38D)" value={item.accent} onChange={(val) => {
                  const arr = [...(v.items || [])]; arr[i] = { ...arr[i], accent: val }; set("values", { items: arr });
                }} />
              </ItemCard>
            ))}
          </div>
          <button className="ce-btn-add" onClick={() => set("values", { items: [...(v.items || []), { num: "", title: "", text: "", image: "", accent: "" }] })}>
            <Plus size={14} /> Ajouter une valeur
          </button>
        </div>
      </>
    );
  };

  const renderChiffres = () => {
    const c = about.chiffres;
    if (!c) return <p className="ce-hint">Section non initialisée.</p>;
    return (
      <>
        <Field icon={Type} label="Titre" value={c.title} onChange={(v) => set("chiffres", { title: v })} />

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <BarChart3 size={15} />
            <span>Chiffres clés</span>
            <span className="ce-badge">{c.items?.length || 0}</span>
          </div>
          {(c.items || []).map((item, i) => (
            <div key={i} className="ce-list-item" style={{ alignItems: "flex-start", gap: "6px" }}>
              <GripVertical size={14} style={{ color: "#c4c9d1", flexShrink: 0, marginTop: "10px" }} />
              <input className="ce-input" value={item.prefix || ""} onChange={(e) => {
                const arr = [...(c.items || [])]; arr[i] = { ...arr[i], prefix: e.target.value }; set("chiffres", { items: arr });
              }} placeholder="Préfixe" style={{ flex: "0 0 70px" }} />
              <input className="ce-input" value={item.value} onChange={(e) => {
                const arr = [...(c.items || [])]; arr[i] = { ...arr[i], value: e.target.value }; set("chiffres", { items: arr });
              }} placeholder="Valeur" style={{ flex: "0 0 80px" }} />
              <input className="ce-input" value={item.suffix || ""} onChange={(e) => {
                const arr = [...(c.items || [])]; arr[i] = { ...arr[i], suffix: e.target.value }; set("chiffres", { items: arr });
              }} placeholder="Suffixe" style={{ flex: "0 0 70px" }} />
              <input className="ce-input" value={item.label} onChange={(e) => {
                const arr = [...(c.items || [])]; arr[i] = { ...arr[i], label: e.target.value }; set("chiffres", { items: arr });
              }} placeholder="Label" style={{ flex: 1 }} />
              <button className="ce-btn-icon ce-btn-icon--danger" onClick={() => set("chiffres", { items: (c.items || []).filter((_, idx) => idx !== i) })} title="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="ce-btn-add" onClick={() => set("chiffres", { items: [...(c.items || []), { value: "", prefix: "", suffix: "", label: "" }] })}>
            <Plus size={14} /> Ajouter un chiffre
          </button>
        </div>
      </>
    );
  };

  const renderBenefits = () => {
    const b = about.benefits;
    if (!b) return <p className="ce-hint">Section non initialisée.</p>;
    return (
      <>
        <Field label="Tag" value={b.tag} onChange={(v) => set("benefits", { tag: v })} />
        <Field icon={Type} label="Titre" value={b.title} onChange={(v) => set("benefits", { title: v })} />
        <Field label="Sous-titre" value={b.subtitle} onChange={(v) => set("benefits", { subtitle: v })} multiline />

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <LayoutGrid size={15} />
            <span>Éléments</span>
            <span className="ce-badge">{b.items?.length || 0}</span>
          </div>
          <div className="ce-grid-2">
            {(b.items || []).map((item, i) => (
              <ItemCard key={i} index={i} label={item.title || "Sans titre"} onDelete={() => {
                set("benefits", { items: (b.items || []).filter((_, idx) => idx !== i) });
              }}>
                <div className="ce-row">
                  <Field label="Métrique" hint="Ex: 98%" value={item.metric} onChange={(v) => {
                    const arr = [...(b.items || [])]; arr[i] = { ...arr[i], metric: v }; set("benefits", { items: arr });
                  }} />
                  <Field label="Label métrique" hint="Ex: satisfaction" value={item.metricLabel} onChange={(v) => {
                    const arr = [...(b.items || [])]; arr[i] = { ...arr[i], metricLabel: v }; set("benefits", { items: arr });
                  }} />
                </div>
                <Field label="Titre" value={item.title} onChange={(v) => {
                  const arr = [...(b.items || [])]; arr[i] = { ...arr[i], title: v }; set("benefits", { items: arr });
                }} />
                <Field label="Texte" value={item.text} onChange={(v) => {
                  const arr = [...(b.items || [])]; arr[i] = { ...arr[i], text: v }; set("benefits", { items: arr });
                }} multiline />
                <ImageField label="Image" value={item.image} onChange={(v) => {
                  const arr = [...(b.items || [])]; arr[i] = { ...arr[i], image: v }; set("benefits", { items: arr });
                }} />
              </ItemCard>
            ))}
          </div>
          <button className="ce-btn-add" onClick={() => set("benefits", { items: [...(b.items || []), { metric: "", metricLabel: "", title: "", text: "", image: "" }] })}>
            <Plus size={14} /> Ajouter un élément
          </button>
        </div>
      </>
    );
  };

  const renderCTA = () => {
    const c = about.cta;
    if (!c) return <p className="ce-hint">Section non initialisée.</p>;
    const t = c.testimonial || { quote: "", name: "", role: "", initials: "" };
    return (
      <>
        <ImageField label="Image de fond" hint="Arrière-plan de la section CTA" value={c.bgImage} onChange={(v) => set("cta", { bgImage: v })} />

        {/* Testimonial */}
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <Quote size={15} />
            <span>Témoignage</span>
          </div>
          <div className="ce-testimonial-card">
            <Field icon={Quote} label="Citation" value={t.quote} onChange={(v) => set("cta", { testimonial: { ...t, quote: v } })} multiline />
            <div className="ce-row">
              <Field label="Nom" value={t.name} onChange={(v) => set("cta", { testimonial: { ...t, name: v } })} />
              <Field label="Fonction" value={t.role} onChange={(v) => set("cta", { testimonial: { ...t, role: v } })} />
            </div>
            <Field label="Initiales" hint="Affichées dans l'avatar" value={t.initials} onChange={(v) => set("cta", { testimonial: { ...t, initials: v } })} />
          </div>
        </div>

        {/* Metrics */}
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <BarChart3 size={15} />
            <span>Métriques</span>
            <span className="ce-badge">{c.metrics?.length || 0}</span>
          </div>
          {(c.metrics || []).map((m, i) => (
            <div key={i} className="ce-list-item">
              <GripVertical size={14} style={{ color: "#c4c9d1", flexShrink: 0 }} />
              <input className="ce-input" value={m.value} onChange={(e) => {
                const arr = [...(c.metrics || [])]; arr[i] = { ...arr[i], value: e.target.value }; set("cta", { metrics: arr });
              }} placeholder="Valeur" style={{ flex: "0 0 100px" }} />
              <input className="ce-input" value={m.label} onChange={(e) => {
                const arr = [...(c.metrics || [])]; arr[i] = { ...arr[i], label: e.target.value }; set("cta", { metrics: arr });
              }} placeholder="Label" style={{ flex: 1 }} />
              <button className="ce-btn-icon ce-btn-icon--danger" onClick={() => set("cta", { metrics: (c.metrics || []).filter((_, idx) => idx !== i) })} title="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="ce-btn-add" onClick={() => set("cta", { metrics: [...(c.metrics || []), { value: "", label: "" }] })}>
            <Plus size={14} /> Ajouter une métrique
          </button>
        </div>

        {/* Title + subtitle */}
        <div className="ce-subsection">
          <Field icon={Type} label="Titre" value={c.title} onChange={(v) => set("cta", { title: v })} />
          <Field label="Sous-titre" value={c.subtitle} onChange={(v) => set("cta", { subtitle: v })} multiline />
        </div>

        {/* CTAs */}
        <div className="ce-row">
          <Field icon={MousePointerClick} label="CTA principal" value={c.ctaPrimary} onChange={(v) => set("cta", { ctaPrimary: v })} />
          <Field label="Lien CTA principal" value={c.ctaPrimaryHref} onChange={(v) => set("cta", { ctaPrimaryHref: v })} />
        </div>
        <div className="ce-row">
          <Field label="CTA secondaire" value={c.ctaSecondary} onChange={(v) => set("cta", { ctaSecondary: v })} />
          <Field label="Lien CTA secondaire" value={c.ctaSecondaryHref} onChange={(v) => set("cta", { ctaSecondaryHref: v })} />
        </div>

        {/* Trust pills */}
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <ListChecks size={15} />
            <span>Badges de confiance</span>
            <span className="ce-badge">{c.trustPills?.length || 0}</span>
          </div>
          {(c.trustPills || []).map((pill, i) => (
            <ListItem key={i} value={pill.label} onChange={(v) => {
              const arr = [...(c.trustPills || [])]; arr[i] = { label: v }; set("cta", { trustPills: arr });
            }} onDelete={() => set("cta", { trustPills: (c.trustPills || []).filter((_, idx) => idx !== i) })} placeholder="Label du badge" />
          ))}
          <button className="ce-btn-add" onClick={() => set("cta", { trustPills: [...(c.trustPills || []), { label: "" }] })}>
            <Plus size={14} /> Ajouter un badge
          </button>
        </div>
      </>
    );
  };

  /* ================================================================ */
  /*  Section render map                                               */
  /* ================================================================ */

  const renderFn: Record<string, () => React.ReactNode> = {
    hero: renderHero, origin: renderOrigin, values: renderValues,
    chiffres: renderChiffres, benefits: renderBenefits, cta: renderCTA,
  };

  /* ================================================================ */
  /*  Main render                                                      */
  /* ================================================================ */

  const selectSection = (key: string) => setActiveSection(key);

  return (
    <div className="ce-root">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ce-root { font-family: var(--font-inter); position: relative; }

        /* ---- top bar ---- */
        .ce-topbar {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px;
          background: white;
          border-bottom: 1px solid #eef0f2;
          z-index: 40;
        }
        .ce-topbar__title {
          font-family: var(--font-manrope); font-weight: 750;
          font-size: 0.95rem; color: #1a1f25; margin: 0;
        }
        .ce-topbar__actions {
          display: flex; align-items: center; gap: 6px;
          margin-left: auto;
        }

        /* ---- layout ---- */
        .ce-builder { display: flex; }

        /* ---- sidebar ---- */
        .ce-sidebar {
          width: 240px; flex-shrink: 0;
          background: #fafbfc;
          border-right: 1px solid #eef0f2;
          overflow-y: auto;
          padding: 16px 0;
          height: calc(100vh - 64px - 50px);
          position: sticky; top: 0;
        }
        .ce-sidebar__label {
          font-size: 0.6rem; font-weight: 650; text-transform: uppercase;
          letter-spacing: 0.1em; color: #9ca3af;
          padding: 0 16px; margin-bottom: 8px;
        }
        .ce-sidebar__item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; cursor: pointer;
          border: none; background: none; width: 100%; text-align: left;
          font-family: inherit; font-size: 0.8rem; font-weight: 450;
          color: #6b7280; transition: all 0.15s ease;
          position: relative; border-left: 3px solid transparent;
        }
        .ce-sidebar__item:hover { background: rgba(135,163,141,0.06); color: #374151; }
        .ce-sidebar__item--active {
          background: rgba(135,163,141,0.1);
          border-left-color: #5F7263;
          color: #5F7263; font-weight: 600;
        }
        .ce-sidebar__icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s ease;
        }

        /* ---- editor ---- */
        .ce-editor { flex: 1; min-width: 0; }

        .ce-section-header {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 28px; padding-bottom: 20px;
          border-bottom: 2px solid #f3f5f7;
        }
        .ce-section-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ce-section-title {
          font-family: var(--font-manrope); font-weight: 800;
          font-size: 1.3rem; color: #1a1f25; letter-spacing: -0.02em;
          margin: 0;
        }
        .ce-section-subtitle {
          font-size: 0.75rem; color: #9ca3af; font-weight: 450; margin-top: 2px;
        }
        .ce-section-nav {
          display: flex; align-items: center; gap: 6px;
          margin-left: auto;
        }
        .ce-section-nav-btn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1.5px solid #e5e7eb; background: white;
          color: #6b7280; cursor: pointer; transition: all 0.15s ease;
          font-family: inherit;
        }
        .ce-section-nav-btn:hover { border-color: #87A38D; color: #5F7263; background: #f0fdf4; }
        .ce-section-nav-btn:disabled { opacity: 0.3; cursor: default; }

        .ce-editor__body { animation: fadeIn 0.25s ease; }

        /* ---- field ---- */
        .ce-field { margin-bottom: 14px; }
        .ce-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.73rem; font-weight: 580; color: #4b5563;
          margin-bottom: 5px; letter-spacing: 0.01em;
        }
        .ce-input {
          padding: 9px 13px; border: 1.5px solid #e5e7eb; border-radius: 8px;
          font-size: 0.86rem; width: 100%; font-family: inherit;
          box-sizing: border-box; transition: all 0.15s ease; outline: none;
          background: #fafbfc; color: #1a1f25;
        }
        .ce-input:focus {
          border-color: #87A38D;
          box-shadow: 0 0 0 3px rgba(135,163,141,0.12);
          background: white;
        }
        .ce-textarea { min-height: 72px; resize: vertical; line-height: 1.55; }
        .ce-hint { font-size: 0.7rem; color: #b0b5be; margin: 3px 0 0; font-weight: 400; }

        /* ---- rows / grids ---- */
        .ce-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ce-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ce-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

        /* ---- subsection ---- */
        .ce-subsection { margin-top: 18px; padding-top: 18px; border-top: 1px solid #f3f5f7; }
        .ce-subsection__header {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.78rem; font-weight: 620; color: #374151;
          margin-bottom: 12px;
        }
        .ce-badge {
          font-size: 0.65rem; font-weight: 600;
          background: #f0f1f3; color: #6b7280;
          padding: 2px 7px; border-radius: 10px;
        }

        /* ---- list item ---- */
        .ce-list-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }

        /* ---- item card ---- */
        .ce-item-card {
          background: #f9fafb; border-radius: 10px;
          border: 1px solid #eef0f2; overflow: hidden;
          transition: border-color 0.15s;
        }
        .ce-item-card:hover { border-color: #d4d8de; }
        .ce-item-card__header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px; background: #f3f5f7;
          border-bottom: 1px solid #eef0f2;
        }
        .ce-item-card__title {
          display: flex; align-items: center; gap: 8px;
          font-weight: 600; font-size: 0.78rem; color: #374151;
        }
        .ce-item-card__index {
          font-size: 0.65rem; font-weight: 700; color: #9ca3af;
          font-family: 'SF Mono', 'Fira Code', monospace;
        }
        .ce-item-card__body { padding: 14px; }

        /* ---- buttons ---- */
        .ce-btn-add {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px;
          font-size: 0.78rem; font-weight: 580;
          border: 1.5px dashed #d4d8de; background: transparent;
          color: #6b7280; cursor: pointer; margin-top: 10px;
          transition: all 0.15s ease; font-family: inherit;
        }
        .ce-btn-add:hover { border-color: #87A38D; color: #5F7263; background: #f0fdf4; }

        .ce-btn-icon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          border: none; cursor: pointer; transition: all 0.15s ease;
          background: transparent; color: #9ca3af;
        }
        .ce-btn-icon:hover { background: #f3f4f6; }
        .ce-btn-icon--danger:hover { background: #fef2f2; color: #ef4444; }

        /* ---- testimonial card ---- */
        .ce-testimonial-card {
          background: #f9fafb; border-radius: 12px; padding: 18px;
          border: 1px solid #eef0f2;
        }

        /* ---- floating save ---- */
        .ce-save {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 10px;
          border: none; font-family: var(--font-manrope);
          font-weight: 700; font-size: 0.8rem; cursor: pointer;
          transition: all 0.15s ease;
        }
        .ce-save--default { background: #5F7263; color: white; }
        .ce-save--default:hover { background: #4A5C4E; }
        .ce-save--saving { background: #6b7280; color: white; cursor: wait; opacity: 0.8; }
        .ce-save--saved { background: #10b981; color: white; }

        /* ---- toast ---- */
        .ce-toast {
          position: fixed; bottom: 28px; right: 28px;
          padding: 12px 20px; border-radius: 10px;
          font-weight: 550; font-size: 0.84rem;
          font-family: inherit; z-index: 9999;
          animation: toastSlide 0.3s ease;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .ce-toast--success { background: #065f46; color: white; }
        .ce-toast--error { background: #991b1b; color: white; }
        .ce-toast__icon {
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
        }

        /* ---- loading ---- */
        .ce-loading {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 60vh; gap: 12px; color: #6b7280; font-size: 0.88rem;
        }
        .ce-spinner {
          width: 28px; height: 28px;
          border: 2.5px solid #eef0f2; border-top-color: #5F7263;
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }
      `}</style>

      {/* ============================================================ */}
      {/*  TOP BAR                                                      */}
      {/* ============================================================ */}
      <div className="ce-topbar">
        <h1 className="ce-topbar__title">À propos — Éditeur</h1>
        <div className="ce-topbar__actions">
          <button
            className={`ce-save ${saving ? "ce-save--saving" : saved ? "ce-save--saved" : "ce-save--default"}`}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? (
              <><div className="ce-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</>
            ) : saved ? (
              <><Check size={14} strokeWidth={3} /> OK</>
            ) : (
              <><Save size={14} /> Enregistrer</>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  BUILDER                                                      */}
      {/* ============================================================ */}
      <div className="ce-builder">

        {/* ---- LEFT: Section sidebar ---- */}
        <aside className="ce-sidebar">
          <p className="ce-sidebar__label">Page À propos</p>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.key;
            return (
              <button
                key={s.key}
                className={`ce-sidebar__item ${isActive ? "ce-sidebar__item--active" : ""}`}
                onClick={() => selectSection(s.key)}
              >
                <div
                  className="ce-sidebar__icon"
                  style={{
                    background: isActive ? s.color + "18" : "rgba(0,0,0,0.03)",
                    color: isActive ? s.color : "#9ca3af",
                  }}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.6} />
                </div>
                <span>{s.label}</span>
              </button>
            );
          })}
        </aside>

        {/* ---- CENTER: Active section editor ---- */}
        <div
          className="ce-editor"
          style={{
            padding: "24px 32px 120px",
            height: "calc(100vh - 114px)",
            overflowY: "scroll",
            overflowX: "hidden",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {(() => {
            const s = SECTIONS.find((sec) => sec.key === activeSection);
            if (!s) return null;
            const Icon = s.icon;
            const idx = SECTIONS.indexOf(s);
            return (
              <>
                {/* Section header */}
                <div className="ce-section-header">
                  <div className="ce-section-icon" style={{ background: s.color + "14", color: s.color }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className="ce-section-title">{s.label}</h2>
                    <p className="ce-section-subtitle">Section {idx + 1} sur {SECTIONS.length}</p>
                  </div>
                  <div className="ce-section-nav">
                    <button
                      className="ce-section-nav-btn"
                      onClick={() => selectSection(SECTIONS[idx - 1]?.key)}
                      disabled={idx === 0}
                      title="Section precedente"
                    >
                      <ChevronDown size={14} style={{ transform: "rotate(90deg)" }} />
                    </button>
                    <button
                      className="ce-section-nav-btn"
                      onClick={() => selectSection(SECTIONS[idx + 1]?.key)}
                      disabled={idx === SECTIONS.length - 1}
                      title="Section suivante"
                    >
                      <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
                    </button>
                  </div>
                </div>

                {/* Section content */}
                <div className="ce-editor__body" key={activeSection}>
                  {renderFn[activeSection]?.()}
                </div>

                {/* Next section CTA */}
                {idx < SECTIONS.length - 1 && (
                  <div style={{
                    marginTop: "32px", paddingTop: "24px",
                    borderTop: "2px solid #f3f5f7",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                      Section suivante : <strong style={{ color: "#374151" }}>{SECTIONS[idx + 1].label}</strong>
                    </span>
                    <button
                      onClick={() => selectSection(SECTIONS[idx + 1].key)}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 20px", borderRadius: "10px",
                        border: "1.5px solid #e5e7eb", background: "white",
                        color: "#5F7263", fontSize: "0.82rem", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s ease",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "#5F7263";
                        (e.currentTarget as HTMLElement).style.background = "rgba(45,74,62,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                        (e.currentTarget as HTMLElement).style.background = "white";
                      }}
                    >
                      Continuer →
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
