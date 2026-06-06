import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMovieDetails } from "@/lib/tmdb";
import Link from "next/link";
import { Star, MessageSquare, Sparkles, UserPlus } from "lucide-react";
import SpoilerReviewContent from "@/components/reviews/SpoilerReviewContent";
import LikeReviewButton from "@/components/reviews/LikeReviewButton";
import ReviewCommentsSection from "@/components/reviews/ReviewCommentsSection";
import { HOT_TAKES } from "@/types/reviews";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews | CineVerse",
  description: "Acompanhe as reviews dos seus amigos em primeira mão e descubra as resenhas mais curtidas da comunidade do CineVerse.",
};

export default async function ReviewsPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  let friendsReviewsWithDetails: any[] = [];
  let communityReviewsWithDetails: any[] = [];
  let followingIds: string[] = [];
  let hasFriends = false;

  try {
    if (currentUserId) {
      const follows = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      followingIds = follows.map((f: { followingId: string }) => f.followingId);
      hasFriends = followingIds.length > 0;

      if (hasFriends) {
        // Reviews dos amigos
        const friendsReviews = await prisma.review.findMany({
          where: { userId: { in: followingIds } },
          include: {
            user: {
              select: { id: true, name: true, image: true, email: true },
            },
            likes: {
              select: { userId: true },
            },
            _count: {
              select: { comments: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        });

        friendsReviewsWithDetails = await Promise.all(
          friendsReviews.map(async (rev: any) => {
            try {
              const movie = await getMovieDetails(rev.tmdbId);
              return {
                ...rev,
                movieTitle: movie.title,
                moviePoster: movie.poster_path,
                movieReleaseYear: movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "",
              };
            } catch {
              return {
                ...rev,
                movieTitle: `Filme #${rev.tmdbId}`,
                moviePoster: null,
                movieReleaseYear: "",
              };
            }
          })
        );
      }
    }

    // Reviews da comunidade mais curtidas (excluindo os amigos e a si mesmo se logado)
    const excludeIds = currentUserId ? [...followingIds, currentUserId] : [];
    const communityReviews = await prisma.review.findMany({
      where: excludeIds.length > 0 ? { userId: { notIn: excludeIds } } : undefined,
      include: {
        user: {
          select: { id: true, name: true, image: true, email: true },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        likes: {
          _count: "desc",
        },
      },
      take: 25,
    });

    communityReviewsWithDetails = await Promise.all(
      communityReviews.map(async (rev: any) => {
        try {
          const movie = await getMovieDetails(rev.tmdbId);
          return {
            ...rev,
            movieTitle: movie.title,
            moviePoster: movie.poster_path,
            movieReleaseYear: movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "",
          };
        } catch {
          return {
            ...rev,
            movieTitle: `Filme #${rev.tmdbId}`,
            moviePoster: null,
            movieReleaseYear: "",
          };
        }
      })
    );
  } catch (err) {
    console.error("Erro ao buscar reviews:", err);
  }

  // Juntamos amigos e comunidade.
  const allReviews = [...friendsReviewsWithDetails, ...communityReviewsWithDetails];

  return (
    <div style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header da Página */}
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 900,
              color: "#fff",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
            className="font-display"
          >
            <MessageSquare size={32} color="var(--accent)" />
            Reviews
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: 540, margin: "0 auto", lineHeight: 1.5 }}>
            Acompanhe o que os seus amigos andam assistindo em primeira mão, além das críticas mais curtidas e relevantes da comunidade do CineVerse.
          </p>
        </div>

        {/* Banner de Onboarding/Aviso se não tem amigos */}
        {!hasFriends && (
          <div
            style={{
              background: "rgba(232, 180, 75, 0.04)",
              border: "1px dashed rgba(232, 180, 75, 0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 28px",
              marginBottom: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                💡 Que tal seguir alguns cinéfilos?
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
                {currentUserId 
                  ? "Você ainda não segue ninguém! Busque por outros usuários e siga-os para ver as críticas deles destacadas aqui."
                  : "Faça login e siga outros cinéfilos para montar a sua timeline personalizada com a atividade de seus amigos."}
              </p>
            </div>
            <Link 
              href={currentUserId ? "/search?type=users" : "/login"} 
              className="btn btn-primary" 
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", fontSize: "0.875rem", flexShrink: 0 }}
            >
              <UserPlus size={15} />
              {currentUserId ? "Buscar Cinéfilos" : "Entrar no CineVerse"}
            </Link>
          </div>
        )}

        {/* Feed de Reviews */}
        {allReviews.length === 0 ? (
          <div
            style={{
              background: "var(--surface)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "64px 24px",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            <Sparkles size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h3 style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 700, marginBottom: 8 }}>
              As reviews estão em silêncio...
            </h3>
            <p style={{ maxWidth: 400, margin: "0 auto", fontSize: "0.875rem" }}>
              Ainda não há nenhuma avaliação registrada na plataforma. Seja o primeiro a escrever uma review na página de detalhes de um filme!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {allReviews.map((rev) => {
              const authorName = rev.user.name || rev.user.email.split("@")[0];
              const isFriend = followingIds.includes(rev.user.id);
              const isLiked = rev.likes.some((like: any) => like.userId === currentUserId);
              
              const posterPath = rev.moviePoster;
              const posterUrl = posterPath 
                ? (posterPath.startsWith("http") ? posterPath : `https://image.tmdb.org/t/p/w185${posterPath}`)
                : null;

              return (
                <div
                  key={rev.id}
                  style={{
                    display: "flex",
                    gap: 20,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 20,
                    transition: "all 0.2s ease",
                  }}
                  className="social-feed-card"
                >
                  {/* Movie Poster */}
                  <Link
                    href={`/movie/${rev.tmdbId}`}
                    style={{
                      position: "relative",
                      width: 70,
                      aspectRatio: "2/3",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      background: "var(--surface-2)",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      display: "block",
                    }}
                  >
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={rev.movieTitle}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.6rem",
                          color: "var(--text-muted)",
                          padding: 4,
                          textAlign: "center",
                        }}
                      >
                        {rev.movieTitle}
                      </div>
                    )}
                  </Link>

                  {/* Review Body */}
                  <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                    {/* Header: Autor, Badge, Nome do Filme */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* Autor Avatar & Nome */}
                        <Link
                          href={`/profile/${rev.user.id}`}
                          style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                          className="review-author-link"
                        >
                          <div
                            style={{
                              position: "relative",
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              overflow: "hidden",
                              border: "1px solid var(--border)",
                              background: "var(--surface-2)",
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={rev.user.image || "/placeholder-avatar.jpg"}
                              alt={authorName}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>{authorName}</span>
                        </Link>

                        {/* Badge de Parça (Seguindo) */}
                        {isFriend && (
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              fontWeight: 800,
                              color: "var(--accent)",
                              background: "rgba(232, 180, 75, 0.12)",
                              border: "1px solid rgba(232, 180, 75, 0.25)",
                              padding: "1px 8px",
                              borderRadius: "10px",
                            }}
                          >
                            ✨ Parça
                          </span>
                        )}
                      </div>

                      {/* Filme e Estrelas */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <Link
                          href={`/movie/${rev.tmdbId}`}
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "#fff",
                            textDecoration: "none",
                          }}
                          className="review-movie-link"
                        >
                          {rev.movieTitle}
                        </Link>
                        <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={11}
                              fill={s <= rev.rating ? "var(--accent)" : "none"}
                              color={s <= rev.rating ? "var(--accent)" : "var(--text-muted)"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Hot Takes Tags */}
                    {rev.tags && rev.tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {rev.tags.map((tagId: string) => {
                          const tag = HOT_TAKES.find((t) => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tagId}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: 10,
                                background: tag.bgColor,
                                border: `1px solid ${tag.borderColor}`,
                                color: "#fff",
                              }}
                            >
                                <span>{tag.emoji}</span>
                                <span>{tag.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Comentário (suporte a Spoiler) */}
                    <div style={{ margin: "4px 0 12px" }}>
                      <SpoilerReviewContent content={rev.content} isSpoiler={rev.isSpoiler} />
                    </div>

                    {/* Metadata: Data de Criação */}
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", paddingBottom: 4 }}>
                      <span>Avaliado em {new Date(rev.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>

                    {/* Ações da Review: Curtidas e Comentários */}
                    <ReviewCommentsSection
                      reviewId={rev.id}
                      initialCommentsCount={rev._count?.comments ?? 0}
                      isLoggedIn={!!currentUserId}
                      currentUserId={currentUserId}
                      isAdmin={session?.user?.role === "ADMIN"}
                    >
                      <LikeReviewButton
                        reviewId={rev.id}
                        initialLikesCount={rev.likes.length}
                        initialLiked={isLiked}
                        isLoggedIn={!!currentUserId}
                      />
                    </ReviewCommentsSection>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .social-feed-card:hover {
          border-color: var(--border-hover) !important;
          background: var(--surface-2) !important;
        }
        .review-author-link {
          color: var(--text-secondary);
          transition: color 0.15s ease;
        }
        .review-author-link:hover {
          color: var(--accent) !important;
        }
        .review-movie-link {
          color: #fff;
          transition: color 0.15s ease;
        }
        .review-movie-link:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
