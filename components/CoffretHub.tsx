"use client";

import { useState, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import ProductSection from "./ProductSection";
import PriceSimulator from "./PriceSimulator";

interface CoffretHubProps {
  products?: any[];
  simulatorProducts?: any[];
}

export default function CoffretHub({ products, simulatorProducts }: CoffretHubProps) {
  const [activeTab, setActiveTab] = useState<"coffrets" | "simulateur">("coffrets");
  const sectionRef = useRef<HTMLElement>(null);

  const switchTab = (tab: "coffrets" | "simulateur") => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  };

  return (
    <section id="produits" ref={sectionRef} style={{ position: "relative", scrollMarginTop: "60px" }}>
      {activeTab === "coffrets" ? (
        <ProductSection key={`c-${activeTab}`} products={products} activeTab={activeTab} onSwitchTab={switchTab} />
      ) : (
        <div>
          {/* Tabs for simulator mode */}
          <div style={{
            display: "flex", justifyContent: "center", gap: "8px",
            padding: "20px 32px",
            background: "var(--cream-dark)",
          }}>
            <TabButton label="Nos coffrets" tab="coffrets" activeTab={activeTab} onClick={() => switchTab("coffrets")} />
            <TabButton label="Calculer mon prix" tab="simulateur" activeTab={activeTab} onClick={() => switchTab("simulateur")} />
          </div>
          <PriceSimulator key={`s-${activeTab}`} products={simulatorProducts} />
        </div>
      )}
    </section>
  );
}

function TabButton({ label, tab, activeTab, onClick }: { label: string; tab: string; activeTab: string; onClick: () => void }) {
  const isActive = tab === activeTab;
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "12px 24px", borderRadius: "999px",
      fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem",
      cursor: "pointer", border: isActive ? "none" : "1.5px solid rgba(135,163,141,0.15)",
      background: isActive ? "var(--green-deep)" : "white",
      color: isActive ? "white" : "var(--text-mid)",
      boxShadow: isActive ? "0 6px 20px rgba(45,74,62,0.2)" : "none",
      transition: "all 0.3s ease",
    }}>
      {label}
    </button>
  );
}
