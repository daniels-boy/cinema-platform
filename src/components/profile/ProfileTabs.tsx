"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MessageSquare, Eye, Bookmark } from "lucide-react";
import { getTMDBImageUrl } from "@/lib/tmdb";

interface ReviewItem {
  id: string;
  tmdbId: number;
  rating: number;
  content: string;
  createdAt: Date;
  movieTitle: string;
  moviePoster: string | null;
  movieReleaseYear: number | string;
}

interface MovieItem {
  id: string;
  tmdbId: number;
  createdAt: Date;
  movieTitle: string;
  moviePoster: string | null;
  movieReleaseYear: number | string;
  voteAverage: number;
}

interface ProfileTabsProps {
  reviews: ReviewItem[];
  watched: MovieItem[];
  watchlist: MovieItem[];
}

type TabType = "reviews" | "watched" | "watchlist";

export default function ProfileTabs({ reviews, watched, watchlist }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("reviews");

  const tabItems = [
    { id: "reviews" as const, label: "Avaliações", count: reviews.length, icon: MessageSquare },
    { id: "watched" as const, label: "Assistidos", count: watched.length, icon: Eye },
    { id: "watchlist" as const, label: "Watchlist", count: watchlist.length, icon: Bookmark },
  ];

  return (
    <div>
      {/* ─── NAVEGAÇÃO DE TABS ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
          marginBottom: 28,
          gap: 8,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {tabItems.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                background: isActive ? "var(--surface-2)" : "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                color: isActive ? "#fff" : "var(--text-secondary)",
                fontSize: "0.9375rem",
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: "8px 8px 0 0",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <Icon size={16} color={isActive ? "var(--accent)" : "currentColor"} />
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "0.75rem",
                  background: isActive ? "var(--accent-dim)" : "rgba(255,255,255,0.06)",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── CONTEÚDO DAS TABS ─────────────────────────────────────────── */}
      <div>
        {/* TAB DE AVALIAÇÕES */}
        {activeTab === "reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {reviews.length === 0 ? (
              <div className="empty-tab-state">
                <MessageSquare size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                <h4 style={{ color: "#fff", marginBottom: 6 }}>Nenhuma avaliação registrada</h4>
                <p>Você ainda não escreveu nenhuma crítica. Explore os filmes e registre sua nota!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="profile-item-card">
                  {/* Poster */}
                  <Link href={`/movie/${review.tmdbId}`} className="poster-link">
                    <Image
                      src={getTMDBImageUrl(review.moviePoster, "w185")}
                      alt={review.movieTitle}
                      fill
                      sizes="70px"
                      style={{ objectFit: "cover" }}
                    />
                  </Link>

                  {/* Info */}
                  <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <div>
                        <Link href={`/movie/${review.tmdbId}`} style={{ color: "#fff", fontWeight: 700 }}>
                          {review.movieTitle}
                        </Link>
                        {review.movieReleaseYear && (
                          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginLeft: 6 }}>
                            ({review.movieReleaseYear})
                          </span>
                        )}
                      </div>
                      
                      {/* Estrelas */}
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            fill={s <= review.rating ? "var(--accent)" : "none"}
                            color={s <= review.rating ? "var(--accent)" : "var(--text-muted)"}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="item-comment">{review.content}</p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Avaliado em {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      <Link href={`/movie/${review.tmdbId}`} style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>
                        Ver detalhes &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB DE ASSISTIDOS */}
        {activeTab === "watched" && (
          <div className="movie-grid-container">
            {watched.length === 0 ? (
              <div className="empty-tab-state">
                <Eye size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                <h4 style={{ color: "#fff", marginBottom: 6 }}>Nenhum filme assistido ainda</h4>
                <p>Marque os filmes como assistidos nas páginas de detalhes para vê-los listados aqui.</p>
              </div>
            ) : (
              <div className="profile-movies-grid">
                {watched.map((wat) => (
                  <Link href={`/movie/${wat.tmdbId}`} key={wat.id} className="profile-movie-card">
                    <div style={{ position: "relative", width: "100%", aspectRatio: "2/3" }}>
                      <Image
                        src={getTMDBImageUrl(wat.moviePoster, "w342")}
                        alt={wat.movieTitle}
                        fill
                        sizes="(max-width: 640px) 45vw, 150px"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="movie-hover-details">
                        <span className="movie-card-rating">
                          <Star size={11} fill="currentColor" />
                          {wat.voteAverage ? wat.voteAverage.toFixed(1) : "—"}
                        </span>
                        <p className="hover-title">{wat.movieTitle}</p>
                      </div>
                    </div>
                    <div style={{ padding: "8px 4px 0" }}>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {wat.movieTitle}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {wat.movieReleaseYear || "—"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB DE WATCHLIST */}
        {activeTab === "watchlist" && (
          <div className="movie-grid-container">
            {watchlist.length === 0 ? (
              <div className="empty-tab-state">
                <Bookmark size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                <h4 style={{ color: "#fff", marginBottom: 6 }}>Sua Watchlist está vazia</h4>
                <p>Adicione filmes na sua Watchlist para planejar suas próximas sessões de cinema.</p>
              </div>
            ) : (
              <div className="profile-movies-grid">
                {watchlist.map((watch) => (
                  <Link href={`/movie/${watch.tmdbId}`} key={watch.id} className="profile-movie-card">
                    <div style={{ position: "relative", width: "100%", aspectRatio: "2/3" }}>
                      <Image
                        src={getTMDBImageUrl(watch.moviePoster, "w342")}
                        alt={watch.movieTitle}
                        fill
                        sizes="(max-width: 640px) 45vw, 150px"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="movie-hover-details">
                        <span className="movie-card-rating">
                          <Star size={11} fill="currentColor" />
                          {watch.voteAverage ? watch.voteAverage.toFixed(1) : "—"}
                        </span>
                        <p className="hover-title">{watch.movieTitle}</p>
                      </div>
                    </div>
                    <div style={{ padding: "8px 4px 0" }}>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {watch.movieTitle}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {watch.movieReleaseYear || "—"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── STYLES EMBEDDED PARA INTERACTION TABS ─────────────────────── */}
      <style>{`
        .empty-tab-state {
          background: var(--surface);
          border: 1px dashed var(--border);
          border-radius: var(--radius-lg);
          padding: 60px 24px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .profile-item-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          gap: 20px;
          transition: border-color 0.2s;
        }
        .profile-item-card:hover {
          border-color: var(--border-hover);
        }
        .poster-link {
          position: relative;
          width: 70px;
          aspect-ratio: 2/3;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--surface-2);
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .item-comment {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 12px;
          white-space: pre-line;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .profile-movies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 16px;
        }
        .profile-movie-card {
          display: block;
          border-radius: var(--radius);
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
          transition: all 0.25s ease;
          padding: 8px;
        }
        .profile-movie-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        .movie-hover-details {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
          opacity: 0;
          transition: opacity 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 8px;
        }
        .profile-movie-card:hover .movie-hover-details {
          opacity: 1;
        }
        .hover-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
