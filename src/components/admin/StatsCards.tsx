import Image from "next/image";
import { Users, MessageSquare, TrendingUp, Film } from "lucide-react";
import { getTMDBImageUrl } from "@/lib/tmdb";

interface StatsCardsProps {
  totalUsers: number;
  totalReviews: number;
  reviewsToday: number;
  topMovie: { title: string; poster: string | null; count: number } | null;
}

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "24px 24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {label}
        </span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div>
        <p style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function StatsCards({ totalUsers, totalReviews, reviewsToday, topMovie }: StatsCardsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      <StatCard
        label="Total de Usuários"
        value={totalUsers.toLocaleString("pt-BR")}
        sub="cadastros totais"
        icon={Users}
        color="#60a5fa"
      />
      <StatCard
        label="Total de Reviews"
        value={totalReviews.toLocaleString("pt-BR")}
        sub="avaliações escritas"
        icon={MessageSquare}
        color="#a78bfa"
      />
      <StatCard
        label="Reviews Hoje"
        value={reviewsToday}
        sub="nas últimas 24h"
        icon={TrendingUp}
        color="#34d399"
      />
      {/* Filme mais avaliado da semana */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(232,180,75,0.08) 0%, rgba(245,208,122,0.04) 100%)",
          border: "1px solid rgba(232,180,75,0.2)",
          borderRadius: 16,
          padding: "20px",
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}
      >
        {topMovie?.poster ? (
          <div style={{ position: "relative", width: 44, height: 66, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
            <Image src={getTMDBImageUrl(topMovie.poster, "w92")} alt={topMovie.title} fill style={{ objectFit: "cover" }} />
          </div>
        ) : (
          <div style={{ width: 44, height: 66, borderRadius: 8, background: "rgba(255,255,255,0.06)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Film size={20} color="rgba(255,255,255,0.3)" />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#e8b44b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>🏆 + Avaliado da Semana</p>
          <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {topMovie?.title ?? "—"}
          </p>
          {topMovie && (
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              {topMovie.count} review{topMovie.count !== 1 ? "s" : ""} esta semana
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
