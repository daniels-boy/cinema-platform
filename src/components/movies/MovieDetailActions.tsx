"use client";

import { useState } from "react";
import { Eye, Bookmark, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { toggleWatched, toggleWatchlist } from "@/actions/movies";

interface MovieDetailActionsProps {
  movieId: number;
  initialWatched: boolean;
  initialSaved: boolean;
}

export default function MovieDetailActions({
  movieId,
  initialWatched,
  initialSaved,
}: MovieDetailActionsProps) {
  const { data: session } = useSession();
  const { openLogin } = useAuthModal();

  const [watched, setWatched] = useState(initialWatched);
  const [saved, setSaved] = useState(initialSaved);
  const [loadingWatch, setLoadingWatch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const handleWatched = async () => {
    if (!session) {
      openLogin();
      return;
    }

    setLoadingWatch(true);
    try {
      const res = await toggleWatched(movieId);
      if (res.error) {
        console.error(res.error);
      } else if (res.watched !== undefined) {
        setWatched(res.watched);
      }
    } catch (err) {
      console.error("Erro ao marcar como assistido:", err);
    } finally {
      setLoadingWatch(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      openLogin();
      return;
    }

    setLoadingSave(true);
    try {
      const res = await toggleWatchlist(movieId);
      if (res.error) {
        console.error(res.error);
      } else if (res.saved !== undefined) {
        setSaved(res.saved);
      }
    } catch (err) {
      console.error("Erro ao salvar watchlist:", err);
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, margin: "20px 0 28px" }}>
      {/* Botão Assistido (Olhinho) */}
      <button
        onClick={handleWatched}
        disabled={loadingWatch}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 8,
          background: watched ? "var(--green)" : "rgba(255,255,255,0.06)",
          border: watched ? "none" : "1px solid rgba(255,255,255,0.12)",
          color: watched ? "#0a0a0f" : "#fff",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: loadingWatch ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          opacity: loadingWatch ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!watched && !loadingWatch) e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        }}
        onMouseLeave={(e) => {
          if (!watched && !loadingWatch) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
      >
        {loadingWatch ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Eye size={16} fill={watched ? "currentColor" : "none"} />
        )}
        {watched ? "Assistido" : "Marcar como Assistido"}
      </button>

      {/* Botão Watchlist (Lista de interesses) */}
      <button
        onClick={handleSave}
        disabled={loadingSave}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 8,
          background: saved ? "var(--accent)" : "rgba(255,255,255,0.06)",
          border: saved ? "none" : "1px solid rgba(255,255,255,0.12)",
          color: saved ? "#0a0a0f" : "#fff",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: loadingSave ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          opacity: loadingSave ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!saved && !loadingSave) e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        }}
        onMouseLeave={(e) => {
          if (!saved && !loadingSave) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
      >
        {loadingSave ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        )}
        {saved ? "Na sua Watchlist" : "Adicionar à Watchlist"}
      </button>
    </div>
  );
}
