"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

interface SpoilerReviewContentProps {
  content: string;
  isSpoiler: boolean;
}

export default function SpoilerReviewContent({ content, isSpoiler }: SpoilerReviewContentProps) {
  const [reveal, setReveal] = useState(false);

  if (!isSpoiler) {
    return (
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          whiteSpace: "pre-line",
        }}
      >
        {content}
      </p>
    );
  }

  if (reveal) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.75rem",
            color: "var(--accent)",
            background: "rgba(232, 180, 75, 0.1)",
            padding: "4px 12px",
            borderRadius: 6,
            border: "1px solid rgba(232, 180, 75, 0.2)",
            alignSelf: "flex-start",
          }}
        >
          <AlertTriangle size={12} />
          <span>Spoiler Revelado</span>
          <button
            onClick={() => setReveal(false)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "0.75rem",
              textDecoration: "underline",
              marginLeft: 8,
              padding: 0,
            }}
          >
            Ocultar novamente
          </button>
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            whiteSpace: "pre-line",
          }}
        >
          {content}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(239, 68, 68, 0.05)",
        border: "1px dashed rgba(239, 68, 68, 0.25)",
        borderRadius: "var(--radius)",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        textAlign: "center",
        margin: "8px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f87171" }}>
        <EyeOff size={18} />
        <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>Esta avaliação contém spoilers</span>
      </div>
      <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0, maxWidth: 360 }}>
        O texto foi ocultado pela moderação para preservar sua experiência.
      </p>
      <button
        onClick={() => setReveal(true)}
        className="btn"
        style={{
          background: "var(--surface-3)",
          border: "1px solid var(--border-hover)",
          color: "#fff",
          padding: "6px 16px",
          fontSize: "0.8125rem",
          fontWeight: 600,
          cursor: "pointer",
          borderRadius: 6,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-4)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-3)")}
      >
        <Eye size={13} />
        Ler Spoiler
      </button>
    </div>
  );
}
