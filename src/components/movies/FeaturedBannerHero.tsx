import Image from "next/image";
import Link from "next/link";
import { Star, Play } from "lucide-react";
import { getTMDBImageUrl } from "@/lib/tmdb";
import type { TMDBMovieDetail } from "@/types/tmdb";

interface FeaturedBannerHeroProps {
  movie: TMDBMovieDetail;
  customTitle?: string;
  customSubtitle?: string;
}

export default function FeaturedBannerHero({ movie, customTitle, customSubtitle }: FeaturedBannerHeroProps) {
  const title = customTitle || movie.title;
  const subtitle = customSubtitle || movie.overview?.slice(0, 200);
  const rating = movie.vote_average?.toFixed(1);
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "min(60vw, 560px)",
        overflow: "hidden",
        marginBottom: 0,
      }}
    >
      {/* Backdrop */}
      {movie.backdrop_path && (
        <Image
          src={getTMDBImageUrl(movie.backdrop_path, "original")}
          alt={title}
          fill
          style={{ objectFit: "cover", objectPosition: "center 20%" }}
          priority
          sizes="100vw"
        />
      )}

      {/* Gradientes */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(8,10,18,0.95) 0%, rgba(8,10,18,0.6) 50%, rgba(8,10,18,0.15) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,10,18,1) 0%, transparent 40%)" }} />

      {/* Conteúdo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 7% 10%",
          maxWidth: 700,
        }}
      >
        {/* Badge Destaque */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div
            style={{
              background: "linear-gradient(90deg, #e8b44b, #f5d07a)",
              color: "#0a0a0f",
              fontSize: "0.65rem",
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: 99,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ⭐ Destaque da Semana
          </div>
          {rating && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: 99, border: "1px solid rgba(232,180,75,0.3)" }}>
              <Star size={11} fill="#e8b44b" color="#e8b44b" />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#e8b44b" }}>{rating}</span>
            </div>
          )}
          {year && <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>{year}</span>}
        </div>

        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: 12,
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
          className="font-display"
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontSize: "0.9375rem",
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.6,
              marginBottom: 24,
              maxWidth: 520,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {subtitle}
          </p>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href={`/movie/${movie.id}`}
            className="btn btn-primary"
            style={{ padding: "12px 28px", fontSize: "0.9375rem", display: "flex", alignItems: "center", gap: 8 }}
          >
            <Play size={16} fill="currentColor" /> Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
