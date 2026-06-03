"use client";

import { HOT_TAKES } from "@/types/reviews";

interface ReviewWithTags {
  tags?: string[];
}

interface CommunityVibeTrackerProps {
  reviews: ReviewWithTags[];
}

export default function CommunityVibeTracker({ reviews }: CommunityVibeTrackerProps) {
  // 1. Filtrar reviews que possuem pelo menos uma tag de reação
  const taggedReviews = reviews.filter((r) => r.tags && r.tags.length > 0);
  const totalTaggedCount = taggedReviews.length;

  if (totalTaggedCount === 0) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px 28px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span>🌡️</span> Vibe da Comunidade
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", lineHeight: 1.4 }}>
          Nenhuma tag de reação marcada ainda. Seja o primeiro a definir o clima deste filme preenchendo a avaliação abaixo!
        </p>
      </div>
    );
  }

  // 2. Contar as ocorrências de cada tag
  const tagCounts: Record<string, number> = {};
  taggedReviews.forEach((rev) => {
    rev.tags?.forEach((tagId) => {
      tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
    });
  });

  // 3. Cruzar com a definição de HOT_TAKES e calcular porcentagem
  const aggregatedTags = HOT_TAKES.map((tag) => {
    const count = tagCounts[tag.id] || 0;
    const percentage = totalTaggedCount > 0 ? Math.round((count / totalTaggedCount) * 100) : 0;
    return {
      ...tag,
      count,
      percentage,
    };
  })
    .filter((tag) => tag.count > 0) // Apenas exibe as tags que receberam votos
    .sort((a, b) => b.count - a.count); // Ordena pelas mais votadas

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
        <span>🌡️</span> Vibe da Comunidade
      </h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", lineHeight: 1.4, margin: 0 }}>
        Consenso baseado em <strong>{totalTaggedCount}</strong> avaliações com tags:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {aggregatedTags.map((tag) => {
          return (
            <div key={tag.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Header da Tag com Nome, Emoji e Percentual */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#fff" }}>
                  <span>{tag.emoji}</span>
                  <span>{tag.label}</span>
                </span>
                <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
                  {tag.percentage}%
                </span>
              </div>

              {/* Barra de Progresso Visual Estilo shadcn */}
              <div
                style={{
                  width: "100%",
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.08)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    background: tag.color,
                    width: `${tag.percentage}%`,
                    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: `0 0 10px ${tag.color}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
