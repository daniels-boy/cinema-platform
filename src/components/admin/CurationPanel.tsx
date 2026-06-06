"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Star, Trash2, Eye, EyeOff, Plus, Search, X } from "lucide-react";
import {
  setFeaturedBanner,
  removeFeaturedBanner,
  createCuratedCollection,
  toggleCollection,
  deleteCollection,
  searchMoviesAction,
} from "@/actions/admin";
import { getTMDBImageUrl } from "@/lib/tmdb";
import type { TMDBMovie } from "@/types/tmdb";

interface Banner {
  id: string;
  tmdbId: number;
  title: string;
  subtitle: string;
}

interface Collection {
  id: string;
  title: string;
  description: string;
  emoji: string;
  tmdbIds: number[];
  active: boolean;
  createdAt: string;
}

export default function CurationPanel({
  currentBanner: initBanner,
  collections: initCollections,
}: {
  currentBanner: Banner | null;
  collections: Collection[];
}) {
  const [banner, setBanner] = useState<Banner | null>(initBanner);
  const [collections, setCollections] = useState(initCollections);

  // Spotlight search states
  const [bannerSearchQuery, setBannerSearchQuery] = useState("");
  const [bannerSearchResults, setBannerSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearchingBanner, setIsSearchingBanner] = useState(false);

  // Curated collections states
  const [showCollForm, setShowCollForm] = useState(false);
  const [collForm, setCollForm] = useState({ title: "", description: "", emoji: "🎬" });
  const [selectedMovies, setSelectedMovies] = useState<TMDBMovie[]>([]);
  const [collSearchQuery, setCollSearchQuery] = useState("");
  const [collSearchResults, setCollSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearchingColl, setIsSearchingColl] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 3000);
  };
  const showErr = (text: string) => {
    setError(text);
    setTimeout(() => setError(null), 4000);
  };

  // Search movies for Featured Banner
  const handleSearchBanner = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bannerSearchQuery.trim()) return;
    setIsSearchingBanner(true);
    const res = await searchMoviesAction(bannerSearchQuery.trim());
    setIsSearchingBanner(false);
    if (res.error) {
      showErr(res.error);
    } else {
      setBannerSearchResults(res.results || []);
    }
  };

  // Set Movie as Featured Banner
  const handleSelectBanner = (movie: TMDBMovie) => {
    setLoadingId(`banner-${movie.id}`);
    startTransition(async () => {
      const res = await setFeaturedBanner(movie.id);
      if (res.error) {
        showErr(res.error);
      } else {
        setBanner({
          id: "new",
          tmdbId: movie.id,
          title: movie.title,
          subtitle: movie.overview?.slice(0, 160) ?? "",
        });
        setBannerSearchQuery("");
        setBannerSearchResults([]);
        showMsg(`✅ "${movie.title}" definido como Destaque da Semana!`);
      }
      setLoadingId(null);
    });
  };

  const handleRemoveBanner = () => {
    setLoadingId("banner-remove");
    startTransition(async () => {
      await removeFeaturedBanner();
      setBanner(null);
      showMsg("Banner removido.");
      setLoadingId(null);
    });
  };

  // Search movies for Collection
  const handleSearchColl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!collSearchQuery.trim()) return;
    setIsSearchingColl(true);
    const res = await searchMoviesAction(collSearchQuery.trim());
    setIsSearchingColl(false);
    if (res.error) {
      showErr(res.error);
    } else {
      setCollSearchResults(res.results || []);
    }
  };

  // Add movie to draft collection
  const handleAddMovieToCollection = (movie: TMDBMovie) => {
    if (selectedMovies.some((m) => m.id === movie.id)) {
      return showErr("Este filme já está adicionado.");
    }
    setSelectedMovies((prev) => [...prev, movie]);
    setCollSearchResults((prev) => prev.filter((m) => m.id !== movie.id));
  };

  // Remove movie from draft collection
  const handleRemoveMovieFromCollection = (movieId: number) => {
    setSelectedMovies((prev) => prev.filter((m) => m.id !== movieId));
  };

  const handleCreateCollection = () => {
    if (!collForm.title.trim()) return showErr("O título é obrigatório.");
    if (selectedMovies.length === 0) return showErr("Adicione pelo menos 1 filme à coleção.");

    const ids = selectedMovies.map((m) => m.id);
    setLoadingId("new-coll");
    startTransition(async () => {
      const res = await createCuratedCollection({
        title: collForm.title,
        description: collForm.description,
        emoji: collForm.emoji,
        tmdbIds: ids,
      });
      if (res.error) {
        showErr(res.error);
      } else {
        setCollections((prev) => [
          {
            id: Date.now().toString(),
            title: collForm.title,
            description: collForm.description,
            emoji: collForm.emoji,
            tmdbIds: ids,
            active: true,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setCollForm({ title: "", description: "", emoji: "🎬" });
        setSelectedMovies([]);
        setCollSearchQuery("");
        setCollSearchResults([]);
        setShowCollForm(false);
        showMsg("✅ Coleção criada!");
      }
      setLoadingId(null);
    });
  };

  const handleToggle = (id: string, active: boolean) => {
    setLoadingId(id);
    startTransition(async () => {
      const res = await toggleCollection(id, active);
      if (res.success) setCollections((prev) => prev.map((c) => c.id === id ? { ...c, active: !active } : c));
      setLoadingId(null);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Deletar esta coleção?")) return;
    setLoadingId(id + "-del");
    startTransition(async () => {
      const res = await deleteCollection(id);
      if (res.success) setCollections((prev) => prev.filter((c) => c.id !== id));
      setLoadingId(null);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Feedback Alerts */}
      {msg && (
        <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", padding: "12px 16px", borderRadius: 10, fontSize: "0.875rem" }}>
          {msg}
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.3)", color: "#e05252", padding: "12px 16px", borderRadius: 10, fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {/* ── BANNER HIGHLIGHT ─────────────────────────────────────────── */}
      <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 28 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", marginBottom: 4 }}>⭐ Destaque da Semana</h2>
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
          O filme escolhido aparece em um banner gigante de destaque no topo da homepage.
        </p>

        {banner && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(232,180,75,0.06)", border: "1px solid rgba(232,180,75,0.2)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#e8b44b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Destaque Atual</p>
              <p style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{banner.title}</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>TMDB #{banner.tmdbId}</p>
            </div>
            <button
              onClick={handleRemoveBanner}
              disabled={loadingId === "banner-remove"}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.25)", color: "#e05252", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
            >
              <Trash2 size={13} /> Remover Destaque
            </button>
          </div>
        )}

        {/* Search for Spotlight Movie */}
        <form onSubmit={handleSearchBanner} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
            <Search size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14 }} />
            <input
              type="text"
              placeholder="Digite o nome do filme para destacar..."
              value={bannerSearchQuery}
              onChange={(e) => setBannerSearchQuery(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: "10px 14px 10px 40px", color: "#fff", fontSize: "0.875rem", outline: "none" }}
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingBanner || !bannerSearchQuery.trim()}
            style={{ padding: "10px 20px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            {isSearchingBanner ? <Loader2 size={14} className="animate-spin" /> : "Buscar"}
          </button>
        </form>

        {/* Spotlight search results list */}
        {bannerSearchResults.length > 0 && (
          <div style={{ maxHeight: 280, overflowY: "auto", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 4 }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Resultados Encontrados ({bannerSearchResults.length})</span>
              <button onClick={() => setBannerSearchResults([])} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0 }}><X size={14} /></button>
            </div>
            {bannerSearchResults.slice(0, 5).map((movie) => {
              const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";
              return (
                <div key={movie.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ position: "relative", width: 36, height: 50, borderRadius: 4, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.05)" }}>
                    {movie.poster_path && (
                      <Image src={getTMDBImageUrl(movie.poster_path, "w92")} alt={movie.title} fill style={{ objectFit: "cover" }} sizes="36px" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{movie.title}</p>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{year ? `${year} · ` : ""}Nota: {movie.vote_average?.toFixed(1) ?? "—"}</p>
                  </div>
                  <button
                    onClick={() => handleSelectBanner(movie)}
                    disabled={loadingId === `banner-${movie.id}`}
                    style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(232,180,75,0.15)", border: "1px solid rgba(232,180,75,0.3)", color: "#e8b44b", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {loadingId === `banner-${movie.id}` ? <Loader2 size={12} className="animate-spin" /> : <Star size={11} />} Selecionar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── CURATED COLLECTIONS ───────────────────────────────────────── */}
      <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>🎭 Coleções Manuais</h2>
          <button
            onClick={() => {
              setShowCollForm((v) => !v);
              setSelectedMovies([]);
              setCollSearchQuery("");
              setCollSearchResults([]);
            }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
          >
            <Plus size={13} /> Nova Coleção
          </button>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
          Crie e gerencie seções temáticas que aparecem na homepage (ex: "Especial Dia das Bruxas" ou "Indicados ao Oscar").
        </p>

        {/* Collection creation form */}
        {showCollForm && (
          <div style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 12, padding: 20, marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={collForm.emoji}
                onChange={(e) => setCollForm((f) => ({ ...f, emoji: e.target.value }))}
                placeholder="🎬"
                style={{ width: 56, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px", color: "#fff", fontSize: "1.2rem", outline: "none" }}
              />
              <input
                value={collForm.title}
                onChange={(e) => setCollForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Título (ex: Especial Dia das Bruxas)"
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: "0.875rem", outline: "none" }}
              />
            </div>
            <input
              value={collForm.description}
              onChange={(e) => setCollForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descrição curta (ex: Melhores clássicos de terror selecionados pela moderação)"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: "0.875rem", outline: "none" }}
            />

            {/* Selected movies list in current draft collection */}
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Filmes na Coleção ({selectedMovies.length})</p>
              {selectedMovies.length === 0 ? (
                <div style={{ padding: "12px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 8, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>
                  Nenhum filme selecionado. Use a busca abaixo para adicionar.
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selectedMovies.map((movie) => (
                    <div key={movie.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 8, padding: "4px 10px", fontSize: "0.8rem", color: "#fff" }}>
                      <span>{movie.title}</span>
                      <button
                        onClick={() => handleRemoveMovieFromCollection(movie.id)}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search input for adding movies to Collection */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Buscar Filme para Adicionar</p>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                  <Search size={15} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 12 }} />
                  <input
                    type="text"
                    placeholder="Digite o nome do filme..."
                    value={collSearchQuery}
                    onChange={(e) => setCollSearchQuery(e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px 8px 36px", color: "#fff", fontSize: "0.8125rem", outline: "none" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchColl()}
                  disabled={isSearchingColl || !collSearchQuery.trim()}
                  style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
                >
                  {isSearchingColl ? <Loader2 size={13} className="animate-spin" /> : "Buscar"}
                </button>
              </div>

              {/* Collection search results list */}
              {collSearchResults.length > 0 && (
                <div style={{ maxHeight: 200, overflowY: "auto", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {collSearchResults.slice(0, 5).map((movie) => {
                    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";
                    return (
                      <div key={movie.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "6px 10px", borderRadius: 6, background: "rgba(255,255,255,0.01)" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#fff" }}>{movie.title}</span>
                          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>{year ? `(${year})` : ""}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddMovieToCollection(movie)}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          <Plus size={11} /> Adicionar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => {
                  setShowCollForm(false);
                  setSelectedMovies([]);
                }}
                style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontWeight: 600, cursor: "pointer", fontSize: "0.8125rem" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateCollection}
                disabled={loadingId === "new-coll" || selectedMovies.length === 0}
                style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)", color: "#a78bfa", fontWeight: 700, cursor: "pointer", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 6 }}
              >
                {loadingId === "new-coll" ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Criar Coleção
              </button>
            </div>
          </div>
        )}

        {/* Existing collections listing */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {collections.length === 0 && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.875rem" }}>Nenhuma coleção criada ainda.</p>}
          {collections.map((col) => (
            <div key={col.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${col.active ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "14px 16px", opacity: col.active ? 1 : 0.6, transition: "opacity 0.2s" }}>
              <span style={{ fontSize: "1.5rem" }}>{col.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.875rem" }}>{col.title}</p>
                {col.description && <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{col.description}</p>}
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{col.tmdbIds.length} filme{col.tmdbIds.length !== 1 ? "s" : ""} · {col.active ? "✅ Ativa" : "Inativa"}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handleToggle(col.id, col.active)} disabled={!!loadingId} title={col.active ? "Desativar" : "Ativar"} style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {loadingId === col.id ? <Loader2 size={12} className="animate-spin" /> : col.active ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button onClick={() => handleDelete(col.id)} disabled={!!loadingId} title="Deletar" style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)", color: "rgba(224,82,82,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {loadingId === col.id + "-del" ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
