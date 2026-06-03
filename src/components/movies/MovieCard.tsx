import Image from "next/image";
import Link from "next/link";
import { getTMDBImageUrl } from "@/lib/tmdb";
import type { TMDBMovie } from "@/types/tmdb";
import { Star } from "lucide-react";

interface MovieCardProps {
  movie: TMDBMovie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <Link href={`/movie/${movie.id}`} className="movie-card fade-in" id={`movie-card-${movie.id}`}>
      <div style={{ position: "relative", aspectRatio: "2/3", width: "100%" }}>
        <Image
          src={getTMDBImageUrl(movie.poster_path, "w342")}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
          style={{ objectFit: "cover" }}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
        {/* Overlay com info */}
        <div className="movie-card-overlay">
          {rating && (
            <span className="movie-card-rating">
              <Star size={11} fill="currentColor" />
              {rating}
            </span>
          )}
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff", lineHeight: 1.3, marginBottom: 2 }}>
            {movie.title}
          </p>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>{year}</p>
        </div>
      </div>

      {/* Info abaixo */}
      <div className="movie-card-info">
        <p className="movie-card-title">{movie.title}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="movie-card-year">{year}</span>
          {rating && (
            <span className="movie-card-rating" style={{ fontSize: "0.7rem" }}>
              <Star size={10} fill="currentColor" />
              {rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
