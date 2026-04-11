"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Package,
  Inbox,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Bell,
  MessageCircle,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: "menu" | "general";
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, group: "menu" },
  { label: "Pages & contenu", href: "/admin/content", icon: FileText, group: "menu" },
  { label: "Page À propos", href: "/admin/about", icon: Info, group: "menu" },
  { label: "Coffrets", href: "/admin/products", icon: Package, group: "menu" },
  { label: "Coffret sur-mesure", href: "/admin/custom-products", icon: SlidersHorizontal, group: "menu" },
  { label: "Boîte de réception", href: "/admin/submissions", icon: Inbox, group: "menu" },
  { label: "Paramètres", href: "#", icon: Settings, group: "general" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/admin/submissions");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(Array.isArray(data) ? data.filter((s: { read: boolean }) => !s.read).length : 0);
        }
      } catch { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const isActive = (item: NavItem) =>
    pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

  const currentPage =
    NAV_ITEMS.find((i) => isActive(i))?.label || "Admin";

  const isContentPage = pathname === "/admin/content";

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "var(--font-inter)",
      background: "#f4f5f7",
    }}>
      <style>{`
        @keyframes fadeOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulseNav {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ---- Sidebar nav ---- */
        .adm-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 480;
          color: #64748b;
          transition: all 0.15s ease;
          margin-bottom: 2px;
          white-space: nowrap;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
          font-family: inherit;
          position: relative;
        }
        .adm-nav-item:hover {
          color: #5F7263;
          background: rgba(45,74,62,0.05);
        }
        .adm-nav-item.active {
          color: #5F7263;
          background: rgba(45,74,62,0.08);
          font-weight: 600;
        }
        .adm-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 22px;
          border-radius: 0 4px 4px 0;
          background: #5F7263;
        }
        .adm-nav-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .adm-nav-item.active .adm-nav-icon {
          background: #5F7263;
          color: white;
        }
        .adm-nav-item:not(.active) .adm-nav-icon {
          background: transparent;
          color: #94a3b8;
        }
        .adm-nav-item:hover:not(.active) .adm-nav-icon {
          color: #5F7263;
        }
        .adm-nav-badge {
          margin-left: auto;
          min-width: 22px;
          height: 22px;
          border-radius: 11px;
          background: #5F7263;
          color: white;
          font-size: 0.68rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
        }
        .adm-group-label {
          font-size: 0.65rem;
          font-weight: 650;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 0 16px;
          margin: 20px 0 8px;
        }
        .adm-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 11px 16px;
          background: none;
          border: none;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 480;
          color: #94a3b8;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .adm-logout:hover {
          background: #fef2f2;
          color: #dc2626;
        }
        .adm-header-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .adm-header-btn:hover {
          border-color: #5F7263;
          color: #5F7263;
          background: rgba(45,74,62,0.03);
        }
        .adm-whatsapp {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 11px 16px;
          background: rgba(37, 211, 102, 0.08);
          border: none;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #128C7E;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .adm-whatsapp:hover {
          background: rgba(37, 211, 102, 0.15);
          color: #075E54;
        }
        .adm-whatsapp__icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
      `}</style>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 998,
            animation: "fadeOverlay 0.2s ease",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* ============================================================ */}
      {/*  SIDEBAR — White, minimal, Donezo-style                       */}
      {/* ============================================================ */}
      <aside
        style={{
          width: sidebarOpen ? "260px" : "0px",
          background: "white",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #eef0f2",
          ...(isMobile
            ? {
                position: "fixed", top: 0, left: 0, bottom: 0,
                zIndex: 999, width: sidebarOpen ? "280px" : "0px",
                boxShadow: sidebarOpen ? "8px 0 32px rgba(0,0,0,0.08)" : "none",
              }
            : {}),
        }}
      >
        {/* Brand */}
        <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "#5F7263",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Image
              src="/O_MEA_SYMBOLE-CREME.png"
              alt="O'Méa"
              width={28}
              height={28}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div style={{ whiteSpace: "nowrap" }}>
            <p style={{
              fontFamily: "var(--font-manrope)",
              fontWeight: 800,
              fontSize: "1.05rem",
              color: "#1e293b",
              margin: 0,
              letterSpacing: "-0.02em",
            }}>
              O&apos;Mea
            </p>
            <p style={{ fontSize: "0.68rem", color: "#94a3b8", margin: 0, fontWeight: 450 }}>
              Back-office
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "0 10px", flex: 1 }}>
          <p className="adm-group-label">Menu</p>
          {NAV_ITEMS.filter((i) => i.group === "menu").map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            const badge = item.href === "/admin/submissions" ? unreadCount : 0;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`adm-nav-item${active ? " active" : ""}`}
                onClick={() => { if (isMobile) setSidebarOpen(false); }}
              >
                <div className="adm-nav-icon">
                  <Icon size={18} strokeWidth={active ? 2 : 1.7} />
                </div>
                <span>{item.label}</span>
                {badge > 0 && <span className="adm-nav-badge">{badge > 99 ? "99+" : badge}</span>}
              </a>
            );
          })}

          <p className="adm-group-label">Général</p>
          {NAV_ITEMS.filter((i) => i.group === "general").map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.href} href={item.href} className="adm-nav-item">
                <div className="adm-nav-icon">
                  <Icon size={18} strokeWidth={1.7} />
                </div>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 10px 16px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "6px" }}>
          <a
            href="https://wa.me/33756971031"
            target="_blank"
            rel="noopener noreferrer"
            className="adm-whatsapp"
          >
            <div className="adm-whatsapp__icon">
              <MessageCircle size={16} />
            </div>
            <span>Support WhatsApp</span>
          </a>
          <button onClick={handleLogout} className="adm-logout">
            <LogOut size={18} strokeWidth={1.7} />
            Se deconnecter
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/*  MAIN CONTENT                                                  */}
      {/* ============================================================ */}
      <main style={{
        flex: 1, minWidth: 0,
        ...(isContentPage ? { height: "100vh", overflow: "hidden" } : {}),
      }}>
        {/* Header */}
        <header style={{
          background: "white",
          padding: "0 32px",
          height: "64px",
          borderBottom: "1px solid #eef0f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 50,
          position: "sticky" as const, top: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="adm-header-btn"
              style={{ width: "36px", height: "36px" }}
            >
              {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeft size={17} />}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Notification bell */}
            <button className="adm-header-btn" style={{ position: "relative" }}>
              <Bell size={17} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: "6px", right: "6px",
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#ef4444", border: "2px solid white",
                }} />
              )}
            </button>

            {/* User */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "6px 16px 6px 6px",
              borderRadius: "999px",
              background: "rgba(95,114,99,0.04)",
              border: "1px solid rgba(95,114,99,0.1)",
              cursor: "default",
              transition: "all 0.2s ease",
            }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "linear-gradient(135deg, #5F7263, #87A38D)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-manrope)",
                fontSize: "0.8rem", fontWeight: 800, color: "white",
                letterSpacing: "-0.01em",
                boxShadow: "0 2px 6px rgba(95,114,99,0.25)",
                flexShrink: 0,
              }}>
                CR
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <p style={{
                  fontFamily: "var(--font-manrope)",
                  fontSize: "0.82rem", fontWeight: 800, color: "#5F7263",
                  margin: 0, lineHeight: 1.25, letterSpacing: "-0.01em",
                }}>
                  Catherine Rey
                </p>
                <p style={{
                  fontSize: "0.58rem", color: "#94a3b8",
                  margin: 0, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                }}>
                  Administratrice
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{
          padding: isContentPage ? "0" : "28px 32px",
          ...(isContentPage ? { height: "calc(100vh - 64px)", overflow: "hidden" } : {}),
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}
