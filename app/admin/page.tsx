"use client";

import { useEffect, useState, useMemo } from "react";
import type { Submission, Product } from "@/lib/types";
import {
  FileText, Package, Inbox, Clock, TrendingUp, TrendingDown,
  ArrowUpRight, ChevronRight, RefreshCw, AlertTriangle,
  Mail, Sparkles, Euro, Calendar, MoreHorizontal,
  Wrench, CheckCircle2, Zap, MessageSquareText,
  SlidersHorizontal, Info,
} from "lucide-react";

/* ============================================================ */
/*  Helpers                                                     */
/* ============================================================ */

function relativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD}j`;
  if (diffD < 30) return `il y a ${Math.floor(diffD / 7)} sem.`;
  return `il y a ${Math.floor(diffD / 30)} mois`;
}

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFromString(str: string): string {
  const colors = ["#87A38D", "#5F7263", "#B8860B", "#C06050", "#D4956B", "#8b9eb0", "#a08fa8"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface DashboardData {
  submissions: Submission[];
  products: Product[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [reseeding, setReseeding] = useState(false);
  const [reseedMsg, setReseedMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [subsRes, prodsRes] = await Promise.all([
          fetch("/api/admin/submissions"),
          fetch("/api/admin/products"),
        ]);
        const submissions: Submission[] = await subsRes.json();
        const products: Product[] = await prodsRes.json();
        setData({ submissions, products });
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleReseed = async () => {
    if (!confirm(
      "⚠️ Action avancée\n\n" +
      "Cette action va réécrire la base de données de production avec le contenu du dépôt de code.\n\n" +
      "Toutes les modifications faites récemment via l'admin peuvent être perdues.\n\n" +
      "Continuer ?"
    )) return;

    setReseeding(true);
    setReseedMsg(null);
    try {
      const res = await fetch("/api/admin/reseed", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setReseedMsg({
          type: "success",
          text: json.mode === "redis"
            ? `Synchronisation réussie : ${json.seeded.length} ensembles de données restaurés.`
            : "Mode local : les fichiers sont déjà la source.",
        });
      } else {
        setReseedMsg({ type: "error", text: "Erreur lors de la synchronisation" });
      }
    } catch {
      setReseedMsg({ type: "error", text: "Erreur réseau" });
    }
    setReseeding(false);
    setTimeout(() => setReseedMsg(null), 6000);
  };

  // ── Computed stats ──
  const stats = useMemo(() => {
    if (!data) return null;
    const { submissions } = data;
    const now = Date.now();
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    const lastWeekCutoff = now - WEEK;
    const prevWeekCutoff = now - 2 * WEEK;

    const lastWeek = submissions.filter(s => new Date(s.date).getTime() >= lastWeekCutoff);
    const prevWeek = submissions.filter(s => {
      const t = new Date(s.date).getTime();
      return t >= prevWeekCutoff && t < lastWeekCutoff;
    });

    const weekDelta = lastWeek.length - prevWeek.length;
    const weekTrend = prevWeek.length === 0
      ? (lastWeek.length > 0 ? 100 : 0)
      : Math.round((weekDelta / prevWeek.length) * 100);

    const pipelineTTC = submissions.reduce((acc, s) => acc + (s.customCoffret?.totalTTC ?? 0), 0);
    const pipelineLastWeek = lastWeek.reduce((acc, s) => acc + (s.customCoffret?.totalTTC ?? 0), 0);
    const customCount = submissions.filter(s => !!s.customCoffret).length;
    const unreadCount = submissions.filter(s => !s.read).length;
    const sorted = [...submissions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      total: submissions.length,
      unread: unreadCount,
      customCount,
      pipelineTTC,
      pipelineLastWeek,
      weekCount: lastWeek.length,
      weekTrend,
      recent: sorted.slice(0, 6),
      unreadList: sorted.filter(s => !s.read).slice(0, 3),
    };
  }, [data]);

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Chargement de votre tableau de bord…</p>
    </div>
  );

  if (!data || !stats) return (
    <div className="dash-loading"><p style={{ color: "#ef4444" }}>Erreur de chargement.</p></div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const firstName = "Catherine";

  // Contextual smart message
  let contextMsg = "";
  if (stats.unread > 0) {
    const customUnread = stats.unreadList.filter(s => s.customCoffret).length;
    if (customUnread > 0) {
      contextMsg = `Vous avez ${stats.unread} nouvelle${stats.unread > 1 ? "s" : ""} demande${stats.unread > 1 ? "s" : ""}, dont ${customUnread} coffret${customUnread > 1 ? "s" : ""} sur-mesure à étudier.`;
    } else {
      contextMsg = `${stats.unread} nouvelle${stats.unread > 1 ? "s" : ""} demande${stats.unread > 1 ? "s" : ""} vous attend${stats.unread > 1 ? "ent" : ""}.`;
    }
  } else if (stats.total === 0) {
    contextMsg = "Aucune demande reçue pour le moment. Votre site est prêt à recevoir vos premiers clients !";
  } else {
    contextMsg = `Toutes les demandes ont été traitées. ${stats.weekCount > 0 ? `${stats.weekCount} reçue${stats.weekCount > 1 ? "s" : ""} cette semaine.` : ""}`;
  }

  return (
    <div className="dash-root">
      <style>{styles}</style>

      {/* ═══════ HERO ═══════ */}
      <div className="dash-hero">
        <div className="dash-hero__content">
          <h1 className="dash-hero__greeting">
            {greeting}, {firstName} <span className="dash-hero__wave">👋</span>
          </h1>
          <p className="dash-hero__msg">{contextMsg}</p>
          {stats.unread > 0 && (
            <a href="/admin/submissions" className="dash-hero__cta">
              <Mail size={14} strokeWidth={2.2} />
              Traiter les demandes
              <ChevronRight size={13} />
            </a>
          )}
        </div>

        {/* Tools menu */}
        <div className="dash-tools-wrap">
          <button
            className="dash-tools-btn"
            onClick={() => setToolsOpen(!toolsOpen)}
            aria-label="Outils avancés"
          >
            <MoreHorizontal size={16} />
          </button>
          {toolsOpen && (
            <>
              <div className="dash-tools-overlay" onClick={() => setToolsOpen(false)} />
              <div className="dash-tools-menu">
                <div className="dash-tools-menu__label">Outils avancés</div>
                <button
                  className="dash-tools-item"
                  onClick={() => { setToolsOpen(false); handleReseed(); }}
                  disabled={reseeding}
                >
                  <div className="dash-tools-item__icon">
                    <RefreshCw size={14} className={reseeding ? "dash-spin" : ""} />
                  </div>
                  <div className="dash-tools-item__text">
                    <span className="dash-tools-item__label">Synchroniser depuis Git</span>
                    <span className="dash-tools-item__desc">Réécrase les données avec le code source</span>
                  </div>
                </button>
                <div className="dash-tools-warn">
                  <AlertTriangle size={11} />
                  Action réservée aux administrateurs techniques
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reseed feedback toast */}
      {reseedMsg && (
        <div className={`dash-toast dash-toast--${reseedMsg.type}`}>
          {reseedMsg.type === "success" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          {reseedMsg.text}
        </div>
      )}

      {/* ═══════ 4 STATS ═══════ */}
      <div className="dash-stats">
        {/* Semaine */}
        <div className="dash-stat">
          <div className="dash-stat__top">
            <span className="dash-stat__label">Cette semaine</span>
            <div className="dash-stat__icon" style={{ background: "rgba(95,114,99,0.1)", color: "#5F7263" }}>
              <Calendar size={14} strokeWidth={2.2} />
            </div>
          </div>
          <div className="dash-stat__val">{stats.weekCount}</div>
          <div className="dash-stat__sub">
            demande{stats.weekCount !== 1 ? "s" : ""} reçue{stats.weekCount !== 1 ? "s" : ""}
          </div>
          {stats.weekTrend !== 0 && (
            <div className={`dash-stat__trend ${stats.weekTrend > 0 ? "dash-stat__trend--up" : "dash-stat__trend--down"}`}>
              {stats.weekTrend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(stats.weekTrend)}% vs semaine dernière
            </div>
          )}
        </div>

        {/* Non lues */}
        <div className={`dash-stat ${stats.unread > 0 ? "dash-stat--alert" : ""}`}>
          <div className="dash-stat__top">
            <span className="dash-stat__label">À traiter</span>
            <div className="dash-stat__icon" style={{
              background: stats.unread > 0 ? "rgba(220,38,38,0.1)" : "rgba(16,185,129,0.1)",
              color: stats.unread > 0 ? "#dc2626" : "#10b981",
            }}>
              {stats.unread > 0 ? <Mail size={14} strokeWidth={2.2} /> : <CheckCircle2 size={14} strokeWidth={2.2} />}
            </div>
          </div>
          <div className="dash-stat__val">{stats.unread}</div>
          <div className="dash-stat__sub">
            {stats.unread > 0 ? `nouvelle${stats.unread > 1 ? "s" : ""} demande${stats.unread > 1 ? "s" : ""}` : "Tout est à jour"}
          </div>
          {stats.unread > 0 && (
            <a href="/admin/submissions" className="dash-stat__link">
              Ouvrir la boîte de réception <ChevronRight size={11} />
            </a>
          )}
        </div>

        {/* Pipeline sur-mesure */}
        <div className="dash-stat">
          <div className="dash-stat__top">
            <span className="dash-stat__label">Pipeline sur-mesure</span>
            <div className="dash-stat__icon" style={{ background: "rgba(234,179,8,0.12)", color: "#d97706" }}>
              <Euro size={14} strokeWidth={2.2} />
            </div>
          </div>
          <div className="dash-stat__val">
            {(stats.pipelineTTC / 100).toLocaleString("fr-FR", { maximumFractionDigits: 0 })}€
          </div>
          <div className="dash-stat__sub">
            {stats.customCount} coffret{stats.customCount > 1 ? "s" : ""} TTC potentiel
          </div>
          {stats.pipelineLastWeek > 0 && (
            <div className="dash-stat__trend dash-stat__trend--up">
              <Sparkles size={11} />
              +{(stats.pipelineLastWeek / 100).toLocaleString("fr-FR", { maximumFractionDigits: 0 })}€ cette semaine
            </div>
          )}
        </div>

        {/* Catalogue */}
        <div className="dash-stat">
          <div className="dash-stat__top">
            <span className="dash-stat__label">Catalogue actif</span>
            <div className="dash-stat__icon" style={{ background: "rgba(135,163,141,0.12)", color: "#87A38D" }}>
              <Package size={14} strokeWidth={2.2} />
            </div>
          </div>
          <div className="dash-stat__val">{data.products.length}</div>
          <div className="dash-stat__sub">
            coffret{data.products.length > 1 ? "s" : ""} en ligne
          </div>
          <a href="/admin/products" className="dash-stat__link">
            Gérer le catalogue <ChevronRight size={11} />
          </a>
        </div>
      </div>

      {/* ═══════ MAIN GRID ═══════ */}
      <div className="dash-main">
        {/* LEFT: Recent submissions */}
        <div className="dash-card">
          <div className="dash-card__header">
            <div>
              <h2 className="dash-card__title">
                <Inbox size={15} strokeWidth={2.2} />
                Dernières demandes reçues
              </h2>
              <p className="dash-card__sub">Cliquez sur une demande pour voir le détail complet</p>
            </div>
            <a href="/admin/submissions" className="dash-card__link">
              Voir tout <ChevronRight size={13} />
            </a>
          </div>

          {stats.recent.length === 0 ? (
            <div className="dash-empty">
              <Inbox size={32} strokeWidth={1.3} />
              <p>Aucune demande pour le moment</p>
              <span>Les nouvelles demandes apparaîtront ici en temps réel</span>
            </div>
          ) : (
            <div className="dash-submissions">
              {stats.recent.map((sub) => {
                const initials = getInitials(sub.representative || sub.company || "??");
                const color = colorFromString(sub.company || sub.email);
                const isCustom = !!sub.customCoffret;
                return (
                  <a
                    key={sub.id}
                    href="/admin/submissions"
                    className={`dash-sub-row ${!sub.read ? "dash-sub-row--unread" : ""}`}
                  >
                    <div
                      className="dash-sub-row__avatar"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
                    >
                      {initials}
                    </div>
                    <div className="dash-sub-row__content">
                      <div className="dash-sub-row__top">
                        <span className="dash-sub-row__name">
                          {sub.company || sub.representative || "(Sans nom)"}
                          {!sub.read && <span className="dash-sub-row__dot" />}
                        </span>
                        <span className="dash-sub-row__time">{relativeTime(sub.date)}</span>
                      </div>
                      <div className="dash-sub-row__meta">
                        {isCustom ? (
                          <span className="dash-tag dash-tag--custom">
                            <Sparkles size={9} strokeWidth={2.5} />
                            Coffret sur-mesure · {(sub.customCoffret!.totalTTC / 100).toFixed(0)}€
                          </span>
                        ) : (
                          <span className="dash-tag">
                            <MessageSquareText size={9} strokeWidth={2.5} />
                            Devis standard
                          </span>
                        )}
                        <span className="dash-sub-row__email">{sub.email}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="dash-sub-row__chevron" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Quick actions + featured products */}
        <div className="dash-side">
          {/* Quick actions */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h2 className="dash-card__title">
                <Zap size={15} strokeWidth={2.2} />
                Actions rapides
              </h2>
            </div>
            <div className="dash-actions">
              {[
                { label: "Modifier les textes", desc: "Pages & contenu", href: "/admin/content", icon: FileText },
                { label: "Gérer les coffrets", desc: "Prêts à offrir", href: "/admin/products", icon: Package },
                { label: "Coffret sur-mesure", desc: "Configurateur", href: "/admin/custom-products", icon: SlidersHorizontal },
                { label: "Page À propos", desc: "Histoire & valeurs", href: "/admin/about", icon: Info },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <a key={a.href} href={a.href} className="dash-action">
                    <div className="dash-action__icon">
                      <Icon size={15} strokeWidth={2.2} />
                    </div>
                    <div className="dash-action__text">
                      <span className="dash-action__label">{a.label}</span>
                      <span className="dash-action__desc">{a.desc}</span>
                    </div>
                    <ChevronRight size={14} style={{ color: "#cbd5e1", flexShrink: 0 }} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Featured products */}
          {data.products.length > 0 && (
            <div className="dash-card">
              <div className="dash-card__header">
                <h2 className="dash-card__title">
                  <Package size={15} strokeWidth={2.2} />
                  Coffrets en ligne
                </h2>
                <a href="/admin/products" className="dash-card__link">
                  Voir tout <ChevronRight size={13} />
                </a>
              </div>
              <div className="dash-products">
                {data.products.slice(0, 4).map((p) => (
                  <a key={p.id} href={`/admin/products/${p.id}`} className="dash-product">
                    <div className="dash-product__thumb">
                      {p.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photo} alt={p.name} />
                      ) : (
                        <Package size={18} style={{ color: "#cbd5e1" }} />
                      )}
                    </div>
                    <div className="dash-product__content">
                      <span className="dash-product__name">{p.name}</span>
                      <span className="dash-product__price">{p.price}</span>
                    </div>
                    {p.featured && (
                      <span className="dash-product__badge">★</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Styles                                                      */
/* ============================================================ */

const styles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  .dash-spin { animation: spin 0.8s linear infinite; }

  .dash-root {
    font-family: var(--font-inter);
    padding: 28px 32px 80px;
    background: #f8f9fb;
    min-height: calc(100vh - 64px);
    animation: fadeIn 0.25s ease;
  }

  /* ═══════ HERO ═══════ */
  .dash-hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 28px 32px;
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    border: 1px solid #eef0f2;
    border-radius: 20px;
    margin-bottom: 20px;
    position: relative;
  }
  .dash-hero__content { flex: 1; min-width: 0; }
  .dash-hero__greeting {
    font-family: var(--font-manrope);
    font-weight: 900;
    font-size: 1.6rem;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.03em;
    display: flex; align-items: center; gap: 10px;
  }
  .dash-hero__wave {
    display: inline-block;
    animation: wave 2.5s ease-in-out infinite;
    transform-origin: 70% 70%;
    font-size: 1.3rem;
  }
  @keyframes wave {
    0%, 60%, 100% { transform: rotate(0deg); }
    10% { transform: rotate(14deg); }
    20% { transform: rotate(-8deg); }
    30% { transform: rotate(14deg); }
    40% { transform: rotate(-4deg); }
    50% { transform: rotate(10deg); }
  }
  .dash-hero__msg {
    font-size: 0.92rem;
    color: #64748b;
    margin: 8px 0 16px;
    line-height: 1.55;
    max-width: 640px;
  }
  .dash-hero__cta {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 20px;
    background: #5F7263; color: white;
    border-radius: 10px;
    font-family: var(--font-manrope);
    font-weight: 700; font-size: 0.82rem;
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(95,114,99,0.2);
  }
  .dash-hero__cta:hover {
    background: #4A5C4E;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(95,114,99,0.3);
  }

  /* ─── Tools menu ─── */
  .dash-tools-wrap { position: relative; flex-shrink: 0; }
  .dash-tools-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: white; border: 1px solid #e5e7eb;
    color: #94a3b8; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s ease;
  }
  .dash-tools-btn:hover {
    border-color: #87A38D; color: #5F7263; background: rgba(135,163,141,0.04);
  }
  .dash-tools-overlay {
    position: fixed; inset: 0; z-index: 50;
  }
  .dash-tools-menu {
    position: absolute; top: calc(100% + 6px); right: 0;
    min-width: 280px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
    z-index: 51;
    padding: 6px;
    animation: slideDown 0.2s ease;
  }
  .dash-tools-menu__label {
    font-size: 0.62rem; font-weight: 800;
    color: #9ca3af; text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 10px 12px 8px;
  }
  .dash-tools-item {
    display: flex; align-items: flex-start; gap: 12px;
    width: 100%; padding: 10px 12px;
    background: transparent; border: none;
    border-radius: 8px; text-align: left;
    font-family: inherit; cursor: pointer;
    transition: all 0.15s ease;
  }
  .dash-tools-item:hover:not(:disabled) { background: #f8f9fb; }
  .dash-tools-item:disabled { opacity: 0.5; cursor: wait; }
  .dash-tools-item__icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: rgba(135,163,141,0.1); color: #5F7263;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .dash-tools-item__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .dash-tools-item__label {
    font-family: var(--font-manrope); font-weight: 700;
    font-size: 0.82rem; color: #1a1f25;
  }
  .dash-tools-item__desc {
    font-size: 0.7rem; color: #9ca3af; line-height: 1.4;
  }
  .dash-tools-warn {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.66rem; color: #d97706;
    padding: 8px 12px 4px;
    margin-top: 4px;
    border-top: 1px solid #f3f4f6;
  }

  /* ─── Toast ─── */
  .dash-toast {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 18px;
    border-radius: 10px;
    margin-bottom: 16px;
    font-size: 0.82rem; font-weight: 600;
    animation: slideDown 0.3s ease;
  }
  .dash-toast--success {
    background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;
  }
  .dash-toast--error {
    background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;
  }

  /* ═══════ STATS ═══════ */
  .dash-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 20px;
  }
  .dash-stat {
    background: white;
    border: 1px solid #eef0f2;
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s ease;
    position: relative;
  }
  .dash-stat:hover {
    border-color: #d4d8de;
    box-shadow: 0 6px 20px rgba(0,0,0,0.04);
    transform: translateY(-2px);
  }
  .dash-stat--alert {
    background: linear-gradient(135deg, #fff 0%, #fef2f2 100%);
    border-color: rgba(220,38,38,0.2);
  }
  .dash-stat__top {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 16px;
  }
  .dash-stat__label {
    font-size: 0.72rem; font-weight: 700;
    color: #6b7280; text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .dash-stat__icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .dash-stat__val {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 2rem; color: #0f172a;
    letter-spacing: -0.035em; line-height: 1;
  }
  .dash-stat__sub {
    font-size: 0.74rem; color: #9ca3af;
    margin-top: 6px; font-weight: 500;
  }
  .dash-stat__trend {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.68rem; font-weight: 700;
    padding: 4px 8px; border-radius: 6px;
    margin-top: 12px;
  }
  .dash-stat__trend--up {
    background: rgba(16,185,129,0.1); color: #047857;
  }
  .dash-stat__trend--down {
    background: rgba(220,38,38,0.1); color: #b91c1c;
  }
  .dash-stat__link {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 0.7rem; font-weight: 700;
    color: #5F7263; text-decoration: none;
    margin-top: 12px;
    transition: gap 0.15s ease;
  }
  .dash-stat__link:hover { gap: 6px; }

  /* ═══════ MAIN GRID ═══════ */
  .dash-main {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 16px;
  }
  .dash-side { display: flex; flex-direction: column; gap: 16px; }

  .dash-card {
    background: white;
    border: 1px solid #eef0f2;
    border-radius: 16px;
    padding: 22px 24px;
  }
  .dash-card__header {
    display: flex; justify-content: space-between; align-items: flex-start;
    gap: 12px; margin-bottom: 18px;
  }
  .dash-card__title {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--font-manrope); font-weight: 800;
    font-size: 1rem; color: #1a1f25;
    margin: 0; letter-spacing: -0.01em;
  }
  .dash-card__title svg { color: #5F7263; }
  .dash-card__sub {
    font-size: 0.74rem; color: #9ca3af;
    margin: 4px 0 0; font-weight: 500;
  }
  .dash-card__link {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 0.76rem; font-weight: 700;
    color: #5F7263; text-decoration: none;
    padding: 6px 10px; border-radius: 8px;
    transition: background 0.15s ease;
  }
  .dash-card__link:hover { background: rgba(135,163,141,0.08); }

  /* ─── Submissions list ─── */
  .dash-submissions { display: flex; flex-direction: column; gap: 4px; }
  .dash-sub-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px;
    border-radius: 12px;
    background: transparent;
    text-decoration: none; color: inherit;
    transition: all 0.15s ease;
  }
  .dash-sub-row:hover {
    background: #fafbfc;
  }
  .dash-sub-row--unread {
    background: rgba(135,163,141,0.04);
  }
  .dash-sub-row__avatar {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white;
    font-family: var(--font-manrope);
    font-weight: 800; font-size: 0.78rem;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }
  .dash-sub-row__content { flex: 1; min-width: 0; }
  .dash-sub-row__top {
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 8px; margin-bottom: 4px;
  }
  .dash-sub-row__name {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--font-manrope); font-weight: 700;
    font-size: 0.86rem; color: #1a1f25;
    letter-spacing: -0.01em;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .dash-sub-row--unread .dash-sub-row__name { font-weight: 800; color: #0f172a; }
  .dash-sub-row__dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #10b981;
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }
  .dash-sub-row__time {
    font-size: 0.7rem; color: #9ca3af;
    white-space: nowrap; flex-shrink: 0;
  }
  .dash-sub-row__meta {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.72rem;
  }
  .dash-tag {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 2px 8px; border-radius: 999px;
    background: #f3f4f6; color: #6b7280;
    font-family: var(--font-manrope);
    font-size: 0.62rem; font-weight: 700;
    flex-shrink: 0;
  }
  .dash-tag--custom {
    background: rgba(234,179,8,0.12); color: #d97706;
  }
  .dash-sub-row__email {
    font-size: 0.7rem; color: #9ca3af;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    min-width: 0;
  }
  .dash-sub-row__chevron {
    color: #cbd5e1; flex-shrink: 0;
    transition: all 0.15s ease;
  }
  .dash-sub-row:hover .dash-sub-row__chevron {
    color: #5F7263; transform: translateX(2px);
  }

  /* ─── Empty ─── */
  .dash-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 10px; padding: 48px 20px;
    text-align: center; color: #9ca3af;
  }
  .dash-empty svg { color: #d4d8de; }
  .dash-empty p {
    font-family: var(--font-manrope); font-weight: 700;
    font-size: 0.88rem; color: #6b7280; margin: 0;
  }
  .dash-empty span { font-size: 0.78rem; margin: 0; }

  /* ─── Quick actions ─── */
  .dash-actions { display: flex; flex-direction: column; gap: 6px; }
  .dash-action {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 11px;
    background: transparent;
    text-decoration: none; color: inherit;
    transition: all 0.15s ease;
  }
  .dash-action:hover { background: #fafbfc; }
  .dash-action__icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(135,163,141,0.1); color: #5F7263;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }
  .dash-action:hover .dash-action__icon {
    background: #5F7263; color: white;
  }
  .dash-action__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .dash-action__label {
    font-family: var(--font-manrope); font-weight: 700;
    font-size: 0.82rem; color: #1a1f25;
    letter-spacing: -0.01em;
  }
  .dash-action__desc { font-size: 0.68rem; color: #9ca3af; }

  /* ─── Products ─── */
  .dash-products { display: flex; flex-direction: column; gap: 4px; }
  .dash-product {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 11px;
    background: transparent;
    text-decoration: none; color: inherit;
    transition: all 0.15s ease;
    position: relative;
  }
  .dash-product:hover { background: #fafbfc; }
  .dash-product__thumb {
    width: 44px; height: 44px; border-radius: 10px;
    background: #f3f4f6; border: 1px solid #eef0f2;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0;
  }
  .dash-product__thumb img { width: 100%; height: 100%; object-fit: cover; }
  .dash-product__content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .dash-product__name {
    font-family: var(--font-manrope); font-weight: 700;
    font-size: 0.82rem; color: #1a1f25;
    letter-spacing: -0.01em;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .dash-product__price {
    font-size: 0.7rem; color: #5F7263; font-weight: 700;
  }
  .dash-product__badge {
    font-size: 1rem;
    color: #f59e0b;
    flex-shrink: 0;
  }

  /* ─── Loading ─── */
  .dash-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 60vh; gap: 14px;
    color: #6b7280; font-size: 0.9rem;
    font-family: var(--font-inter);
  }
  .dash-spinner {
    width: 32px; height: 32px;
    border: 3px solid #eef0f2; border-top-color: #5F7263;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }

  @media (max-width: 1024px) {
    .dash-stats { grid-template-columns: repeat(2, 1fr); }
    .dash-main { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .dash-stats { grid-template-columns: 1fr; }
    .dash-root { padding: 20px 16px 60px; }
    .dash-hero { padding: 22px 20px; }
  }
`;
