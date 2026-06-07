import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMovieDetails } from "@/lib/tmdb";
import PublicProfileHeader from "@/components/profile/PublicProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { computeUserBadges, type MovieMeta } from "@/lib/badges";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true },
    });
    if (!user) {
      return {
        title: "Perfil Não Encontrado | CineVerse",
      };
    }
    const name = user.name || user.email.split("@")[0];
    return {
      title: `Perfil de ${name} | CineVerse`,
      description: `Veja as avaliações, conquistas, filmes assistidos e favoritos de ${name} no CineVerse.`,
    };
  } catch (error) {
    return {
      title: "Perfil | CineVerse",
    };
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id: targetUserId } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id;

  // Se o usuário tentar visualizar seu próprio perfil público, redireciona para a página administrativa /profile
  if (currentUserId === targetUserId) {
    redirect("/profile");
  }

  // Buscar dados do usuário alvo
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
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
      essays: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Verificar se o usuário logado segue o usuário alvo
  let isFollowing = false;
  if (currentUserId) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });
    isFollowing = !!follow;
  }

  // Contagem de seguidores e seguindo do usuário alvo
  const followersCount = await prisma.follow.count({
    where: { followingId: targetUserId },
  });

  const followingCount = await prisma.follow.count({
    where: { followerId: targetUserId },
  });

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

  // 4. Carregar detalhes do TMDB para os favoritos destacados
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

  // 5. Computar badges com base nos filmes avaliados
  const reviewedTmdbIds = user.reviews.map((r: { tmdbId: number }) => r.tmdbId);
  const movieMetas: MovieMeta[] = [];

  await Promise.allSettled(
    reviewedTmdbIds.map(async (tmdbId: number) => {
      try {
        const movie = await getMovieDetails(tmdbId);
        const director = movie.credits?.crew?.find(
          (c: { job: string; id: number }) => c.job === "Director"
        );
        movieMetas.push({
          tmdbId: movie.id,
          genreIds: (movie.genres || []).map((g: { id: number }) => g.id),
          directorId: director?.id,
          releaseYear: movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : undefined,
        });
      } catch {
        // ignorar
      }
    })
  );

  const badgeResults = computeUserBadges(movieMetas);
  const userName = user.name || user.email.split("@")[0];

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
        {/* Header do Perfil Público */}
        <PublicProfileHeader
          userId={targetUserId}
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
            memberSince,
            vipStatus: user.vipStatus,
          }}
          stats={{
            totalReviews,
            averageRating,
            totalWatched,
            totalWatchlist,
          }}
          featuredFavorites={featuredWithDetails}
          initialFollowersCount={followersCount}
          initialFollowingCount={followingCount}
          initialIsFollowing={isFollowing}
          isLoggedIn={!!currentUserId}
        />

        {/* Tabs Públicas */}
        <div style={{ marginTop: 24 }}>
          <ProfileTabs
            reviews={reviewsWithDetails}
            watched={watchedWithDetails}
            watchlist={watchlistWithDetails}
            badgeResults={badgeResults}
            essays={user.essays}
            isPublic={true}
            userName={userName}
          />
        </div>
      </div>
    </div>
  );
}
