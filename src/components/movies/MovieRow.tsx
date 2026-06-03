"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTMDBImageUrl } from "@/lib/tmdb";
import type { TMDBMovie } from "@/types/tmdb";
import { ChevronRight, Star, Eye, Bookmark, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { toggleWatched, toggleWatchlist } from "@/actions/movies";

interface MovieRowProps {
  movies: TMDBMovie[];
  watchedMovieIds?: number[];
  watchlistMovieIds?: number[];
}

function MovieCard({
  movie,
  initialWatched,
  initialSaved,
}: {
  movie: TMDBMovie;
  initialWatched: boolean;
  initialSaved: boolean;
}) {
  const { data: session } = useSession();
  const { openLogin } = useAuthModal();
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  
  const [hovered, setHovered] = useState(false);
  const [watched, setWatched] = useState(initialWatched);
  const [saved, setSaved] = useState(initialSaved);
  const [loadingWatch, setLoadingWatch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const handleWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      openLogin();
      return;
    }
    if (loadingWatch) return;

    setLoadingWatch(true);
    try {
      const res = await toggleWatched(movie.id);
      if (res.error) {
        console.error(res.error);
      } else if (res.watched !== undefined) {
        setWatched(res.watched);
      }
    } catch (err) {
      console.error("Erro ao marcar como assistido:", err);
    } finally {
      setLoadingWatch(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      openLogin();
      return;
    }
    if (loadingSave) return;

    setLoadingSave(true);
    try {
      const res = await toggleWatchlist(movie.id);
      if (res.error) {
        console.error(res.error);
      } else if (res.saved !== undefined) {
        setSaved(res.saved);
      }
    } catch (err) {
      console.error("Erro ao salvar na watchlist:", err);
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div
      style={{ flexShrink: 0, width: 160, position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/movie/${movie.id}`}
        id={`row-card-${movie.id}`}
        style={{
          borderRadius: 10,
          overflow: "hidden",
          background: "var(--surface)",
          display: "block",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          transform: hovered ? "translateY(-6px) scale(1.03)" : "none",
          boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.6)" : "none",
          textDecoration: "none",
        }}
      >
        {/* Poster */}
        <div style={{ position: "relative", aspectRatio: "2/3", width: "100%" }}>
          <Image
            src={getTMDBImageUrl(movie.poster_path, "w342")}
            alt={movie.title}
            fill
            sizes="160px"
            style={{ objectFit: "cover" }}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />

          {/* Overlay escuro no hover */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s",
          }} />

          {/* Rating badge (sempre visível) */}
          {rating && (
            <div style={{
              position: "absolute", bottom: 8, left: 8,
              display: "flex", alignItems: "center", gap: 3,
              background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
              color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700,
              padding: "3px 7px", borderRadius: 20,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.25s",
            }}>
              <Star size={9} fill="currentColor" /> {rating}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "10px 10px 12px" }}>
          <p style={{
            fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)",
            lineHeight: 1.3, marginBottom: 3,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            height: 34, // Garante que títulos de 1 ou 2 linhas ocupem o mesmo espaço
          }}>
            {movie.title}
          </p>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{year}</span>
        </div>
      </Link>

      {/* ── Botões de ação (aparecem no hover) ── */}
      <div style={{
        position: "absolute",
        top: 8,
        right: 8,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateY(0)" : "translateY(-6px)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
        zIndex: 10,
      }}>
        {/* Assistido (Olhinho) */}
        <button
          id={`btn-like-${movie.id}`}
          onClick={handleWatched}
          disabled={loadingWatch}
          title={watched ? "Remover dos assistidos" : "Marcar como assistido"}
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: watched ? "var(--green)" : "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            border: watched ? "none" : "1px solid rgba(255,255,255,0.2)",
            color: watched ? "#0a0a0f" : "rgba(255,255,255,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s, transform 0.15s",
            transform: watched ? "scale(1.15)" : "scale(1)",
          }}
        >
          {loadingWatch ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Eye size={14} fill={watched ? "currentColor" : "none"} />
          )}
        </button>

        {/* Watchlist */}
        <button
          id={`btn-save-${movie.id}`}
          onClick={handleSave}
          disabled={loadingSave}
          title={saved ? "Remover da watchlist" : "Adicionar à watchlist"}
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: saved ? "var(--accent)" : "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            border: saved ? "none" : "1px solid rgba(255,255,255,0.2)",
            color: saved ? "#0a0a0f" : "rgba(255,255,255,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s, transform 0.15s",
            transform: saved ? "scale(1.15)" : "scale(1)",
          }}
        >
          {loadingSave ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function MovieRow({ movies, watchedMovieIds = [], watchlistMovieIds = [] }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.75, behavior: "smooth" });
    setTimeout(() => {
      if (el) setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }, 400);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* Scroll row */}
      <div
        ref={rowRef}
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          paddingBottom: 12,
          scrollbarWidth: "none",       /* Firefox */
          msOverflowStyle: "none",      /* IE */
          cursor: "grab",
        }}
        // hide webkit scrollbar via className
        className="hide-scrollbar"
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            initialWatched={watchedMovieIds.includes(movie.id)}
            initialSaved={watchlistMovieIds.includes(movie.id)}
          />
        ))}
      </div>

      {/* Fade + seta direita */}
      {canScrollRight && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 12,
            width: 100,
            background: "linear-gradient(to right, transparent 0%, var(--background) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            pointerEvents: "none",
          }}
        >
          <button
            id="row-scroll-btn"
            onClick={scroll}
            aria-label="Rolar para direita"
            style={{
              pointerEvents: "all",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--surface-2)",
              border: "1px solid var(--border-hover)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 4,
              transition: "background 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-3)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--surface-2)")}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
