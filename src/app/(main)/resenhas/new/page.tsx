"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { searchMoviesAction, getMovieDetailsAction } from "@/actions/movies";
import { createEssay } from "@/actions/essays";
import { useSession } from "next-auth/react";
import { Search, Loader2, Sparkles, Film, AlignLeft, Eye, Edit2, Image as ImageIcon, Link as LinkIcon, Bold, Italic, Quote, Heading } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTMDBImageUrl } from "@/lib/tmdb";

// Sugestão de GIFs de cinema populares
const PRESET_GIFS = [
  { id: "popcorn", label: "Pipoca 🍿", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2QzM3JpMTB1azJ2bTV3NGEzOWltaTVvdHR3eGlxbWFtZWRoazZqayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hVTouq08miyVo1a21m/giphy.gif" },
  { id: "projector", label: "Projetor 📽️", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWdzczB5cG05MnY1amRjZjh5MG5rZW1hNmE1OXd0ODFhd29kNmQydSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7rc0qDiUkav8J5aq/giphy.gif" },
  { id: "applause", label: "Palmas 👏", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczJnd2k4MmpnZzNmdmE0NGg1bnY4cTJrdTBzMXpveWZkcWV0ZnNmbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41YmQjdoKs4hg3tK/giphy.gif" },
  { id: "clapper", label: "Claquete 🎬", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHgyYnNlMnpucWptYmtuYzdtMGt0OTV3ZWhjMnR2aTh6czY1Z3JjYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26gsjCZpPolPr3sBy/giphy.gif" },
];

function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";
  // Escapar caracteres perigosos
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Converter Títulos
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // Converter Citação (> )
  html = html.replace(/^&gt;\s+(.*?)$/gm, "<blockquote>$1</blockquote>");

  // Converter Imagens/Gifs: ![legenda](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<div class="preview-img-container"><img src="$2" alt="$1" /><span class="preview-img-caption">$1</span></div>');

  // Converter Links: [texto](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--accent); text-decoration:underline;">$1</a>');

  // Converter Negrito: **texto**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Converter Itálico: *texto*
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Separar parágrafos
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<div class=\"preview-img")
      ) {
        return trimmed;
      }
      return `<p style="line-height: 1.6; margin-bottom: 16px; color: var(--text-secondary); font-size: 0.9375rem;">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");

  return html;
}

function NewEssayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieIdParam = searchParams.get("movieId");
  const { data: session, status } = useSession();

  // Estados do formulário
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  // Estado do filme selecionado
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  // Efeito para carregar filme pré-selecionado se vier como query param (?movieId=...)
  useEffect(() => {
    if (movieIdParam) {
      const tmdbId = Number(movieIdParam);
      if (!isNaN(tmdbId)) {
        setSearchLoading(true);
        getMovieDetailsAction(tmdbId)
          .then((res) => {
            if (res.movie) {
              setSelectedMovie(res.movie);
              setShowSearchBox(false);
            }
            setSearchLoading(false);
          })
          .catch(() => setSearchLoading(false));
      }
    }
  }, [movieIdParam]);

  // Estados de busca de filmes
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(true);

  // Estados de controle da barra de ferramentas
  const [showImageInserter, setShowImageInserter] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  const handleMovieSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setError(null);
    try {
      const res = await searchMoviesAction(searchQuery.trim());
      if (res.error) {
        setError(res.error);
      } else {
        setSearchResults(res.results || []);
      }
    } catch (err) {
      setError("Erro ao pesquisar filmes.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectMovie = (movie: any) => {
    setSelectedMovie(movie);
    setShowSearchBox(false);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleRemoveMovie = () => {
    setSelectedMovie(null);
    setShowSearchBox(true);
  };

  // Funções auxiliares do editor
  const insertTextAtCursor = (before: string, after = "") => {
    const textarea = document.getElementById("essay-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = before + (selectedText || "texto") + after;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);

    // Foca novamente no textarea e posiciona o cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText || "texto").length);
    }, 50);
  };

  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    const caption = imageCaption.trim() || "Legenda";
    insertTextAtCursor(`\n![${caption}](${imageUrl.trim()})\n`);
    setImageUrl("");
    setImageCaption("");
    setShowImageInserter(false);
  };

  const handleInsertPresetGif = (gifUrl: string, gifLabel: string) => {
    insertTextAtCursor(`\n![${gifLabel}](${gifUrl})\n`);
  };

  const handlePublish = async () => {
    if (!selectedMovie) {
      setError("Por favor, selecione um filme tema para a sua resenha.");
      return;
    }

    if (!title.trim()) {
      setError("Insira um título para o seu artigo.");
      return;
    }

    if (content.trim().length < 10) {
      setError("Escreva uma resenha detalhada (mínimo de 10 caracteres).");
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      const res = await createEssay({
        title: title.trim(),
        content: content.trim(),
        tmdbId: selectedMovie.id,
        movieTitle: selectedMovie.title,
        moviePoster: selectedMovie.poster_path,
        isSpoiler,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.essayId) {
        router.push(`/resenhas/${res.essayId}`);
      }
    } catch (err) {
      setError("Ocorreu um erro interno ao publicar.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        
        {/* Título Superior */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff", marginBottom: 6 }} className="font-display">
            Criar Resenha Editorial 📝
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>
            Publique ensaios longos, formate citações e adicione GIFs ou imagens para dar corpo à sua análise.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(224, 82, 82, 0.08)",
              border: "1px solid rgba(224, 82, 82, 0.25)",
              color: "var(--red)",
              borderRadius: "var(--radius)",
              padding: 16,
              fontSize: "0.875rem",
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        {/* ─── PASSO 1: SELECIONAR FILME ────────────────────────────────────── */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#fff", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <Film size={15} color="var(--accent)" />
            1. Qual filme você quer resenhar?
          </h3>

          {/* Filme Escolhido */}
          {selectedMovie && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ position: "relative", width: 32, aspectRatio: "2/3", borderRadius: 2, overflow: "hidden" }}>
                  <img
                    src={getTMDBImageUrl(selectedMovie.poster_path, "w92")}
                    alt={selectedMovie.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>
                    {selectedMovie.title}
                  </span>
                  {selectedMovie.release_date && (
                    <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginLeft: 6 }}>
                      ({new Date(selectedMovie.release_date).getFullYear()})
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveMovie}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--red)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Trocar Filme
              </button>
            </div>
          )}

          {/* Buscador de Filme */}
          {showSearchBox && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <form onSubmit={handleMovieSearch} style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Pesquise o título do filme..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flexGrow: 1,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    color: "#fff",
                    padding: "8px 14px",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="btn btn-ghost"
                  style={{ padding: "0 16px", height: 38, borderRadius: "var(--radius-sm)" }}
                >
                  {searchLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </form>

              {/* Lista Resultados de Busca */}
              {searchResults.length > 0 && (
                <div
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {searchResults.slice(0, 5).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMovie(m)}
                      style={{
                        background: "none",
                        border: "none",
                        borderBottom: "1px solid var(--border)",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <div style={{ position: "relative", width: 22, aspectRatio: "2/3", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                        <img
                          src={getTMDBImageUrl(m.poster_path, "w92")}
                          alt={m.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: "#fff", fontWeight: 700 }}>
                        {m.title}
                        {m.release_date && (
                          <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 6 }}>
                            ({new Date(m.release_date).getFullYear()})
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── PASSO 2: ESCREVER ARTIGO ────────────────────────────────────── */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 20 }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <AlignLeft size={15} color="var(--accent)" />
              2. Redigir Conteúdo
            </h3>

            {/* Abas Escrever / Visualizar */}
            <div style={{ display: "flex", gap: 4, background: "var(--surface-2)", padding: 3, borderRadius: 6 }}>
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  background: activeTab === "write" ? "var(--surface-3)" : "transparent",
                  color: activeTab === "write" ? "#fff" : "var(--text-secondary)",
                  transition: "all 0.2s",
                }}
              >
                <Edit2 size={12} />
                Escrever
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  background: activeTab === "preview" ? "var(--surface-3)" : "transparent",
                  color: activeTab === "preview" ? "#fff" : "var(--text-secondary)",
                  transition: "all 0.2s",
                }}
              >
                <Eye size={12} />
                Visualizar
              </button>
            </div>
          </div>

          {activeTab === "write" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Input de Título */}
              <input
                type="text"
                placeholder="Título da sua resenha..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  color: "#fff",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  padding: "6px 0 12px 0",
                  outline: "none",
                  width: "100%",
                }}
              />

              {/* Barra de Ferramentas de Formatação */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px 10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("**", "**")}
                  title="Negrito"
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 4 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("*", "*")}
                  title="Itálico"
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 4 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("\n# ")}
                  title="Título Principal (H1)"
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 4 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <Heading size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("\n> ")}
                  title="Bloco de Citação"
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 4 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <Quote size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("[link](", ")")}
                  title="Inserir Link"
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 4 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <LinkIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageInserter(!showImageInserter)}
                  title="Inserir Imagem / GIF"
                  style={{
                    background: showImageInserter ? "var(--surface-3)" : "none",
                    border: "none",
                    color: showImageInserter ? "var(--accent)" : "var(--text-muted)",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 4,
                  }}
                >
                  <ImageIcon size={14} />
                </button>
              </div>

              {/* Inseridor de Imagens */}
              {showImageInserter && (
                <form
                  onSubmit={handleInsertImage}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>Inserir Imagem por URL</span>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      type="url"
                      placeholder="URL da imagem ou GIF (ex: https://site.com/foto.jpg)"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      style={{
                        flexGrow: 1,
                        background: "var(--surface-3)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        color: "#fff",
                        padding: "6px 10px",
                        fontSize: "0.8125rem",
                        outline: "none",
                        minWidth: 240,
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Legenda da Imagem"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      style={{
                        width: 150,
                        background: "var(--surface-3)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        color: "#fff",
                        padding: "6px 10px",
                        fontSize: "0.8125rem",
                        outline: "none",
                      }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.8125rem" }}>
                      Inserir
                    </button>
                  </div>

                  {/* Preset GIF recommendations */}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                      Presets rápidos de GIFs de Cinema 🍿:
                    </span>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {PRESET_GIFS.map((gif) => (
                        <button
                          key={gif.id}
                          type="button"
                          onClick={() => handleInsertPresetGif(gif.url, gif.label)}
                          style={{
                            background: "var(--surface-3)",
                            border: "1px solid var(--border)",
                            borderRadius: 4,
                            color: "var(--text-secondary)",
                            fontSize: "0.7rem",
                            padding: "4px 8px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                        >
                          {gif.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              )}

              {/* Textarea Principal */}
              <textarea
                id="essay-textarea"
                placeholder="Escreva sua resenha completa aqui... Você pode usar formatação markdown ou a barra de ferramentas."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  minHeight: 340,
                  outline: "none",
                  resize: "vertical",
                  width: "100%",
                  fontFamily: "inherit",
                }}
              />
              
              {/* Contador de Caracteres */}
              <div style={{ alignSelf: "flex-end", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {content.length} caracteres
              </div>
            </div>
          ) : (
            // PREVIEW PANEL
            <div style={{ padding: "12px 0" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0 0 20px 0", lineHeight: 1.2 }}>
                {title || "Sem título"}
              </h1>
              
              <div className="essay-preview" dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(content) }} />
              
              {!content.trim() && (
                <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontStyle: "italic", textAlign: "center", padding: "40px 0" }}>
                  Nada para visualizar. Digite algo na aba &quot;Escrever&quot;.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── PASSO 3: SPOILER E PUBLICAR ─────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 24px",
          }}
        >
          {/* Spoiler Checkbox */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            <input
              type="checkbox"
              checked={isSpoiler}
              onChange={(e) => setIsSpoiler(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                accentColor: "var(--red)",
                cursor: "pointer",
              }}
            />
            <span>Contém Spoilers da trama do filme ⚠️</span>
          </label>

          <button
            onClick={handlePublish}
            disabled={publishing || !selectedMovie || !title.trim() || content.length < 10}
            className="btn btn-primary"
            style={{
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {publishing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                Publicar Resenha
              </>
            )}
          </button>
        </div>
      </div>

      <style precedence="default" href="page-styles-1">{`
        .essay-preview h1 {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 24px 0 12px;
          color: #fff;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
        }
        .essay-preview h2 {
          font-size: 1.35rem;
          font-weight: 700;
          margin: 20px 0 10px;
          color: #fff;
        }
        .essay-preview h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 16px 0 8px;
          color: #fff;
        }
        .essay-preview blockquote {
          border-left: 4px solid var(--accent);
          background: rgba(232, 180, 75, 0.04);
          padding: 12px 18px;
          margin: 18px 0;
          font-style: italic;
          color: var(--text-secondary);
          border-radius: 0 4px 4px 0;
        }
        .essay-preview .preview-img-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 24px 0;
          gap: 8px;
          width: 100%;
        }
        .essay-preview img {
          max-width: 100%;
          max-height: 400px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          object-fit: contain;
        }
        .essay-preview .preview-img-caption {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default function NewEssayPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
          <Loader2 className="animate-spin" size={32} color="var(--accent)" />
        </div>
      }
    >
      <NewEssayPageContent />
    </Suspense>
  );
}
