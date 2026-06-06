import MovieRow from "./MovieRow";
import type { TMDBMovie } from "@/types/tmdb";

interface CuratedCollectionRowProps {
  title: string;
  description?: string | null;
  emoji?: string;
  movies: TMDBMovie[];
  watchedMovieIds?: number[];
  watchlistMovieIds?: number[];
}

export default function CuratedCollectionRow({
  title,
  description,
  emoji = "🎬",
  movies,
  watchedMovieIds = [],
  watchlistMovieIds = [],
}: CuratedCollectionRowProps) {
  if (movies.length === 0) return null;

  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <span style={{ marginRight: 8 }}>{emoji}</span>
          {title}
        </h2>
        {description && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0, paddingLeft: 30 }}>
            {description}
          </p>
        )}
      </div>
      <MovieRow
        movies={movies}
        watchedMovieIds={watchedMovieIds}
        watchlistMovieIds={watchlistMovieIds}
      />
    </section>
  );
}
