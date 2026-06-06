// ─── Configuração Base ────────────────────────────────────────────────────────

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function buildUrl(endpoint: string, extraParams: Record<string, string | number | boolean> = {}): string {
  const params = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY ?? "",
    language: "pt-BR",
    ...Object.fromEntries(Object.entries(extraParams).map(([k, v]) => [k, String(v)])),
  });
  return `${TMDB_BASE_URL}${endpoint}?${params.toString()}`;
}

async function tmdbFetch<T>(endpoint: string, extraParams: Record<string, string | number | boolean> = {}, revalidate = 3600): Promise<T> {
  const url = buildUrl(endpoint, extraParams);

  const res = await fetch(url, {
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`TMDB API Error: ${res.status} ${res.statusText} — ${url}`);
  }

  return res.json() as Promise<T>;
}

// ─── Utilitários de Imagem ────────────────────────────────────────────────────

export function getTMDBImageUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "/placeholder-movie.jpg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// ─── Funções de Busca ─────────────────────────────────────────────────────────

import type { TMDBMovie, TMDBMovieDetail, TMDBPagedResponse } from "@/types/tmdb";

/** Filmes em alta (trending da semana) */
export async function getTrendingMovies(): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBPagedResponse<TMDBMovie>>("/trending/movie/week");
  return data.results;
}

/** Lançamentos em cartaz */
export async function getNowPlayingMovies(): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBPagedResponse<TMDBMovie>>("/movie/now_playing");
  return data.results;
}

/** Filmes mais populares */
export async function getPopularMovies(): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBPagedResponse<TMDBMovie>>("/movie/popular");
  return data.results;
}

/** Busca por título */
export async function searchMovies(query: string, page = 1): Promise<TMDBPagedResponse<TMDBMovie>> {
  return tmdbFetch<TMDBPagedResponse<TMDBMovie>>("/search/movie", { query, page });
}

/** Detalhes completos de um filme (com trailer e elenco) */
export async function getMovieDetails(id: number): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${id}`, {
    append_to_response: "videos,credits",
  });
}

/** Motor de recomendação — Discover com filtros */
export async function discoverMovies(params: {
  genreId?: number;
  year?: number;
  minRating?: number;
  page?: number;
  sortBy?: string;
  certificationCountry?: string;
  certificationLte?: string;
}): Promise<TMDBPagedResponse<TMDBMovie>> {
  const { 
    genreId, 
    year, 
    minRating = 0, 
    page = 1, 
    sortBy = "vote_average.desc",
    certificationCountry,
    certificationLte
  } = params;

  const extraParams: Record<string, string | number | boolean> = {
    sort_by: sortBy,
    "vote_count.gte": 100,
    page,
  };

  if (genreId) extraParams["with_genres"] = genreId;
  if (year) extraParams["primary_release_year"] = year;
  if (minRating > 0) extraParams["vote_average.gte"] = minRating;
  if (certificationCountry) extraParams["certification_country"] = certificationCountry;
  if (certificationLte) extraParams["certification.lte"] = certificationLte;

  return tmdbFetch<TMDBPagedResponse<TMDBMovie>>("/discover/movie", extraParams);
}

/** Lista de gêneros disponíveis */
export async function getGenres(): Promise<{ id: number; name: string }[]> {
  const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/movie/list");
  return data.genres;
}

/** Busca críticas/reviews de um filme no TMDB (usando en-US para obter maior volume de críticas) */
export async function getTMDBMovieReviews(id: number): Promise<any[]> {
  try {
    const data = await tmdbFetch<{ results: any[] }>(`/movie/${id}/reviews`, { language: "en-US" });
    return data.results || [];
  } catch (err) {
    console.error(`Erro ao buscar reviews do filme ${id} no TMDB:`, err);
    return [];
  }
}

export { TMDB_IMAGE_BASE };

