// ─── Tipos de Resposta da API do TMDB ────────────────────────────────────────

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_title?: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBVideo {
  id: string;
  key: string;        // ID do YouTube
  name: string;
  site: string;       // "YouTube"
  type: string;       // "Trailer", "Teaser", etc.
  official: boolean;
}

export interface TMDBMovieDetail extends TMDBMovie {
  runtime: number;
  tagline: string;
  genres: TMDBGenre[];
  videos: {
    results: TMDBVideo[];
  };
  credits: {
    cast: TMDBCast[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
      profile_path?: string | null;
    }[];
  };
}

export interface TMDBPagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
