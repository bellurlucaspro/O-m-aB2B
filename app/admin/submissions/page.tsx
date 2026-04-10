"use client";

import { useEffect, useState } from "react";

interface Submission {
  id: string;
  date: string;
  company: string;
  representative: string;
  role: string;
  email: string;
  phone: string;
  tva: string;
  siret: string;
  quantity: string;
  message: string;
  read: boolean;
}

const ACCENT = "#5F7263";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des soumissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const unreadCount = submissions.filter((s) => !s.read).length;

  const filteredSubmissions = submissions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.company.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.representative.toLowerCase().includes(q)
    );
  });

  const markAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, read: true } : s))
        );
        if (selected?.id === id) {
          setSelected((prev) => (prev ? { ...prev, read: true } : null));
        }
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Manrope, sans-serif",
                fontWeight: 800,
                fontSize: "1.75rem",
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              Demandes de devis
            </h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: "0.88rem" }}>
              {submissions.length} demande{submissions.length !== 1 ? "s" : ""} au total
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {unreadCount > 0 && (
              <div
                style={{
                  background: ACCENT,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  padding: "6px 16px",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  animation: "pulse 2s infinite",
                }} />
                {unreadCount} non lue{unreadCount !== 1 ? "s" : ""}
              </div>
            )}
            <button
              style={{
                padding: "8px 16px",
                background: "#f3f4f6",
                color: "#6b7280",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={() => alert("Fonctionnalité d'export à venir")}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
              }}
            >
              ↗ Exporter
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: "relative", maxWidth: "400px" }}>
            <span style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              fontSize: "0.9rem",
            }}>
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par entreprise, email..."
              style={{
                width: "100%",
                padding: "10px 14px 10px 40px",
                border: "1.5px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.88rem",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#87A38D";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(135,163,141,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{
              width: "36px",
              height: "36px",
              border: "3px solid #f3f4f6",
              borderTop: `3px solid ${ACCENT}`,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }} />
            <p style={{ color: "#6b7280", fontSize: "0.88rem" }}>Chargement...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && submissions.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
              padding: "80px 24px",
              textAlign: "center",
            }}
          >
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(45,74,62,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "2.5rem",
            }}>
              📩
            </div>
            <p
              style={{
                fontFamily: "Manrope, sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: ACCENT,
                margin: "0 0 8px",
              }}
            >
              Aucune demande de devis pour le moment
            </p>
            <p style={{ color: "#6b7280", fontSize: "0.88rem", margin: 0 }}>
              Les nouvelles demandes apparaîtront ici.
            </p>
          </div>
        )}

        {/* No results from search */}
        {!loading && submissions.length > 0 && filteredSubmissions.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
              padding: "40px 24px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              Aucun résultat pour &laquo; {searchQuery} &raquo;
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filteredSubmissions.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.88rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    borderBottom: "2px solid #f3f4f6",
                  }}
                >
                  {[
                    "Date",
                    "Entreprise",
                    "Représentant",
                    "Email",
                    "Téléphone",
                    "Quantité",
                    "Statut",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#6b7280",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((s, index) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      cursor: "pointer",
                      background: index % 2 === 0
                        ? (s.read ? "#fff" : "rgba(45,74,62,0.02)")
                        : (s.read ? "#fafbfc" : "rgba(45,74,62,0.04)"),
                      transition: "all 0.15s ease",
                      fontWeight: s.read ? 400 : 500,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(45,74,62,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = index % 2 === 0
                        ? (s.read ? "#fff" : "rgba(45,74,62,0.02)")
                        : (s.read ? "#fafbfc" : "rgba(45,74,62,0.04)");
                    }}
                  >
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "0.85rem", color: "#374151" }}>{formatDate(s.date)}</div>
                      <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "2px" }}>{relativeTime(s.date)}</div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#111827", fontWeight: s.read ? 400 : 600 }}>{s.company}</td>
                    <td style={{ padding: "14px 16px", color: "#374151" }}>{s.representative}</td>
                    <td style={{ padding: "14px 16px", color: ACCENT }}>{s.email}</td>
                    <td style={{ padding: "14px 16px", color: "#374151" }}>{s.phone}</td>
                    <td style={{ padding: "14px 16px", color: "#374151" }}>{s.quantity}</td>
                    <td style={{ padding: "14px 16px" }}>
                      {s.read ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 99,
                            fontSize: "0.72rem",
                            fontWeight: 500,
                            background: "#f3f4f6",
                            color: "#6b7280",
                          }}
                        >
                          Lue
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "3px 10px",
                            borderRadius: 99,
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            background: ACCENT,
                            color: "#fff",
                          }}
                        >
                          <span style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#10b981",
                            animation: "pulse 2s infinite",
                          }} />
                          Non lue
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-in Panel */}
      {selected && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 1000,
              animation: "fadeIn 0.2s ease",
            }}
            onClick={() => setSelected(null)}
          />

          {/* Panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              maxWidth: "520px",
              background: "#fff",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.12)",
              zIndex: 1001,
              overflow: "auto",
              fontFamily: "Inter, sans-serif",
              animation: "slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Panel Header */}
            <div
              style={{
                padding: "24px 28px 16px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "white",
                zIndex: 1,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h2
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontWeight: 800,
                      fontSize: "1.2rem",
                      color: ACCENT,
                      margin: 0,
                    }}
                  >
                    {selected.company}
                  </h2>
                  {!selected.read && (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "99px",
                      background: ACCENT,
                      color: "white",
                    }}>
                      <span style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#10b981",
                        animation: "pulse 2s infinite",
                      }} />
                      Nouvelle
                    </span>
                  )}
                </div>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "0.82rem",
                    margin: 0,
                  }}
                >
                  {formatDate(selected.date)} &middot; {relativeTime(selected.date)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  color: "#6b7280",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                aria-label="Fermer"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
                }}
              >
                &times;
              </button>
            </div>

            {/* Panel Body */}
            <div style={{ padding: "20px 28px" }}>
              {[
                { label: "Entreprise", value: selected.company },
                { label: "Représentant", value: selected.representative },
                { label: "Fonction", value: selected.role },
                { label: "Email", value: selected.email },
                { label: "Téléphone", value: selected.phone },
                { label: "N\u00b0 TVA", value: selected.tva },
                { label: "SIRET", value: selected.siret },
                { label: "Quantité souhaitée", value: selected.quantity },
              ].map(({ label, value }, idx) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    borderBottom: "1px solid #f3f4f6",
                    background: idx % 2 === 1 ? "rgba(249,250,251,0.5)" : "transparent",
                    margin: "0 -28px",
                    padding: "12px 28px",
                  }}
                >
                  <span
                    style={{
                      width: 140,
                      flexShrink: 0,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: "0.88rem", color: "#111827" }}>
                    {value || "\u2014"}
                  </span>
                </div>
              ))}

              {/* Message */}
              <div style={{ marginTop: 20 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "#6b7280",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Message
                </span>
                <div
                  style={{
                    background: "#f9fafb",
                    borderRadius: 10,
                    padding: "16px 18px",
                    fontSize: "0.88rem",
                    color: "#374151",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    minHeight: 60,
                    border: "1px solid #f3f4f6",
                  }}
                >
                  {selected.message || "Aucun message."}
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div
              style={{
                padding: "16px 28px 28px",
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                borderTop: "1px solid #f3f4f6",
                position: "sticky",
                bottom: 0,
                background: "white",
              }}
            >
              {!selected.read && (
                <button
                  onClick={() => markAsRead(selected.id)}
                  disabled={actionLoading === selected.id}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: ACCENT,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: actionLoading === selected.id ? "not-allowed" : "pointer",
                    opacity: actionLoading === selected.id ? 0.6 : 1,
                    fontFamily: "Inter, sans-serif",
                    transition: "all 0.2s ease",
                  }}
                >
                  {actionLoading === selected.id ? "..." : "Marquer comme lue"}
                </button>
              )}
              <button
                onClick={() => deleteSubmission(selected.id)}
                disabled={actionLoading === selected.id}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#fef2f2",
                  color: "#dc2626",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: actionLoading === selected.id ? "not-allowed" : "pointer",
                  opacity: actionLoading === selected.id ? 0.6 : 1,
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                {actionLoading === selected.id ? "..." : "Supprimer"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
