"use client";

import { Crown, Film } from "lucide-react";

interface VipBadgeProps {
  status?: string;
  style?: React.CSSProperties;
}

export default function VipBadge({ status, style }: VipBadgeProps) {
  if (!status || status === "FREE") return null;

  if (status === "SOMMELIER") {
    return (
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 800,
          background: "linear-gradient(95deg, #e8b44b, #f5d07a)",
          color: "#0a0a0f",
          padding: "2px 8px",
          borderRadius: "10px",
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          boxShadow: "0 0 8px rgba(232, 180, 75, 0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          height: "fit-content",
          ...style,
        }}
      >
        <Crown size={10} fill="currentColor" />
        VIP
      </span>
    );
  }

  if (status === "ACIONISTA") {
    return (
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 800,
          background: "linear-gradient(95deg, #dfac40, #ffd875, #dfac40)",
          backgroundSize: "200% auto",
          color: "#fff",
          padding: "2px 8px",
          borderRadius: "10px",
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          boxShadow: "0 0 12px rgba(223, 172, 64, 0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          height: "fit-content",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          animation: "shimmer-gold 2.5s infinite linear",
          ...style,
        }}
      >
        <Film size={10} fill="currentColor" />
        Acionista
        <style precedence="default" href="vip-badge-styles">{`
          @keyframes shimmer-gold {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </span>
    );
  }

  return null;
}
