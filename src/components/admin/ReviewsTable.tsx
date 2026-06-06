"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Star, Trash2, AlertTriangle, Eye, Loader2, Search } from "lucide-react";
import { deleteReview, toggleSpoiler } from "@/actions/admin";

interface ReviewRow {
  id: string;
  tmdbId: number;
  rating: number;
  content: string;
  isSpoiler: boolean;
  tags: string[];
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

export default function ReviewsTable({ reviews: initial }: { reviews: ReviewRow[] }) {
  const [reviews, setReviews] = useState(initial);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = reviews.filter(
    (r) =>
      r.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user.email.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (!confirm("Deletar esta review permanentemente?")) return;
    setLoadingId(id);
    startTransition(async () => {
      const res = await deleteReview(id);
      if (res.success) setReviews((prev) => prev.filter((r) => r.id !== id));
      setLoadingId(null);
    });
  };

  const handleSpoiler = (id: string, current: boolean) => {
    setLoadingId(id);
    startTransition(async () => {
      const res = await toggleSpoiler(id, current);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isSpoiler: !current } : r))
        );
      }
      setLoadingId(null);
    });
  };

  return (
    <div>
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 20,
          maxWidth: 400,
        }}
      >
        <Search size={15} color="rgba(255,255,255,0.3)" />
        <input
          type="text"
          placeholder="Buscar por usuário ou conteúdo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "none",
            border: "none",
            outline: "none",
            color: "#fff",
            fontSize: "0.875rem",
            flex: 1,
          }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 80px 1fr 100px 120px",
            gap: 12,
            padding: "12px 20px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {["Usuário", "Nota", "Review", "Data", "Ações"].map((h) => (
            <span key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>
            Nenhuma review encontrada.
          </div>
        ) : (
          filtered.map((review) => (
            <div
              key={review.id}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 80px 1fr 100px 120px",
                gap: 12,
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                alignItems: "center",
                opacity: loadingId === review.id ? 0.5 : 1,
                transition: "opacity 0.2s",
                background: review.isSpoiler ? "rgba(234,179,8,0.04)" : "transparent",
              }}
            >
              {/* Usuário */}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {review.user.name ?? "—"}
                </p>
                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {review.user.email}
                </p>
              </div>

              {/* Nota */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={11} fill="#e8b44b" color="#e8b44b" />
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#e8b44b" }}>{review.rating}</span>
              </div>

              {/* Conteúdo */}
              <div style={{ minWidth: 0 }}>
                {review.isSpoiler && (
                  <span style={{ fontSize: "0.6rem", background: "rgba(234,179,8,0.15)", color: "#eab308", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 4, padding: "1px 6px", fontWeight: 700, marginBottom: 4, display: "inline-block" }}>
                    🚨 SPOILER
                  </span>
                )}
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {review.content}
                </p>
                <Link
                  href={`/movie/${review.tmdbId}`}
                  target="_blank"
                  style={{ fontSize: "0.7rem", color: "rgba(96,165,250,0.7)", marginTop: 2, display: "block" }}
                >
                  Filme #{review.tmdbId} ↗
                </Link>
              </div>

              {/* Data */}
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
                {new Date(review.createdAt).toLocaleDateString("pt-BR")}
              </span>

              {/* Ações */}
              <div style={{ display: "flex", gap: 6 }}>
                {/* Toggle Spoiler */}
                <button
                  onClick={() => handleSpoiler(review.id, review.isSpoiler)}
                  disabled={loadingId === review.id}
                  title={review.isSpoiler ? "Remover marcação de spoiler" : "Marcar como spoiler"}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: review.isSpoiler ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${review.isSpoiler ? "rgba(234,179,8,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: review.isSpoiler ? "#eab308" : "rgba(255,255,255,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {loadingId === review.id ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
                </button>

                {/* Ver no site */}
                <Link
                  href={`/movie/${review.tmdbId}`}
                  target="_blank"
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <Eye size={12} />
                </Link>

                {/* Deletar */}
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={loadingId === review.id}
                  title="Deletar review"
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: "rgba(224,82,82,0.1)",
                    border: "1px solid rgba(224,82,82,0.2)",
                    color: "rgba(224,82,82,0.7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
