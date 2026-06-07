"use client";

import { useState } from "react";
import { Lock, Trophy } from "lucide-react";
import type { BadgeResult } from "@/lib/badges";
import { ALL_BADGES } from "@/lib/badges";

interface BadgesPanelProps {
  badgeResults: BadgeResult[];
}

const CATEGORY_LABELS: Record<string, string> = {
  genre: "🎭 Por Gênero",
  director: "🎬 Por Diretor",
  era: "📽️ Por Época",
  milestone: "🏆 Marcos de Avaliação",
};

export default function BadgesPanel({ badgeResults }: BadgesPanelProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const unlockedCount = badgeResults.filter((b) => b.unlocked).length;
  const totalCount = ALL_BADGES.length;

  // Agrupar por categoria
  const categories = ["milestone", "genre", "director", "era"];

  return (
    <div>
      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#fff", marginBottom: 4 }}>
            Suas Conquistas
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            {unlockedCount === 0
              ? "Nenhuma conquista desbloqueada ainda. Avalie filmes para começar!"
              : `${unlockedCount} de ${totalCount} conquistas desbloqueadas`}
          </p>
        </div>

        {/* Barra de progresso geral */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
          <div
            style={{
              flex: 1,
              height: 6,
              background: "var(--surface-2)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(unlockedCount / totalCount) * 100}%`,
                background: "linear-gradient(90deg, #e8b44b, #f5d07a)",
                borderRadius: 99,
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--accent)",
              whiteSpace: "nowrap",
            }}
          >
            {unlockedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* ─── GRUPOS POR CATEGORIA ────────────────────────────────────────────── */}
      {categories.map((cat) => {
        const groupBadges = badgeResults.filter((b) => b.badge.category === cat);
        if (groupBadges.length === 0) return null;

        return (
          <div key={cat} style={{ marginBottom: 36 }}>
            <h4
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {CATEGORY_LABELS[cat]}
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 14,
              }}
            >
              {groupBadges.map(({ badge, unlocked, progress }) => {
                const isHovered = hoveredId === badge.id;
                const pct = Math.min((progress / badge.threshold) * 100, 100);

                return (
                  <div
                    key={badge.id}
                    onMouseEnter={() => setHoveredId(badge.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      position: "relative",
                      background: unlocked
                        ? "linear-gradient(135deg, rgba(232,180,75,0.08) 0%, rgba(245,208,122,0.04) 100%)"
                        : "var(--surface)",
                      border: `1px solid ${
                        unlocked
                          ? isHovered
                            ? "rgba(232,180,75,0.7)"
                            : "rgba(232,180,75,0.35)"
                          : isHovered
                          ? "var(--border-hover)"
                          : "var(--border)"
                      }`,
                      borderRadius: 14,
                      padding: "20px 16px",
                      textAlign: "center",
                      cursor: "default",
                      transition: "all 0.25s ease",
                      transform: isHovered ? "translateY(-4px)" : "none",
                      boxShadow: unlocked && isHovered
                        ? "0 8px 32px rgba(232,180,75,0.2)"
                        : isHovered
                        ? "0 8px 24px rgba(0,0,0,0.4)"
                        : "none",
                      filter: unlocked ? "none" : "saturate(0.4)",
                      opacity: unlocked ? 1 : 0.75,
                      overflow: "hidden",
                    }}
                  >
                    {/* Brilho de fundo para desbloqueadas */}
                    {unlocked && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "radial-gradient(circle at 50% 0%, rgba(232,180,75,0.15) 0%, transparent 70%)",
                          pointerEvents: "none",
                        }}
                      />
                    )}

                    {/* Emoji */}
                    <div
                      style={{
                        fontSize: "2.5rem",
                        marginBottom: 10,
                        transition: "transform 0.3s ease",
                        transform: isHovered && unlocked ? "scale(1.15)" : "scale(1)",
                        filter: unlocked ? "none" : "grayscale(80%)",
                      }}
                    >
                      {unlocked ? badge.emoji : "🔒"}
                    </div>

                    {/* Label */}
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: unlocked ? "#fff" : "var(--text-secondary)",
                        marginBottom: 6,
                        lineHeight: 1.3,
                      }}
                    >
                      {badge.label}
                    </p>

                    {/* Descrição ou dica */}
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: unlocked ? "var(--text-secondary)" : "var(--text-muted)",
                        lineHeight: 1.4,
                        marginBottom: unlocked ? 0 : 10,
                      }}
                    >
                      {unlocked ? badge.description : badge.hint}
                    </p>

                    {/* Barra de progresso para bloqueadas */}
                    {!unlocked && (
                      <div>
                        <div
                          style={{
                            height: 3,
                            background: "var(--surface-2)",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background:
                                "linear-gradient(90deg, rgba(232,180,75,0.5), rgba(232,180,75,0.8))",
                              borderRadius: 99,
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                        <p
                          style={{
                            fontSize: "0.65rem",
                            color: "var(--text-muted)",
                            marginTop: 4,
                            fontWeight: 600,
                          }}
                        >
                          {progress}/{badge.threshold}
                        </p>
                      </div>
                    )}

                    {/* Ícone de troféu para desbloqueadas */}
                    {unlocked && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          opacity: isHovered ? 1 : 0.5,
                          transition: "opacity 0.2s",
                        }}
                      >
                        <Trophy size={12} color="var(--accent)" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Estado vazio */}
      {unlockedCount === 0 && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: 14,
            padding: "48px 24px",
            textAlign: "center",
            marginTop: 16,
          }}
        >
          <Lock size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h4 style={{ color: "#fff", marginBottom: 8, fontWeight: 700 }}>
            Comece a desbloquear conquistas!
          </h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Avalie filmes para ganhar medalhas baseadas nos seus gostos. Quanto mais você assiste, mais conquistas desbloqueará! 🎬
          </p>
        </div>
      )}

      <style precedence="default" href="badgespanel-styles-1">{`
        @keyframes badge-unlock-pop {
          0%   { transform: scale(0.8) rotate(-5deg); opacity: 0; }
          60%  { transform: scale(1.1) rotate(3deg);  opacity: 1; }
          100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
        }
      `}</style>
    </div>
  );
}
