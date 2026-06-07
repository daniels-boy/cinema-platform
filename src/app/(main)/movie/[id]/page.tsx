import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Clock, Calendar, Globe, Film, User as UserIcon, MessageSquare, BookOpen, Plus } from "lucide-react";
import { getMovieDetails, getTMDBImageUrl, getTMDBMovieReviews } from "@/lib/tmdb";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ReviewForm from "@/components/reviews/ReviewForm";
import MovieDetailActions from "@/components/movies/MovieDetailActions";
import CommunityVibeTracker from "@/components/reviews/CommunityVibeTracker";
import SpoilerReviewContent from "@/components/reviews/SpoilerReviewContent";
import LikeReviewButton from "@/components/reviews/LikeReviewButton";
import LikeEssayButton from "@/components/reviews/LikeEssayButton";
import ReviewCommentsSection from "@/components/reviews/ReviewCommentsSection";
import Link from "next/link";
import { HOT_TAKES } from "@/types/reviews";

import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetails(Number(id));
    const year = movie.release_date ? ` (${new Date(movie.release_date).getFullYear()})` : "";
    return {
      title: `${movie.title}${year}`,
      description: movie.overview || `Detalhes, elenco e avaliações do filme ${movie.title} no CineVerse.`,
    };
  } catch (error) {
    return {
      title: "Detalhes do Filme | CineVerse",
    };
  }
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tmdbId = Number(id);

  if (isNaN(tmdbId)) {
    notFound();
  }

  let movie;
  try {
    movie = await getMovieDetails(tmdbId);
  } catch (error) {
    console.error("Erro ao buscar detalhes do filme do TMDB:", error);
    notFound();
  }

  // Obter sessão do usuário para buscar sua avaliação inicial e interações
  const session = await auth();
  let userReview = null;
  let initialWatched = false;
  let initialSaved = false;

  if (session?.user?.id) {
    const [reviewRes, watchedRes, watchlistRes] = await Promise.all([
      prisma.review.findUnique({
        where: {
          userId_tmdbId: {
            userId: session.user.id,
            tmdbId,
          },
        },
      }),
      prisma.watched.findUnique({
        where: {
          userId_tmdbId: {
            userId: session.user.id,
            tmdbId,
          },
        },
      }),
      prisma.watchlist.findUnique({
        where: {
          userId_tmdbId: {
            userId: session.user.id,
            tmdbId,
          },
        },
      }),
    ]);
    
    userReview = reviewRes;
    initialWatched = !!watchedRes;
    initialSaved = !!watchlistRes;
  }

  // Buscar todas as avaliações locais, críticas do TMDB e resenhas editoriais em paralelo
  const [reviews, tmdbReviews, essays] = await Promise.all([
    prisma.review.findMany({
      where: { tmdbId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getTMDBMovieReviews(tmdbId),
    prisma.essay.findMany({
      where: { tmdbId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "—";
  const formattedDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("pt-BR")
    : "—";

  const formatRuntime = (minutes: number) => {
    if (!minutes) return "—";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  // Filtrar o trailer oficial no YouTube
  const trailer =
    movie.videos?.results?.find(
      (v) =>
        v.site === "YouTube" &&
        (v.type === "Trailer" || v.type === "Teaser") &&
        v.official
    ) ||
    movie.videos?.results?.find(
      (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
    ) ||
    movie.videos?.results?.[0];

  const cast = movie.credits?.cast?.slice(0, 8) || [];
  const director = movie.credits?.crew?.find((c) => c.job === "Director");

  // Calcular média de avaliação do banco de dados (se houver)
  const dbRatingsCount = reviews.length;
  const dbRatingsAverage = dbRatingsCount
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / dbRatingsCount).toFixed(1)
    : null;

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 80 }}>
      {/* ─── BACKDROP HERO BANNER ───────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60vh",
          minHeight: "400px",
          maxHeight: "650px",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {movie.backdrop_path ? (
          <Image
            src={getTMDBImageUrl(movie.backdrop_path, "original")}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(to bottom, #111118, #0a0a0f)",
            }}
          />
        )}
        {/* Camadas de Degradê Premium para Fusão com o Fundo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10, 10, 15, 0.4) 0%, rgba(10, 10, 15, 0.8) 70%, #0a0a0f 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 30% 30%, transparent 0%, rgba(10, 10, 15, 0.7) 100%)",
          }}
        />
      </div>

      {/* ─── CONTEÚDO PRINCIPAL ─────────────────────────────────────────── */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: "min(30vh, 320px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 40,
          }}
        >
          {/* Grid responsivo superior (Poster e Infos Principais) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "var(--main-grid, 300px 1fr)",
              gap: 40,
            }}
            className="movie-grid-wrapper"
          >
            {/* Coluna Esquerda: Poster + Ações */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "2/3",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  background: "var(--surface)",
                }}
              >
                <Image
                  src={getTMDBImageUrl(movie.poster_path, "w500")}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* Botões Favoritar / Watchlist */}
              <MovieDetailActions
                movieId={movie.id}
                initialWatched={initialWatched}
                initialSaved={initialSaved}
              />
            </div>

            {/* Coluna Direita: Metadados, Sinopse e Info */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <span
                style={{
                  color: "var(--accent)",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}
              >
                {movie.genres?.map((g) => g.name).join(" • ")}
              </span>

              <h1
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.25rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  marginBottom: 8,
                  color: "#fff",
                }}
                className="font-display"
              >
                {movie.title}
              </h1>

              {movie.tagline && (
                <p
                  style={{
                    fontStyle: "italic",
                    color: "var(--text-secondary)",
                    fontSize: "1.125rem",
                    marginBottom: 20,
                    fontWeight: 500,
                  }}
                >
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              {/* Badges de Informação */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 28,
                  alignItems: "center",
                }}
              >
                {/* Nota TMDB */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(232, 180, 75, 0.12)",
                    border: "1px solid rgba(232, 180, 75, 0.25)",
                    borderRadius: "100px",
                    padding: "4px 14px",
                    color: "var(--accent)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                  title="Nota no TMDB"
                >
                  <Star size={14} fill="currentColor" />
                  <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "—"} TMDB</span>
                </div>

                {/* Nota da Comunidade no CineVerse */}
                {dbRatingsAverage && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(82, 192, 122, 0.12)",
                      border: "1px solid rgba(82, 192, 122, 0.25)",
                      borderRadius: "100px",
                      padding: "4px 14px",
                      color: "var(--green)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                    title="Nota média no CineVerse"
                  >
                    <Star size={14} fill="currentColor" />
                    <span>{dbRatingsAverage} CineVerse ({dbRatingsCount})</span>
                  </div>
                )}

                {/* Duração */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <Clock size={14} />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>

                {/* Data de lançamento */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <Calendar size={14} />
                  <span>{year}</span>
                </div>

                {/* Diretor Badge */}
                {director && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      padding: "3px 12px 3px 6px",
                      borderRadius: "100px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                    title={`Diretor: ${director.name}`}
                  >
                    {director.profile_path ? (
                      <div
                        style={{
                          position: "relative",
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          src={getTMDBImageUrl(director.profile_path, "w185")}
                          alt={director.name}
                          fill
                          sizes="22px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "var(--surface-3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <UserIcon size={12} color="var(--text-secondary)" />
                      </div>
                    )}
                    <span style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                      {director.name}
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 400 }}>
                        (Diretor)
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Sinopse */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
                  Sinopse
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    maxWidth: "760px",
                  }}
                >
                  {movie.overview || "Este filme ainda não possui sinopse disponível em português."}
                </p>
              </div>

              {/* Detalhes Técnicos Rápidos */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 20,
                  padding: "20px 0",
                  borderTop: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 4 }}>
                    Título Original
                  </span>
                  <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)", fontWeight: 500 }}>
                    {movie.original_title || "—"}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 4 }}>
                    Lançamento
                  </span>
                  <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)", fontWeight: 500 }}>
                    {formattedDate}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 4 }}>
                    Direção
                  </span>
                  <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)", fontWeight: 500 }}>
                    {director?.name || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Elenco Principal */}
          {cast.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: 20 }}>
                Elenco Principal
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 16,
                }}
              >
                {cast.map((actor) => (
                  <div
                    key={actor.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      overflow: "hidden",
                      textAlign: "center",
                      transition: "transform 0.2s",
                    }}
                    className="cast-card"
                  >
                    <div style={{ position: "relative", aspectRatio: "1/1.2", width: "100%", background: "var(--surface-2)" }}>
                      <Image
                        src={getTMDBImageUrl(actor.profile_path, "w185")}
                        alt={actor.name}
                        fill
                        sizes="120px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ padding: "8px 6px" }}>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={actor.name}>
                        {actor.name}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={actor.character}>
                        {actor.character}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trailer Oficial */}
          {trailer && (
            <section style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Film size={18} color="var(--accent)" />
                Trailer Oficial
              </h3>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "560px",
                  aspectRatio: "16/9",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            </section>
          )}

          {/* ─── RESENHAS EDITORIAIS ─────────────────────────────────────── */}
          <section style={{ marginTop: 56, borderTop: "1px solid var(--border)", paddingTop: 48 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#fff",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <BookOpen size={20} color="var(--accent)" />
                Resenhas Editoriais
              </h2>
              <Link
                href={session?.user?.id ? `/resenhas/new?movieId=${tmdbId}` : "/login"}
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "var(--accent)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Plus size={14} />
                Escrever Resenha
              </Link>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 32 }}>
              Análises completas e ensaios aprofundados sobre o filme escritos por cinéfilos da comunidade.
            </p>

            {essays.length === 0 ? (
              <div
                style={{
                  padding: "40px 24px",
                  textAlign: "center",
                  background: "var(--surface)",
                  border: "1px dashed var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                }}
              >
                Nenhuma resenha editorial escrita para este filme ainda.{" "}
                <Link
                  href={session?.user?.id ? `/resenhas/new?movieId=${tmdbId}` : "/login"}
                  style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "underline" }}
                >
                  Seja o primeiro a escrever!
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 20,
                }}
              >
                {essays.map((essay) => {
                  const authorName = essay.user.name || essay.user.email.split("@")[0];
                  const cleanPreview = essay.content
                    .replace(/[#*`>!\[\]()]/g, "")
                    .slice(0, 120) + "...";

                  return (
                    <div
                      key={essay.id}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-lg)",
                        padding: 24,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        transition: "all 0.25s ease",
                      }}
                      className="movie-detail-essay-card"
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <h4 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 700, lineHeight: 1.3 }}>
                          <Link
                            href={`/resenhas/${essay.id}`}
                            style={{ color: "#fff", textDecoration: "none" }}
                            className="essay-title-hover"
                          >
                            {essay.title}
                          </Link>
                        </h4>
                        {essay.isSpoiler && (
                          <span
                            style={{
                              fontSize: "0.625rem",
                              fontWeight: 800,
                              color: "var(--red)",
                              background: "rgba(224, 82, 82, 0.1)",
                              border: "1px solid rgba(224, 82, 82, 0.2)",
                              padding: "1px 6px",
                              borderRadius: 4,
                              flexShrink: 0,
                            }}
                          >
                            SPOILER
                          </span>
                        )}
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", margin: 0, lineHeight: 1.5 }}>
                        {cleanPreview}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "auto",
                          paddingTop: 12,
                          borderTop: "1px solid rgba(255,255,255,0.03)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Link
                            href={`/profile/${essay.user.id}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                              textDecoration: "none",
                            }}
                            className="essay-author-hover"
                          >
                            <div style={{ width: 18, height: 18, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border)" }}>
                              <img
                                src={essay.user.image || "/placeholder-avatar.jpg"}
                                alt={authorName}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                            <span style={{ fontWeight: 600 }}>{authorName}</span>
                          </Link>

                          <LikeEssayButton
                            essayId={essay.id}
                            initialLikesCount={essay.likes.length}
                            initialLiked={essay.likes.some((like) => like.userId === session?.user?.id)}
                            isLoggedIn={!!session?.user?.id}
                          />
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {new Date(essay.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ─── AVALIAÇÕES E REVIEWS ─────────────────────────────────────── */}
          <section style={{ marginTop: 40, borderTop: "1px solid var(--border)", paddingTop: 48 }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <MessageSquare size={20} color="var(--accent)" />
              Avaliações da Comunidade
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 32 }}>
              {dbRatingsCount === 0
                ? "Este filme ainda não tem avaliações. Seja o primeiro a opinar!"
                : `${dbRatingsCount} ${dbRatingsCount === 1 ? "avaliação registrada" : "avaliações registradas"} no CineVerse.`}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 40,
              }}
              className="reviews-wrapper"
            >
              {/* Layout de duas colunas para formulário + lista de avaliações */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "var(--reviews-grid, 1fr 1.5fr)",
                  gap: 48,
                  alignItems: "start",
                }}
                className="reviews-grid-wrapper"
              >
                {/* Coluna 1: Formulário de Envio + Vibe Tracker */}
                <div style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 24 }}>
                  <CommunityVibeTracker reviews={reviews} />
                  <ReviewForm tmdbId={tmdbId} initialReview={userReview} />
                </div>

                {/* Coluna 2: Lista de Avaliações */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {reviews.length === 0 ? (
                    <div
                      style={{
                        padding: "48px 24px",
                        textAlign: "center",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Nenhum comentário ainda. Escreva sua crítica no formulário ao lado!
                    </div>
                  ) : (
                    reviews.map((rev) => {
                      const userInitials = rev.user.name
                        ? rev.user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                        : rev.user.email.substring(0, 2).toUpperCase();

                      return (
                        <div
                          key={rev.id}
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-lg)",
                            padding: 24,
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                          }}
                        >
                          {/* Top: Usuário e Nota */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <Link href={`/profile/${rev.user.id}`}>
                                {rev.user.image ? (
                                  <div style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border)" }}>
                                    <img
                                      src={rev.user.image}
                                      alt={rev.user.name || "User Avatar"}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: "50%",
                                      background: "var(--surface-3)",
                                      border: "1px solid var(--border)",
                                      color: "var(--accent)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.875rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {userInitials}
                                  </div>
                                )}
                              </Link>
                              <div>
                                <Link 
                                  href={`/profile/${rev.user.id}`}
                                  className="review-author-link"
                                >
                                  <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: 2 }}>
                                    {rev.user.name || rev.user.email.split("@")[0]}
                                  </h4>
                                </Link>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                  {new Date(rev.createdAt).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Estrelas */}
                            <div style={{ display: "flex", gap: 2 }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={14}
                                  fill={s <= rev.rating ? "var(--accent)" : "none"}
                                  color={s <= rev.rating ? "var(--accent)" : "var(--text-muted)"}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Tags de Reação do Usuário */}
                          {rev.tags && rev.tags.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
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
                                      fontSize: "0.7rem",
                                      fontWeight: 700,
                                      padding: "2px 8px",
                                      borderRadius: 12,
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

                          {/* Comentário */}
                          <SpoilerReviewContent content={rev.content} isSpoiler={rev.isSpoiler} />

                          {/* Ações da Review: Curtidas e Comentários */}
                          <ReviewCommentsSection
                            reviewId={rev.id}
                            initialCommentsCount={rev._count?.comments ?? 0}
                            isLoggedIn={!!session?.user?.id}
                            currentUserId={session?.user?.id}
                            isAdmin={session?.user?.role === "ADMIN"}
                          >
                            <LikeReviewButton
                              reviewId={rev.id}
                              initialLikesCount={rev.likes.length}
                              initialLiked={rev.likes.some((like) => like.userId === session?.user?.id)}
                              isLoggedIn={!!session?.user?.id}
                            />
                          </ReviewCommentsSection>
                        </div>
                      );
                    })
                  )}
                  <style precedence="default" href="page-styles-1">{`
                    .review-author-link {
                      text-decoration: none;
                      color: #fff !important;
                      transition: color 0.15s ease;
                    }
                    .review-author-link:hover {
                      color: var(--accent) !important;
                    }
                  `}</style>
                </div>
              </div>
            </div>
          </section>

          {/* ─── CRÍTICAS INTERNACIONAIS (TMDB) ─────────────────────────────── */}
          {tmdbReviews.length > 0 && (
            <section style={{ marginTop: 56, borderTop: "1px solid var(--border)", paddingTop: 48 }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Globe size={20} color="var(--accent)" />
                Críticas Internacionais (TMDB)
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 32 }}>
                Principais avaliações e comentários de usuários reais importados do TMDB.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {tmdbReviews.slice(0, 5).map((rev) => {
                  const avatarUrl = rev.author_details?.avatar_path
                    ? rev.author_details.avatar_path.startsWith("/http")
                      ? rev.author_details.avatar_path.substring(1)
                      : getTMDBImageUrl(rev.author_details.avatar_path, "w185")
                    : null;

                  const rating = rev.author_details?.rating;
                  const formattedDate = rev.created_at
                    ? new Date(rev.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "";

                  const authorInitials = rev.author
                    ? rev.author.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
                    : "U";

                  return (
                    <div
                      key={rev.id}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-lg)",
                        padding: 24,
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      {/* Top: Autor e Nota */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {avatarUrl ? (
                            <div style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border)" }}>
                              <img
                                src={avatarUrl}
                                alt={rev.author}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: "var(--surface-3)",
                                border: "1px solid var(--border)",
                                color: "var(--accent)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                              }}
                            >
                              {authorInitials}
                            </div>
                          )}
                          <div>
                            <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#fff" }}>
                              {rev.author}
                            </h4>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {formattedDate}
                            </span>
                          </div>
                        </div>

                        {/* Nota */}
                        {rating && (
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            background: "rgba(232, 180, 75, 0.12)",
                            border: "1px solid rgba(232, 180, 75, 0.25)",
                            borderRadius: "100px",
                            padding: "4px 10px",
                            color: "var(--accent)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}>
                            <Star size={11} fill="currentColor" />
                            <span>{rating} / 10</span>
                          </div>
                        )}
                      </div>

                      {/* Conteúdo com Clamp/Scroll */}
                      <div 
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.875rem",
                          lineHeight: 1.6,
                          maxHeight: "180px",
                          overflowY: "auto",
                          paddingRight: "10px",
                          whiteSpace: "pre-line",
                        }}
                        className="custom-scrollbar"
                      >
                        {rev.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ─── CSS EMBEDDED PARA COMPATIBILIDADE RESPONSIVA ───────────────── */}
      <style precedence="default" href="page-styles-2">{`
        @media (max-width: 768px) {
          .movie-grid-wrapper {
            grid-template-columns: 1fr !important;
          }
          .reviews-grid-wrapper {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
        @media (min-width: 769px) {
          :root {
            --main-grid: 300px 1fr;
            --reviews-grid: 1fr 1.5fr;
          }
        }
        .cast-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover) !important;
        }
        .movie-detail-essay-card:hover {
          border-color: var(--border-hover) !important;
          background: var(--surface-2) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .essay-title-hover {
          transition: color 0.2s;
        }
        .essay-title-hover:hover {
          color: var(--accent) !important;
        }
        .essay-author-hover {
          transition: color 0.2s;
        }
        .essay-author-hover:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
