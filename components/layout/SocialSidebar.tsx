"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/omea.cie/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@omea.cie",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/omea.cie",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/catherine-rey-65056b76/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
      </svg>
    ),
  },
];

export default function SocialSidebar() {
  const pathname = usePathname();
  const [whatsappHovered, setWhatsappHovered] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Hide on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <style>{`
        .social-sidebar {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 999;
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow: hidden;
          border: 1.5px solid rgba(45,74,62,0.15);
          border-right: none;
          border-radius: 12px 0 0 12px;
        }
        .social-sidebar__link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          color: var(--green-deep);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
          position: relative;
        }
        .social-sidebar__link:hover {
          background: var(--pink-dark) !important;
          transform: scale(1.08);
        }
        .social-sidebar__link:first-child {
          border-radius: 12px 0 0 0;
        }
        .social-sidebar__link:last-child {
          border-radius: 0 0 0 12px;
        }
        .social-sidebar__tooltip {
          position: absolute;
          right: 54px;
          background: var(--cream-dark);
          color: var(--green-deep);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transform: translateX(8px);
          transition: all 0.25s ease;
          font-family: var(--font-inter);
        }
        .social-sidebar__link:hover .social-sidebar__tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        /* WhatsApp floating button */
        .whatsapp-btn {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 999;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #D4956B;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(212, 149, 107, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          text-decoration: none;
        }
        .whatsapp-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(212, 149, 107, 0.5);
        }
        .whatsapp-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #D4956B;
          animation: whatsappPulse 2s ease-in-out infinite;
        }
        @keyframes whatsappPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0; }
        }
        .whatsapp-label {
          position: absolute;
          bottom: 68px;
          right: 0;
          background: var(--cream);
          color: var(--text-dark);
          font-family: var(--font-inter);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          white-space: nowrap;
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.3s ease;
          pointer-events: none;
        }
        .whatsapp-label.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .whatsapp-label::after {
          content: '';
          position: absolute;
          bottom: -6px;
          right: 24px;
          width: 12px;
          height: 12px;
          background: var(--cream);
          transform: rotate(45deg);
          border-radius: 2px;
        }

        @media (max-width: 768px) {
          .social-sidebar { display: none; }
          .whatsapp-btn {
            width: 52px;
            height: 52px;
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>

      {/* Social sidebar — right edge */}
      <div className="social-sidebar">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-sidebar__link"
            style={{ background: "var(--pink)" }}
            aria-label={s.name}
          >
            {s.icon}
            <span className="social-sidebar__tooltip">{s.name}</span>
          </a>
        ))}
      </div>

      {/* WhatsApp floating button */}
      <button
        type="button"
        className="whatsapp-btn"
        onMouseEnter={() => setWhatsappHovered(true)}
        onMouseLeave={() => setWhatsappHovered(false)}
        onClick={() => setChatOpen(true)}
        aria-label="Ouvrir le chat WhatsApp"
      >
        <div className="whatsapp-pulse" />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
        <div className={`whatsapp-label ${whatsappHovered && !chatOpen ? "visible" : ""}`}>
          Discutons sur WhatsApp
        </div>
      </button>

      {/* WhatsApp Chat Widget */}
      <WhatsAppChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

/* ═══════ Private Chat Widget ═══════ */
interface ChatMsg {
  from: "bot" | "user";
  text: string;
  time: string;
}

function WhatsAppChatWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { from: "bot", text: "👋 Bonjour ! Je suis l'équipe O'Méa. Comment puis-je vous aider aujourd'hui ?", time: "" },
  ]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "J'aimerais demander un devis",
    "J'ai une question sur un coffret",
    "Je souhaite commander en gros",
    "Autre demande",
  ];

  const now = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, sending]);

  const handleQuickReply = (text: string) => {
    setInput(text);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setShowForm(true);
      return;
    }

    // Add user message
    setMessages(prev => [...prev, { from: "user", text, time: now() }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: "",
          representative: name || "Visiteur chat",
          email,
          phone: "",
          message: `[CHAT LIVE] ${text}`,
        }),
      });
      if (!res.ok) throw new Error("fail");

      // Simulate typing + bot reply
      setTimeout(() => {
        setMessages(prev => [...prev, {
          from: "bot",
          text: "✅ Parfait, votre message est bien arrivé dans notre boîte. Un membre de l'équipe O'Méa vous répondra à " + email + " sous 1h.",
          time: now(),
        }]);
        setSending(false);
        setSent(true);
      }, 900);
    } catch {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          from: "bot",
          text: "⚠️ Désolé, une erreur est survenue. Vous pouvez nous contacter directement à pro@o-mea.fr",
          time: now(),
        }]);
        setSending(false);
      }, 600);
    }
  };

  const handleFirstSubmit = () => {
    if (!name.trim() || !email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setShowForm(false);
    setMessages(prev => [...prev, {
      from: "bot",
      text: `Enchanté ${name.split(" ")[0]} ! Posez-moi votre question, je vous réponds sous 1h directement par email.`,
      time: now(),
    }]);
  };

  if (!open) return null;

  return (
    <div className="wa-widget">
      <style>{`
        @keyframes waSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes waPop {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wa-widget {
          position: fixed;
          bottom: 104px;
          right: 28px;
          z-index: 1000;
          width: 340px;
          max-width: calc(100vw - 40px);
          max-height: 540px;
          background: #E5DDD5;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: waSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: var(--font-inter);
        }
        .wa-header {
          background: #075E54;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          flex-shrink: 0;
        }
        .wa-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: white;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-manrope);
          font-weight: 900; font-size: 0.9rem;
          color: #075E54;
          flex-shrink: 0;
          overflow: hidden;
        }
        .wa-header-info { flex: 1; min-width: 0; }
        .wa-header-name {
          font-family: var(--font-manrope);
          font-weight: 700; font-size: 0.92rem;
          margin: 0;
          line-height: 1.2;
        }
        .wa-header-status {
          font-size: 0.68rem;
          opacity: 0.85;
          margin: 2px 0 0;
          display: flex; align-items: center; gap: 4px;
        }
        .wa-status-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #25D366;
          display: inline-block;
        }
        .wa-close {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          opacity: 0.8;
          transition: opacity 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .wa-close:hover { opacity: 1; }
        .wa-body {
          flex: 1;
          overflow-y: auto;
          padding: 18px 14px;
          background: #E5DDD5;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.03'%3E%3Cpath d='M30 30c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z'/%3E%3C/g%3E%3C/svg%3E");
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .wa-msg {
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.82rem;
          line-height: 1.4;
          color: #303030;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
          animation: waPop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .wa-msg--received {
          background: white;
          align-self: flex-start;
          border-top-left-radius: 2px;
        }
        .wa-msg--sent {
          background: #DCF8C6;
          align-self: flex-end;
          border-top-right-radius: 2px;
        }
        .wa-typing {
          padding: 12px 14px !important;
          display: inline-flex !important;
          gap: 4px;
          align-items: center;
        }
        .wa-typing span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #999;
          animation: waTyping 1.3s infinite ease-in-out;
        }
        .wa-typing span:nth-child(2) { animation-delay: 0.15s; }
        .wa-typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes waTyping {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        .wa-msg-time {
          font-size: 0.58rem;
          color: #999;
          margin-top: 3px;
          text-align: right;
        }
        .wa-quick-replies {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 10px;
          align-items: flex-start;
        }
        .wa-quick-btn {
          background: white;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 8px 14px;
          border-radius: 16px;
          font-size: 0.78rem;
          color: #075E54;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          max-width: 85%;
          text-align: left;
        }
        .wa-quick-btn:hover {
          background: #075E54;
          color: white;
          border-color: #075E54;
          transform: translateX(2px);
        }
        .wa-footer {
          background: #F0F2F5;
          padding: 10px 12px;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .wa-name-input {
          width: 100%;
          padding: 9px 14px;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.08);
          background: white;
          font-size: 0.82rem;
          outline: none;
          font-family: inherit;
          margin-bottom: 6px;
        }
        .wa-name-input:focus { border-color: #25D366; }
        .wa-input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 20px;
          border: none;
          background: white;
          font-size: 0.85rem;
          outline: none;
          font-family: inherit;
          resize: none;
          max-height: 100px;
          line-height: 1.4;
        }
        .wa-send {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #25D366;
          border: none;
          color: white;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .wa-send:hover { transform: scale(1.08); }
        .wa-send:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        .wa-powered {
          font-size: 0.6rem;
          color: #999;
          text-align: center;
          padding: 6px 0 8px;
          background: #F0F2F5;
        }
        @media (max-width: 480px) {
          .wa-widget {
            right: 16px;
            left: 16px;
            bottom: 90px;
            width: auto;
            max-width: none;
          }
        }
      `}</style>

      {/* Header */}
      <div className="wa-header">
        <div className="wa-avatar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/O_MEA_SYMBOLE-CREME.png" alt="O'Méa" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div className="wa-header-info">
          <p className="wa-header-name">O&apos;Méa</p>
          <p className="wa-header-status">
            <span className="wa-status-dot" /> En ligne — Réponse sous 1h
          </p>
        </div>
        <button className="wa-close" onClick={onClose} aria-label="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="wa-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`wa-msg ${m.from === "bot" ? "wa-msg--received" : "wa-msg--sent"}`}
          >
            {m.text}
            {m.time && <div className="wa-msg-time">{m.time}</div>}
          </div>
        ))}

        {/* Quick replies — only before first user msg */}
        {showForm && messages.length === 1 && (
          <div className="wa-quick-replies">
            {quickReplies.map((q) => (
              <button key={q} className="wa-quick-btn" onClick={() => handleQuickReply(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {sending && (
          <div className="wa-msg wa-msg--received wa-typing">
            <span /><span /><span />
          </div>
        )}
      </div>

      {/* Footer */}
      {showForm ? (
        <div style={{ background: "#F0F2F5", padding: "12px 14px" }}>
          <p style={{ fontSize: "0.7rem", color: "#666", margin: "0 0 8px", fontWeight: 600 }}>
            Pour commencer, quelques informations :
          </p>
          <input
            className="wa-name-input"
            type="text"
            placeholder="Votre prénom *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="wa-name-input"
            type="email"
            placeholder="Votre email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <button
            onClick={handleFirstSubmit}
            disabled={!name.trim() || !email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)}
            style={{
              width: "100%", padding: "10px", borderRadius: "20px",
              background: "#25D366", color: "white", border: "none",
              fontFamily: "inherit", fontWeight: 700, fontSize: "0.82rem",
              cursor: "pointer", transition: "all 0.2s ease",
              opacity: (!name.trim() || !email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) ? 0.5 : 1,
            }}
          >
            Commencer la conversation
          </button>
        </div>
      ) : (
        <div className="wa-footer">
          <textarea
            className="wa-input"
            rows={1}
            placeholder={sent ? "Envoyer un autre message…" : "Tapez votre message…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            disabled={sending}
          />
          <button
            className="wa-send"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            aria-label="Envoyer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      )}
      <div className="wa-powered">
        🔒 Messagerie privée — réponse directement par email
      </div>
    </div>
  );
}
