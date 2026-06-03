import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMovieDetails } from "@/lib/tmdb";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meu Perfil | CineVerse",
  description: "Gerencie seu perfil, troque seu avatar e acompanhe seu histórico de avaliações, watchlist e favoritos destacados no CineVerse.",
};

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Buscar dados do usuário com críticas, assistidos, watchlist e favoritos destacados
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
      },
      watched: {
        orderBy: { createdAt: "desc" },
      },
      watchlist: {
        orderBy: { createdAt: "desc" },
      },
      featuredFavorites: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // 1. Carregar detalhes do TMDB para as avaliações
  const reviewsWithDetails = await Promise.all(
    user.reviews.map(async (review: any) => {
      try {
        const movie = await getMovieDetails(review.tmdbId);
        return {
          ...review,
          movieTitle: movie.title,
          moviePoster: movie.poster_path,
          movieReleaseYear: movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : "",
        };
      } catch (err) {
        return {
          ...review,
          movieTitle: `Filme #${review.tmdbId}`,
          moviePoster: null,
          movieReleaseYear: "",
        };
      }
    })
  );

  // 2. Carregar detalhes do TMDB para os assistidos
  const watchedWithDetails = await Promise.all(
    user.watched.map(async (wat: any) => {
      try {
        const movie = await getMovieDetails(wat.tmdbId);
        return {
          ...wat,
          movieTitle: movie.title,
          moviePoster: movie.poster_path,
          movieReleaseYear: movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : "",
          voteAverage: movie.vote_average,
        };
      } catch (err) {
        return {
          ...wat,
          movieTitle: `Filme #${wat.tmdbId}`,
          moviePoster: null,
          movieReleaseYear: "",
          voteAverage: 0,
        };
      }
    })
  );

  // 3. Carregar detalhes do TMDB para a watchlist
  const watchlistWithDetails = await Promise.all(
    user.watchlist.map(async (watch: any) => {
      try {
        const movie = await getMovieDetails(watch.tmdbId);
        return {
          ...watch,
          movieTitle: movie.title,
          moviePoster: movie.poster_path,
          movieReleaseYear: movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : "",
          voteAverage: movie.vote_average,
        };
      } catch (err) {
        return {
          ...watch,
          movieTitle: `Filme #${watch.tmdbId}`,
          moviePoster: null,
          movieReleaseYear: "",
          voteAverage: 0,
        };
      }
    })
  );

  // 4. Carregar detalhes do TMDB para os 5 favoritos destacados
  const featuredWithDetails = await Promise.all(
    user.featuredFavorites.map(async (fav: any) => {
      try {
        const movie = await getMovieDetails(fav.tmdbId);
        return {
          position: fav.position,
          tmdbId: fav.tmdbId,
          movieTitle: movie.title,
          moviePoster: movie.poster_path,
        };
      } catch (err) {
        return {
          position: fav.position,
          tmdbId: fav.tmdbId,
          movieTitle: `Filme #${fav.tmdbId}`,
          moviePoster: null,
        };
      }
    })
  );

  // Estatísticas de perfil
  const totalReviews = reviewsWithDetails.length;
  const totalWatched = watchedWithDetails.length;
  const totalWatchlist = watchlistWithDetails.length;
  const averageRating = totalReviews
    ? (reviewsWithDetails.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "—";

  const memberSince = new Date(user.createdAt).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 80 }}>
      {/* ─── FADE HERO HEADER BANNER ───────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "320px",
          background: "linear-gradient(135deg, #1b162c 0%, #0a0a0f 100%)",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% -100px, rgba(232, 180, 75, 0.15) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "80px",
            background: "linear-gradient(to bottom, transparent, #0a0a0f)",
          }}
        />
      </div>

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: 140,
        }}
      >
        {/* 1. Header do Perfil (Com o Top 5 e o Pop-up de configurações) */}
        <ProfileHeader
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
            memberSince,
          }}
          stats={{
            totalReviews,
            averageRating,
            totalWatched,
            totalWatchlist,
          }}
          featuredFavorites={featuredWithDetails}
        />

        {/* 2. Tabs das Coleções (Avaliações / Assistidos / Watchlist) */}
        <div style={{ marginTop: 24 }}>
          <ProfileTabs
            reviews={reviewsWithDetails}
            watched={watchedWithDetails}
            watchlist={watchlistWithDetails}
          />
        </div>
      </div>
    </div>
  );
}
