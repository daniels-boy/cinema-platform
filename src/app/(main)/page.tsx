import { getTrendingMovies, getNowPlayingMovies, getPopularMovies, discoverMovies, getMovieDetails } from "@/lib/tmdb";
import HeroCarousel from "@/components/movies/HeroCarousel";
import MovieRow from "@/components/movies/MovieRow";
import GenreTabsSection from "@/components/movies/GenreTabsSection";
import FeaturedBannerHero from "@/components/movies/FeaturedBannerHero";
import CuratedCollectionRow from "@/components/movies/CuratedCollectionRow";
import Link from "next/link";
import { Flame, Star, Sparkles, Clapperboard } from "lucide-react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TMDBMovie } from "@/types/tmdb";

export const metadata: Metadata = {
  title: "CineVerse — Descubra, Avalie e Compartilhe Cinema",
};

export default async function HomePage() {
  const [
    trending, 
    nowPlaying, 
    popular, 
    action,
    comedy,
    horror,
    romance,
    scifi,
    acclaimed,
    session
  ] = await Promise.all([
    getTrendingMovies(),
    getNowPlayingMovies(),
    getPopularMovies(),
    discoverMovies({ genreId: 28, page: 1, sortBy: "popularity.desc" }),
    discoverMovies({ genreId: 35, page: 1, sortBy: "popularity.desc" }),
    discoverMovies({ genreId: 27, page: 1, sortBy: "popularity.desc" }),
    discoverMovies({ genreId: 10749, page: 1, sortBy: "popularity.desc" }),
    discoverMovies({ genreId: 878, page: 1, sortBy: "popularity.desc" }),
    discoverMovies({ minRating: 8.0, page: 1, sortBy: "vote_count.desc" }), // Aclamados / Premiados
    auth(),
  ]);

  const actionMovies = action?.results || [];
  const comedyMovies = comedy?.results || [];
  const horrorMovies = horror?.results || [];
  const romanceMovies = romance?.results || [];
  const scifiMovies = scifi?.results || [];
  const acclaimedMovies = acclaimed?.results || [];

  let watchedMovieIds: number[] = [];
  let watchlistMovieIds: number[] = [];

  if (session?.user?.id) {
    try {
      const [watched, watchlist] = await Promise.all([
        prisma.watched.findMany({
          where: { userId: session.user.id },
          select: { tmdbId: true },
        }),
        prisma.watchlist.findMany({
          where: { userId: session.user.id },
          select: { tmdbId: true },
        }),
      ]);
      watchedMovieIds = watched.map((w: { tmdbId: number }) => w.tmdbId);
      watchlistMovieIds = watchlist.map((w: { tmdbId: number }) => w.tmdbId);
    } catch (err) {
      console.error("Erro ao buscar filmes do usuário:", err);
    }
  }

  // Buscar banner e coleções curadas no banco
  let activeBanner = null;
  let activeBannerMovie = null;
  let curatedCollectionsWithMovies: {
    id: string;
    title: string;
    description: string | null;
    emoji: string;
    movies: TMDBMovie[];
  }[] = [];

  try {
    const banner = await prisma.featuredBanner.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (banner) {
      activeBanner = banner;
      try {
        activeBannerMovie = await getMovieDetails(banner.tmdbId);
      } catch (err) {
        console.error("Erro ao buscar detalhes do filme do banner:", err);
      }
    }
  } catch (err) {
    console.error("Erro ao buscar banner destacado do banco:", err);
  }

  try {
    const collections = await prisma.curatedCollection.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    if (collections.length > 0) {
      // Buscar detalhes dos filmes de cada coleção em paralelo
      curatedCollectionsWithMovies = await Promise.all(
        collections.map(async (col) => {
          const moviePromises = col.tmdbIds.map(async (id) => {
            try {
              return await getMovieDetails(id);
            } catch (err) {
              console.error(`Erro ao buscar filme ${id} da coleção ${col.title}:`, err);
              return null;
            }
          });
          const movies = (await Promise.all(moviePromises)).filter(Boolean) as TMDBMovie[];
          return {
            id: col.id,
            title: col.title,
            description: col.description,
            emoji: col.emoji,
            movies,
          };
        })
      );
    }
  } catch (err) {
    console.error("Erro ao buscar coleções curadas:", err);
  }

  return (
    <>
      {/* ─── HERO CARROSSEL OU DESTAQUE DO ADMIN ───────────────────────────────── */}
      {activeBannerMovie ? (
        <FeaturedBannerHero
          movie={activeBannerMovie}
          customTitle={activeBanner?.title}
          customSubtitle={activeBanner?.subtitle || undefined}
        />
      ) : (
        <HeroCarousel movies={trending} />
      )}

      {/* ─── SEÇÕES DE FILMES ────────────────────────────────────────── */}
      <div style={{ paddingTop: 72, paddingBottom: 40 }}>
        <div className="container">

          {/* Categoria por Abas (Gêneros e Aclamados) */}
          <GenreTabsSection
            actionMovies={actionMovies}
            comedyMovies={comedyMovies}
            horrorMovies={horrorMovies}
            romanceMovies={romanceMovies}
            scifiMovies={scifiMovies}
            acclaimedMovies={acclaimedMovies}
            watchedMovieIds={watchedMovieIds}
            watchlistMovieIds={watchlistMovieIds}
          />

          {/* Coleções Curadas do Admin */}
          {curatedCollectionsWithMovies.map((col) => (
            <CuratedCollectionRow
              key={col.id}
              title={col.title}
              description={col.description}
              emoji={col.emoji}
              movies={col.movies}
              watchedMovieIds={watchedMovieIds}
              watchlistMovieIds={watchlistMovieIds}
            />
          ))}

          {/* Em Cartaz */}
          <section style={{ marginBottom: 56 }}>
            <h2 className="section-title">
              <Clapperboard size={18} color="var(--accent)" />
              Em Cartaz
            </h2>
            <MovieRow
              movies={nowPlaying}
              watchedMovieIds={watchedMovieIds}
              watchlistMovieIds={watchlistMovieIds}
            />
          </section>

          {/* Banner Recomendações */}
          <section
            style={{
              background: "linear-gradient(135deg, #1a1426 0%, #0f1520 100%)",
              border: "1px solid rgba(232,180,75,0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "48px 40px",
              marginBottom: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 24,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute", right: -60, top: -60,
                width: 260, height: 260,
                background: "radial-gradient(circle, rgba(232,180,75,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Sparkles size={20} color="var(--accent)" />
                <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  CineMatch Oráculo
                </span>
              </div>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: 8, color: "#fff" }} className="font-display">
                Cansou de passar 2h escolhendo e não ver nada?
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: 480, lineHeight: 1.5 }}>
                Responda a 3 perguntinhas rápidas para o nosso oráculo te entregar a call perfeita para o seu humor. Sem erro! 🔮✨
              </p>
            </div>
            <Link href="/recommend" className="btn btn-primary" id="recommend-banner-btn" style={{ padding: "14px 32px", fontSize: "1rem", flexShrink: 0 }}>
              <Sparkles size={17} />
              Bora Jogar!
            </Link>
          </section>

          {/* Mais Populares */}
          <section style={{ marginBottom: 56 }}>
            <h2 className="section-title">
              <Star size={17} color="var(--accent)" />
              Mais Populares
            </h2>
            <MovieRow
              movies={popular}
              watchedMovieIds={watchedMovieIds}
              watchlistMovieIds={watchlistMovieIds}
            />
          </section>

          {/* Em Alta */}
          <section style={{ marginBottom: 56 }}>
            <h2 className="section-title">
              <Flame size={17} color="var(--accent)" />
              Em Alta esta Semana
            </h2>
            <MovieRow
              movies={trending}
              watchedMovieIds={watchedMovieIds}
              watchlistMovieIds={watchlistMovieIds}
            />
          </section>

        </div>
      </div>
    </>
  );
}

