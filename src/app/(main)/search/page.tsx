import { searchMovies } from "@/lib/tmdb";
import MovieCard from "@/components/movies/MovieCard";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Busca: "${q}" | CineVerse` : "Pesquisar Filmes | CineVerse",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  let searchData = null;
  let error = null;

  if (query.trim()) {
    try {
      searchData = await searchMovies(query.trim(), currentPage);
    } catch (err) {
      console.error("Erro ao realizar busca no TMDB:", err);
      error = "Ocorreu um erro ao buscar os filmes. Por favor, tente novamente.";
    }
  }

  const movies = searchData?.results || [];
  const totalPages = searchData?.total_pages || 0;
  const totalResults = searchData?.total_results || 0;

  return (
    <div style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 80 }}>
      <div className="container">
        {/* Formulário de Busca na própria página */}
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto 48px",
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
            Encontre seu próximo filme
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
            <div style={{ display: "flex", alignItems: "center", flexGrow: 1, paddingLeft: 12, color: "var(--text-secondary)" }}>
              <Search size={18} />
              <input
                type="text"
                name="q"
                required
                defaultValue={query}
                placeholder="Busque por título..."
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
                {totalResults} {totalResults === 1 ? "filme encontrado" : "filmes encontrados"}
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

            {movies.length === 0 ? (
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
                <Sparkles size={36} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                <h3 style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 700, marginBottom: 8 }}>
                  Nenhum resultado encontrado
                </h3>
                <p style={{ maxWidth: 420, margin: "0 auto", fontSize: "0.875rem" }}>
                  Verifique a grafia do título ou tente pesquisar por outros termos e palavras-chave.
                </p>
              </div>
            ) : (
              <>
                {/* Grid de Filmes */}
                <div className="movies-grid">
                  {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
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
                        href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
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
                        href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
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
                )}
              </>
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
            <Search size={40} color="var(--accent)" style={{ marginBottom: 16 }} />
            <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>
              O que você quer assistir hoje?
            </h3>
            <p style={{ maxWidth: 440, margin: "0 auto", fontSize: "0.875rem", lineHeight: 1.6 }}>
              Digite o título do filme que deseja avaliar, favoritar ou adicionar na sua lista de interesses no campo de pesquisa acima.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
