"use client";

import Link from "next/link";
import { Sparkles, Users } from "lucide-react";
import { getTMDBImageUrl } from "@/lib/tmdb";

interface FriendWatchedItem {
  id: string;
  tmdbId: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
  movieTitle: string;
  moviePoster: string | null;
  movieReleaseYear: number | string;
  voteAverage: number;
}

interface HomeSocialFeedsProps {
  friendsWatched: FriendWatchedItem[];
  hasFriends: boolean;
  currentUserId?: string;
}

export default function HomeSocialFeeds({
  friendsWatched,
  hasFriends,
  currentUserId,
}: HomeSocialFeedsProps) {
  return (
    <section style={{ marginBottom: 56 }}>
      {/* ─── SECTION TITLE ────────────────────────────────────────────── */}
      <h2 
        className="section-title" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 10,
          marginBottom: 24,
        }}
      >
        <Users size={18} color="var(--accent)" />
        Na Tela dos Parças 👀
      </h2>

      {/* ─── ONBOARDING BANNER IF NO FRIENDS ──────────────────────────── */}
      {!hasFriends && (
        <div
          style={{
            background: "rgba(232, 180, 75, 0.04)",
            border: "1px dashed rgba(232, 180, 75, 0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            marginBottom: 24,
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <strong>Você não segue ninguém ainda!</strong> Encontre outros cinéfilos na aba de{" "}
            <Link href="/search?type=users" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Cinéfilos
            </Link>{" "}
            para ver a atividade deles aqui.
          </div>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Exibindo atividade recente global 👇
          </span>
        </div>
      )}

      {/* ─── HORIZONTAL SCROLL LIST ───────────────────────────────────── */}
      {friendsWatched.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          <Sparkles size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            Nenhuma atividade de filmes assistidos registrada ainda.
          </p>
        </div>
      ) : (
        <div
          className="watching-row-scroll"
          style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 16 }}
        >
          {friendsWatched.map((item) => {
            const friendName = item.user.name || item.user.email.split("@")[0];
            const posterUrl = getTMDBImageUrl(item.moviePoster, "w342");

            return (
              <div key={item.id} style={{ width: 140, flexShrink: 0 }}>
                <Link
                  href={`/movie/${item.tmdbId}`}
                  style={{
                    position: "relative",
                    aspectRatio: "2/3",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    display: "block",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    transition: "all 0.2s ease",
                  }}
                  className="watching-poster-link"
                >
                  {item.moviePoster ? (
                    <img
                      src={posterUrl}
                      alt={item.movieTitle}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "var(--surface-3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        padding: 8,
                        textAlign: "center",
                      }}
                    >
                      {item.movieTitle}
                    </div>
                  )}

                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "rgba(0,0,0,0.8)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontWeight: 700,
                      }}
                    >
                      ⭐️ {item.voteAverage ? item.voteAverage.toFixed(1) : "—"}
                    </span>
                  </div>
                </Link>

                {/* Info do Amigo que assistiu */}
                <div style={{ marginTop: 10 }}>
                  <Link
                    href={`/profile/${item.user.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      textDecoration: "none",
                      color: "var(--text-secondary)",
                    }}
                    className="watching-user-pill"
                  >
                    <div
                      style={{
                        position: "relative",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1px solid var(--border)",
                        background: "var(--surface-2)",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={item.user.image || "/placeholder-avatar.jpg"}
                        alt={friendName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-avatar.jpg";
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        transition: "color 0.2s",
                      }}
                    >
                      {friendName}
                    </span>
                  </Link>
                  <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: "2px 0 0 30px" }}>
                    deu play! 🟢
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── HOVER AND TRANSITION CSS ──────────────────────────────────── */}
      <style>{`
        .watching-row-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .watching-row-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.01);
          border-radius: 10px;
        }
        .watching-row-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 10px;
        }
        .watching-row-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.15);
        }
        .watching-poster-link:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6) !important;
        }
        .watching-user-pill:hover span {
          color: var(--accent) !important;
        }
      `}</style>
    </section>
  );
}
