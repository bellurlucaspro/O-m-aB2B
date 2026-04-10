"use client";

import AnimatedCounter from "./AnimatedCounter";

interface StatCardProps {
  value: string;
  label: string;
  dark?: boolean;
}

export default function StatCard({ value, label, dark = false }: StatCardProps) {
  const numMatch = value.match(/(\+?)(\d+)(%?)/);

  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-manrope)",
          fontWeight: 900,
          fontSize: "2.2rem",
          color: dark ? "var(--sage-light)" : "var(--green-deep)",
          lineHeight: 1,
          marginBottom: "6px",
          letterSpacing: "-0.02em",
        }}
      >
        {numMatch ? (
          <AnimatedCounter
            value={parseInt(numMatch[2])}
            prefix={numMatch[1]}
            suffix={numMatch[3]}
          />
        ) : (
          value
        )}
      </div>
      <div
        style={{
          fontSize: "0.72rem",
          color: dark ? "rgba(255,255,255,0.6)" : "var(--text-light)",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
    </div>
  );
}
