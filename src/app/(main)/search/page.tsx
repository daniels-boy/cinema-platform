import { searchMovies } from "@/lib/tmdb";
import MovieCard from "@/components/movies/MovieCard";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Sparkles, Users, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import UserAvatar from "@/components/ui/UserAvatar";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q, type = "movies" } = await searchParams;
  const label = type === "users" ? "Cinéfilos" : type === "essays" ? "Resenhas" : "Filmes";
  return {
    title: q ? `Busca de ${label}: "${q}" | CineVerse` : `Pesquisar ${label} | CineVerse`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = "", page = "1", type = "movies" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const isMoviesTab = type === "movies";

  let movies: any[] = [];
  let users: any[] = [];
  let essays: any[] = [];
  let totalPages = 0;
  let totalResults = 0;
  let error = null;

  if (query.trim()) {
    if (isMoviesTab) {
      try {
        const searchData = await searchMovies(query.trim(), currentPage);
        movies = searchData?.results || [];
        totalPages = searchData?.total_pages || 0;
        totalResults = searchData?.total_results || 0;
      } catch (err) {
        console.error("Erro ao realizar busca no TMDB:", err);
        error = "Ocorreu um erro ao buscar os filmes. Por favor, tente novamente.";
      }
    } else if (type === "users") {
      // Busca de usuários no banco local
      try {
        const usersPerPage = 12;
        totalResults = await prisma.user.count({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
        });

        users = await prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            _count: {
              select: {
                followers: true,
                reviews: true,
              },
            },
          },
          skip: (currentPage - 1) * usersPerPage,
          take: usersPerPage,
        });

        totalPages = Math.ceil(totalResults / usersPerPage);
      } catch (err) {
        console.error("Erro ao realizar busca de cinéfilos:", err);
        error = "Ocorreu um erro ao buscar cinéfilos. Por favor, tente novamente.";
      }
    } else if (type === "essays") {
      // Busca de resenhas no banco local
      try {
        const essaysPerPage = 10;
        totalResults = await prisma.essay.count({
          where: {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
              { movieTitle: { contains: query, mode: "insensitive" } },
            ],
          },
        });

        essays = await prisma.essay.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
              { movieTitle: { contains: query, mode: "insensitive" } },
            ],
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (currentPage - 1) * essaysPerPage,
          take: essaysPerPage,
        });

        totalPages = Math.ceil(totalResults / essaysPerPage);
      } catch (err) {
        console.error("Erro ao realizar busca de resenhas:", err);
        error = "Ocorreu um erro ao buscar resenhas. Por favor, tente novamente.";
      }
    }
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 80 }}>
      <div className="container">
        {/* Formulário de Busca */}
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto 32px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#fff",
              marginBottom: 16,
            }}
            className="font-display"
          >
            {type === "movies"
              ? "Encontre seu próximo filme"
              : type === "users"
              ? "Encontre outros cinéfilos"
              : "Encontre resenhas completas"}
          </h1>
          <form
            action="/search"
            method="GET"
            style={{
              display: "flex",
              gap: 8,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "6px 8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {/* Mantém a aba atual selecionada após o envio */}
            <input type="hidden" name="type" value={type} />
            
            <div style={{ display: "flex", alignItems: "center", flexGrow: 1, paddingLeft: 12, color: "var(--text-secondary)" }}>
              <Search size={18} />
              <input
                type="text"
                name="q"
                required
                defaultValue={query}
                placeholder={
                  type === "movies"
                    ? "Busque por título..."
                    : type === "users"
                    ? "Busque por nome ou email..."
                    : "Busque por título do filme ou palavras-chave..."
                }
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  padding: "8px 12px",
                  fontSize: "0.9375rem",
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 48 }}>
          <Link
            href={`/search?q=${encodeURIComponent(query)}&type=movies`}
            style={{
              padding: "8px 24px",
              borderRadius: 20,
              fontSize: "0.875rem",
              fontWeight: 700,
              background: type === "movies" ? "var(--accent)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${type === "movies" ? "var(--accent)" : "var(--border)"}`,
              color: type === "movies" ? "#0a0a0f" : "#fff",
              transition: "all 0.2s",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Film size={14} />
            Filmes
          </Link>
          <Link
            href={`/search?q=${encodeURIComponent(query)}&type=essays`}
            style={{
              padding: "8px 24px",
              borderRadius: 20,
              fontSize: "0.875rem",
              fontWeight: 700,
              background: type === "essays" ? "var(--accent)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${type === "essays" ? "var(--accent)" : "var(--border)"}`,
              color: type === "essays" ? "#0a0a0f" : "#fff",
              transition: "all 0.2s",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <BookOpen size={14} />
            Resenhas
          </Link>
          <Link
            href={`/search?q=${encodeURIComponent(query)}&type=users`}
            style={{
              padding: "8px 24px",
              borderRadius: 20,
              fontSize: "0.875rem",
              fontWeight: 700,
              background: type === "users" ? "var(--accent)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${type === "users" ? "var(--accent)" : "var(--border)"}`,
              color: type === "users" ? "#0a0a0f" : "#fff",
              transition: "all 0.2s",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Users size={14} />
            Cinéfilos
          </Link>
        </div>

        {/* Exibição de Resultados */}
        {query ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                borderBottom: "1px solid var(--border)",
                paddingBottom: 16,
                marginBottom: 32,
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
                Resultados para &ldquo;<span style={{ color: "var(--accent)" }}>{query}</span>&rdquo;
              </h2>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                {totalResults}{" "}
                {type === "movies"
                  ? totalResults === 1
                    ? "filme encontrado"
                    : "filmes encontrados"
                  : type === "users"
                  ? totalResults === 1
                    ? "cinéfilo encontrado"
                    : "cinéfilos encontrados"
                  : totalResults === 1
                  ? "resenha encontrada"
                  : "resenhas encontradas"}
              </span>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(224, 82, 82, 0.1)",
                  border: "1px solid rgba(224, 82, 82, 0.25)",
                  color: "var(--red)",
                  borderRadius: "var(--radius)",
                  padding: 16,
                  textAlign: "center",
                  margin: "24px 0",
                }}
              >
                {error}
              </div>
            )}

            {type === "movies" ? (
              // ABA DE FILMES
              movies.length === 0 ? (
                <div className="empty-search-state">
                  <Sparkles size={36} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                  <h3 style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 700, marginBottom: 8 }}>
                    Nenhum filme encontrado
                  </h3>
                  <p style={{ maxWidth: 420, margin: "0 auto", fontSize: "0.875rem" }}>
                    Verifique a grafia do título ou tente pesquisar por outros termos e palavras-chave.
                  </p>
                </div>
              ) : (
                <>
                  <div className="movies-grid">
                    {movies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                  {renderPagination(currentPage, totalPages, query, type)}
                </>
              )
            ) : type === "users" ? (
              // ABA DE CINÉFILOS
              users.length === 0 ? (
                <div className="empty-search-state">
                  <Users size={36} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                  <h3 style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 700, marginBottom: 8 }}>
                    Nenhum cinéfilo encontrado
                  </h3>
                  <p style={{ maxWidth: 420, margin: "0 auto", fontSize: "0.875rem" }}>
                    Tente buscar por partes diferentes do nome ou endereço de e-mail.
                  </p>
                </div>
              ) : (
                <>
                  <div className="users-search-grid">
                    {users.map((u) => {
                      const displayName = u.name || u.email.split("@")[0];
                      const avatarUrl = u.image || "/placeholder-avatar.jpg";
                      return (
                        <Link
                          key={u.id}
                          href={`/profile/${u.id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-lg)",
                            padding: 16,
                            textDecoration: "none",
                            transition: "all 0.25s ease",
                          }}
                          className="user-search-card"
                        >
                          <div
                            style={{
                              position: "relative",
                              width: 56,
                              height: 56,
                              borderRadius: "50%",
                              overflow: "hidden",
                              border: "2px solid var(--border)",
                              background: "var(--surface-2)",
                              flexShrink: 0,
                            }}
                          >
                            <UserAvatar
                              src={avatarUrl}
                              alt={displayName}
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                            <h4
                              style={{
                                fontSize: "1.0625rem",
                                fontWeight: 700,
                                color: "#fff",
                                margin: "0 0 4px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {displayName}
                            </h4>
                            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                              {u._count.reviews} {u._count.reviews === 1 ? "avaliação" : "avaliações"} · {u._count.followers} {u._count.followers === 1 ? "seguidor" : "seguidores"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {renderPagination(currentPage, totalPages, query, type)}
                </>
              )
            ) : (
              // ABA DE RESENHAS
              essays.length === 0 ? (
                <div className="empty-search-state">
                  <BookOpen size={36} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                  <h3 style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 700, marginBottom: 8 }}>
                    Nenhuma resenha encontrada
                  </h3>
                  <p style={{ maxWidth: 420, margin: "0 auto", fontSize: "0.875rem" }}>
                    Tente buscar por outras palavras-chave, títulos de filmes ou autores.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {essays.map((essay) => {
                      const authorName = essay.user.name || essay.user.email.split("@")[0];
                      const posterPath = essay.moviePoster;
                      const posterUrl = posterPath
                        ? (posterPath.startsWith("http") ? posterPath : `https://image.tmdb.org/t/p/w185${posterPath}`)
                        : null;
                      const summary = essay.content
                        .replace(/[#*`>!\[\]()]/g, "")
                        .slice(0, 160) + "...";

                      return (
                        <div
                          key={essay.id}
                          style={{
                            display: "flex",
                            gap: 20,
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-lg)",
                            padding: 20,
                          }}
                          className="search-essay-card"
                        >
                          {/* Poster Thumbnail */}
                          <Link
                            href={`/resenhas/${essay.id}`}
                            style={{
                              position: "relative",
                              width: 60,
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
                                alt={essay.movieTitle}
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
                                  fontWeight: 700,
                                }}
                              >
                                {essay.movieTitle}
                              </div>
                            )}
                          </Link>

                          {/* Info */}
                          <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--accent)" }}>
                                {essay.movieTitle}
                              </span>
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
                                  }}
                                >
                                  SPOILER
                                </span>
                              )}
                            </div>

                            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", margin: "0 0 6px 0", lineHeight: 1.3 }}>
                              <Link href={`/resenhas/${essay.id}`} style={{ color: "#fff", textDecoration: "none" }} className="essay-title-hover">
                                {essay.title}
                              </Link>
                            </h3>

                            <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                              {summary}
                            </p>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "auto",
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              <Link
                                href={`/profile/${essay.user.id}`}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: "var(--text-muted)" }}
                                className="essay-author-hover"
                              >
                                <div style={{ width: 16, height: 16, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border)" }}>
                                  <img
                                    src={essay.user.image || "/placeholder-avatar.jpg"}
                                    alt={authorName}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                </div>
                                <span style={{ fontWeight: 600 }}>{authorName}</span>
                              </Link>
                              <span>{new Date(essay.createdAt).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {renderPagination(currentPage, totalPages, query, type)}
                </>
              )
            )}
          </div>
        ) : (
          /* Página inicial de busca vazia */
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "80px 24px",
              textAlign: "center",
              color: "var(--text-secondary)",
              maxWidth: 800,
              margin: "0 auto",
            }}
          >
            {type === "movies" ? (
              <>
                <Search size={40} color="var(--accent)" style={{ marginBottom: 16 }} />
                <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>
                  O que você quer assistir hoje?
                </h3>
                <p style={{ maxWidth: 440, margin: "0 auto", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  Digite o título do filme que deseja avaliar, favoritar ou adicionar na sua lista de interesses no campo de pesquisa acima.
                </p>
              </>
            ) : type === "users" ? (
              <>
                <Users size={40} color="var(--accent)" style={{ marginBottom: 16 }} />
                <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>
                  Quem você quer encontrar hoje?
                </h3>
                <p style={{ maxWidth: 440, margin: "0 auto", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  Pesquise por outros cinéfilos pelo nome ou e-mail para acompanhar as suas críticas e listas personalizadas.
                </p>
              </>
            ) : (
              <>
                <BookOpen size={40} color="var(--accent)" style={{ marginBottom: 16 }} />
                <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>
                  Que análise você deseja ler hoje?
                </h3>
                <p style={{ maxWidth: 440, margin: "0 auto", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  Digite o título do filme ou palavras-chave para encontrar resenhas e newsletters editoriais profundas de cinema.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .empty-search-state {
          background: var(--surface);
          border: 1px dashed var(--border);
          border-radius: var(--radius-lg);
          padding: 64px 24px;
          text-align: center;
          color: var(--text-secondary);
        }
        .users-search-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .user-search-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover) !important;
          box-shadow: 0 12px 24px rgba(0,0,0,0.5);
          background: var(--surface-2) !important;
        }
        .search-essay-card {
          transition: all 0.25s ease;
        }
        .search-essay-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover) !important;
          box-shadow: 0 12px 24px rgba(0,0,0,0.5);
          background: var(--surface-2) !important;
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

// Icones para o tab selector
const Film = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 3v18" />
    <path d="M17 3v18" />
    <path d="M3 7h4" />
    <path d="M3 12h18" />
    <path d="M3 17h4" />
    <path d="M17 7h4" />
    <path d="M17 17h4" />
  </svg>
);

function renderPagination(currentPage: number, totalPages: number, query: string, type: string) {
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        marginTop: 56,
      }}
    >
      {currentPage > 1 ? (
        <Link
          href={`/search?q=${encodeURIComponent(query)}&type=${type}&page=${currentPage - 1}`}
          className="btn btn-ghost"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ChevronLeft size={16} />
          Anterior
        </Link>
      ) : (
        <button
          disabled
          className="btn btn-ghost"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: 0.4, cursor: "not-allowed" }}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>
      )}

      <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
        Página <strong style={{ color: "#fff" }}>{currentPage}</strong> de {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={`/search?q=${encodeURIComponent(query)}&type=${type}&page=${currentPage + 1}`}
          className="btn btn-ghost"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          Próxima
          <ChevronRight size={16} />
        </Link>
      ) : (
        <button
          disabled
          className="btn btn-ghost"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: 0.4, cursor: "not-allowed" }}
        >
          Próxima
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
