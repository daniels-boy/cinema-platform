"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MessageSquare, Eye, Bookmark, Film, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toggleFollowUser } from "@/actions/social";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { getTMDBImageUrl } from "@/lib/tmdb";
import FollowersModal from "./FollowersModal";
import UserAvatar from "../ui/UserAvatar";
import VipBadge from "../ui/VipBadge";

interface FeaturedFavoriteItem {
  position: number;
  tmdbId: number;
  movieTitle: string;
  moviePoster: string | null;
}

interface PublicProfileHeaderProps {
  userId: string;
  user: {
    name: string | null;
    email: string;
    image: string | null;
    memberSince: string;
    vipStatus?: string;
  };
  stats: {
    totalReviews: number;
    averageRating: string;
    totalWatched: number;
    totalWatchlist: number;
  };
  featuredFavorites: FeaturedFavoriteItem[];
  initialFollowersCount: number;
  initialFollowingCount: number;
  initialIsFollowing: boolean;
  isLoggedIn: boolean;
}

export default function PublicProfileHeader({
  userId,
  user,
  stats,
  featuredFavorites,
  initialFollowersCount,
  initialFollowingCount,
  initialIsFollowing,
  isLoggedIn,
}: PublicProfileHeaderProps) {
  const { openLogin } = useAuthModal();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isPending, startTransition] = useTransition();
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  const handleFollow = () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    
    // Optimistic Update
    const previousFollowing = isFollowing;
    const previousCount = followersCount;
    
    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);
    
    startTransition(async () => {
      const res = await toggleFollowUser(userId);
      if (res.error) {
        // Rollback
        setIsFollowing(previousFollowing);
        setFollowersCount(previousCount);
      } else if (res.following !== undefined) {
        setIsFollowing(res.following);
      }
    });
  };

  const slots = [1, 2, 3, 4, 5].map((pos) => {
    return featuredFavorites.find((f) => f.position === pos) || null;
  });

  return (
    <div style={{ marginBottom: 48 }}>
      {/* ─── CABEÇALHO DO PERFIL CARD ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          flexWrap: "wrap",
          marginBottom: 32,
        }}
        className="profile-header-container"
      >
        {/* Avatar Circular */}
        <UserAvatar
          src={user.image}
          alt={user.name || "Foto de perfil"}
          size={100}
          vipStatus={user.vipStatus}
        />

        {/* Nome, Botão Seguir e Estatísticas */}
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6, flexWrap: "wrap" }}>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
              className="font-display"
            >
              {user.name || user.email.split("@")[0]}
              <VipBadge status={user.vipStatus} />
            </h1>

            {/* Botão Seguir / Seguindo */}
            <button
              onClick={handleFollow}
              disabled={isPending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: "0.8125rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                background: isFollowing ? "rgba(255,255,255,0.06)" : "var(--accent)",
                border: `1px solid ${isFollowing ? "var(--border)" : "var(--accent)"}`,
                color: isFollowing ? "rgba(255,255,255,0.8)" : "#0a0a0f",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (isFollowing) {
                  e.currentTarget.style.background = "rgba(224,82,82,0.1)";
                  e.currentTarget.style.borderColor = "rgba(224,82,82,0.2)";
                  e.currentTarget.style.color = "#e05252";
                } else {
                  e.currentTarget.style.filter = "brightness(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (isFollowing) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                } else {
                  e.currentTarget.style.filter = "none";
                }
              }}
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserMinus size={13} /> Deixar de Seguir
                </>
              ) : (
                <>
                  <UserPlus size={13} /> Seguir
                </>
              )}
            </button>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 12 }}>
            Membro desde: {user.memberSince} ·{" "}
            <button
              onClick={() => setIsFollowersModalOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
            >
              {followersCount} {followersCount === 1 ? "seguidor" : "seguidores"}
            </button>{" "}
            ·{" "}
            <button
              onClick={() => setIsFollowingModalOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
            >
              {initialFollowingCount} seguindo
            </button>
          </p>

          {/* Badges Estatísticas */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div className="profile-stat-badge">
              <MessageSquare size={13} color="var(--accent)" />
              <span>
                <strong>{stats.totalReviews}</strong> {stats.totalReviews === 1 ? "Avaliação" : "Avaliações"}
              </span>
            </div>

            <div className="profile-stat-badge">
              <Star size={13} color="var(--accent)" fill="var(--accent)" />
              <span>
                Nota Média: <strong>{stats.averageRating}</strong>
              </span>
            </div>

            <div className="profile-stat-badge">
              <Eye size={13} color="var(--green)" />
              <span>
                <strong>{stats.totalWatched}</strong> {stats.totalWatched === 1 ? "Assistido" : "Assistidos"}
              </span>
            </div>

            <div className="profile-stat-badge">
              <Bookmark size={13} color="var(--accent)" />
              <span>
                <strong>{stats.totalWatchlist}</strong> na Watchlist
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SEÇÃO DE FILMES FAVORITOS DESTACADOS ─────────────────────────── */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 800,
            color: "#fff",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Film size={15} color="var(--accent)" />
          Favoritos Destacados
        </h3>

        {/* Linha dos 5 Filmes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 16,
          }}
          className="featured-movies-row"
        >
          {slots.map((movie, index) => {
            const pos = index + 1;

            if (movie) {
              return (
                <Link
                  key={pos}
                  href={`/movie/${movie.tmdbId}`}
                  style={{
                    position: "relative",
                    aspectRatio: "2/3",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                    transition: "all 0.25s ease",
                    display: "block",
                  }}
                  className="featured-poster-card"
                >
                  <Image
                    src={getTMDBImageUrl(movie.moviePoster, "w342")}
                    alt={movie.movieTitle}
                    fill
                    sizes="(max-width: 640px) 18vw, 100px"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="featured-card-overlay">
                    <p className="featured-card-title">{movie.movieTitle}</p>
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={pos}
                style={{
                  aspectRatio: "2/3",
                  borderRadius: "var(--radius-sm)",
                  border: "1px dashed rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.01)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.15)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Vazio
              </div>
            );
          })}
        </div>
      </div>

      {/* Modais de Seguidores e Seguindo */}
      <FollowersModal
        userId={userId}
        type="followers"
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
      />
      <FollowersModal
        userId={userId}
        type="following"
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
      />

      <style precedence="default" href="publicprofileheader-styles-1">{`
        .profile-stat-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }
        .profile-stat-badge strong {
          color: #fff;
        }
        .featured-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
          opacity: 0;
          transition: opacity 0.2s ease;
          display: flex;
          align-items: flex-end;
          padding: 8px;
        }
        .featured-poster-card:hover .featured-card-overlay {
          opacity: 1;
        }
        .featured-poster-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover) !important;
          box-shadow: 0 12px 28px rgba(0,0,0,0.7) !important;
        }
        .featured-card-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          text-align: center;
        }
        @media (max-width: 480px) {
          .profile-header-container {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .featured-movies-row {
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
