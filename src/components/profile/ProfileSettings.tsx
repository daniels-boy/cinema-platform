"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { updateProfile } from "@/actions/profile";
import { setFeaturedFavorite, searchMoviesAction } from "@/actions/movies";
import { Check, Loader2, AlertCircle, Sparkles, User, Link as LinkIcon, X, Plus, Search, Trash2, Film } from "lucide-react";
import Image from "next/image";
import { getTMDBImageUrl } from "@/lib/tmdb";

interface FeaturedFavoriteItem {
  position: number;
  tmdbId: number;
  movieTitle: string;
  moviePoster: string | null;
}

interface ProfileSettingsProps {
  initialName: string | null;
  initialImage: string | null;
  initialFeaturedFavorites: FeaturedFavoriteItem[];
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { id: "popcorn", path: "/avatars/popcorn.png", label: "Pipoca" },
  { id: "clapper", path: "/avatars/clapperboard.png", label: "Claquete" },
  { id: "glasses", path: "/avatars/3d-glasses.png", label: "Óculos 3D" },
  { id: "reel", path: "/avatars/film-reel.png", label: "Rolo de Filme" },
];

export default function ProfileSettings({
  initialName,
  initialImage,
  initialFeaturedFavorites,
  isOpen,
  onClose,
}: ProfileSettingsProps) {
  const { data: session, update } = useSession();
  const [name, setName] = useState(initialName ?? "");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(initialImage ?? "");
  const [customUrl, setCustomUrl] = useState<string>(
    initialImage && !PRESET_AVATARS.some((a) => a.path === initialImage) ? initialImage : ""
  );
  
  // Favoritos Destacados
  const [featuredFavs, setFeaturedFavs] = useState<FeaturedFavoriteItem[]>(initialFeaturedFavorites);
  const [activeSearchSlot, setActiveSearchSlot] = useState<number | null>(null);
  const [movieQuery, setMovieQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(initialName ?? "");
      setSelectedAvatar(initialImage ?? "");
      setCustomUrl(initialImage && !PRESET_AVATARS.some((a) => a.path === initialImage) ? initialImage : "");
      setFeaturedFavs(initialFeaturedFavorites);
      setActiveSearchSlot(null);
      setMovieQuery("");
      setSearchResults([]);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, initialName, initialImage, initialFeaturedFavorites]);

  const handleAvatarSelect = (path: string) => {
    setSelectedAvatar(path);
    setCustomUrl("");
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomUrl(val);
    setSelectedAvatar(val);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("O nome deve conter pelo menos 2 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const imageToSend = selectedAvatar || undefined;

    try {
      const res = await updateProfile({
        name: name.trim(),
        image: imageToSend,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        await update({
          name: name.trim(),
          image: imageToSend,
        });
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError("Ocorreu um erro ao atualizar o perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // --- Funções do Top 5 Favoritos ---
  const handleMovieSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieQuery.trim()) return;

    setSearchLoading(true);
    try {
      const res = await searchMoviesAction(movieQuery.trim());
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

  const handleSelectMovie = async (position: number, movie: any) => {
    setSlotLoading(position);
    setError(null);
    try {
      const res = await setFeaturedFavorite(position, movie.id);
      if (res.error) {
        setError(res.error);
      } else {
        // Atualizar estado local
        const updatedItem: FeaturedFavoriteItem = {
          position,
          tmdbId: movie.id,
          movieTitle: movie.title,
          moviePoster: movie.poster_path,
        };
        setFeaturedFavs((prev) => {
          const filtered = prev.filter((item) => item.position !== position);
          return [...filtered, updatedItem].sort((a, b) => a.position - b.position);
        });
        setActiveSearchSlot(null);
        setMovieQuery("");
        setSearchResults([]);
      }
    } catch (err) {
      setError("Erro ao salvar favorito destacado.");
    } finally {
      setSlotLoading(null);
    }
  };

  const handleRemoveMovie = async (position: number) => {
    setSlotLoading(position);
    setError(null);
    try {
      const res = await setFeaturedFavorite(position, null);
      if (res.error) {
        setError(res.error);
      } else {
        setFeaturedFavs((prev) => prev.filter((item) => item.position !== position));
      }
    } catch (err) {
      setError("Erro ao remover favorito destacado.");
    } finally {
      setSlotLoading(null);
    }
  };

  if (!isOpen) return null;

  const currentPreview = selectedAvatar || "/placeholder-avatar.jpg";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10, 10, 15, 0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px 28px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
        onClick={(e) => e.stopPropagation()}
        className="modal-enter-animation"
      >
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: 4,
            borderRadius: 6,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.background = "none";
          }}
        >
          <X size={20} />
        </button>

        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            Editar Perfil
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Personalize seu avatar, nome e selecione seus 5 filmes favoritos destacados.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(224, 82, 82, 0.1)",
              border: "1px solid rgba(224, 82, 82, 0.25)",
              color: "var(--red)",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              background: "rgba(82, 192, 122, 0.1)",
              border: "1px solid rgba(82, 192, 122, 0.25)",
              color: "var(--green)",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Check size={16} style={{ flexShrink: 0 }} />
            <span>Perfil atualizado com sucesso! Salvando...</span>
          </div>
        )}

        {/* ─── SECÇÃO 1: INFORMAÇÕES PESSOAIS ───────────────────────────────── */}
        <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Avatar e presets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Avatar do CineVerse
            </label>
            
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div
                style={{
                  position: "relative",
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid var(--accent)",
                  background: "var(--surface-2)",
                  boxShadow: "0 4px 16px rgba(232, 180, 75, 0.2)",
                  flexShrink: 0,
                }}
              >
                <img
                  src={currentPreview}
                  alt="Visualização do perfil"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "https://api.dicebear.com/7.x/bottts/svg?seed=cineverse";
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  Escolha um de nossos avatares exclusivos:
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  {PRESET_AVATARS.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.path;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => handleAvatarSelect(avatar.path)}
                        style={{
                          position: "relative",
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                          background: "var(--surface-3)",
                          cursor: "pointer",
                          padding: 0,
                          transition: "all 0.2s",
                          transform: isSelected ? "scale(1.08)" : "scale(1)",
                        }}
                        title={avatar.label}
                      >
                        <Image
                          src={avatar.path}
                          alt={avatar.label}
                          fill
                          sizes="40px"
                          style={{ objectFit: "cover" }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* URL de imagem externa */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
              <LinkIcon size={13} />
              Ou insira uma URL de imagem externa:
            </label>
            <input
              type="url"
              placeholder="https://exemplo.com/sua-foto.jpg"
              value={customUrl}
              onChange={handleCustomUrlChange}
              className="input"
              style={{
                fontSize: "0.875rem",
                background: "var(--surface-2)",
                padding: "8px 12px",
              }}
            />
          </div>

          {/* Nome completo */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
              <User size={13} />
              Nome completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Seu nome no CineVerse"
              style={{
                fontSize: "0.875rem",
                background: "var(--surface-2)",
                padding: "8px 12px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              alignSelf: "flex-end",
              padding: "8px 20px",
              minWidth: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 38,
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Sparkles size={14} />
                Salvar Dados
              </>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Film size={16} color="var(--accent)" />
            Favoritos Destacados (Top 5)
          </h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginBottom: 20 }}>
            Selecione 5 filmes para expor em destaque no topo do seu perfil, como no Letterboxd.
          </p>

          {/* Slots 1 a 5 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3, 4, 5].map((pos) => {
              const movie = featuredFavs.find((f) => f.position === pos);
              const isSearching = activeSearchSlot === pos;
              const isSlotLoading = slotLoading === pos;

              return (
                <div
                  key={pos}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--accent)" }}>
                      Posição #{pos}
                    </span>

                    {/* Botões de Ação */}
                    {!isSearching && (
                      <div style={{ display: "flex", gap: 8 }}>
                        {movie ? (
                          <button
                            onClick={() => handleRemoveMovie(pos)}
                            disabled={isSlotLoading}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--red)",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {isSlotLoading ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            Remover
                          </button>
                        ) : null}

                        <button
                          onClick={() => {
                            if (isSearching) {
                              setActiveSearchSlot(null);
                            } else {
                              setActiveSearchSlot(pos);
                              setSearchResults([]);
                              setMovieQuery("");
                            }
                          }}
                          disabled={isSlotLoading}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--accent)",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {movie ? "Alterar Filme" : "Escolher Filme"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Slot preenchido */}
                  {movie && !isSearching && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          position: "relative",
                          width: 32,
                          aspectRatio: "2/3",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          src={getTMDBImageUrl(movie.moviePoster, "w92")}
                          alt={movie.movieTitle}
                          fill
                          sizes="32px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>
                        {movie.movieTitle}
                      </span>
                    </div>
                  )}

                  {/* Slot vazio */}
                  {!movie && !isSearching && (
                    <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      Nenhum filme selecionado
                    </span>
                  )}

                  {/* Buscador de Filme ativo no Slot */}
                  {isSearching && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <form onSubmit={handleMovieSearch} style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          required
                          placeholder="Buscar filme..."
                          value={movieQuery}
                          onChange={(e) => setMovieQuery(e.target.value)}
                          className="input"
                          style={{
                            fontSize: "0.8125rem",
                            background: "var(--surface-3)",
                            padding: "6px 10px",
                            flexGrow: 1,
                          }}
                        />
                        <button
                          type="submit"
                          disabled={searchLoading}
                          className="btn btn-ghost"
                          style={{
                            padding: "6px 12px",
                            height: 32,
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          {searchLoading ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Search size={12} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSearchSlot(null)}
                          className="btn btn-ghost"
                          style={{
                            padding: "6px 12px",
                            height: 32,
                            borderRadius: "var(--radius-sm)",
                            color: "var(--red)",
                          }}
                        >
                          Cancelar
                        </button>
                      </form>

                      {/* Resultados da busca */}
                      {searchResults.length > 0 && (
                        <div
                          style={{
                            background: "var(--surface-3)",
                            border: "1px solid var(--border)",
                            borderRadius: 6,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {searchResults.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleSelectMovie(pos, m)}
                              style={{
                                background: "none",
                                border: "none",
                                borderBottom: "1px solid var(--border)",
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              <div style={{ position: "relative", width: 20, aspectRatio: "2/3", borderRadius: 2, overflow: "hidden" }}>
                                <Image
                                  src={getTMDBImageUrl(m.poster_path, "w92")}
                                  alt={m.title}
                                  fill
                                  sizes="20px"
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                              <span style={{ fontSize: "0.8125rem", color: "#fff", fontWeight: 600 }}>
                                {m.title}{" "}
                                {m.release_date && (
                                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
