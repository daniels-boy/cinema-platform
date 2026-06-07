"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Trash2, ArrowLeft, ShieldAlert, Film } from "lucide-react";
import { deleteEssay } from "@/actions/essays";
import LikeEssayButton from "./LikeEssayButton";

interface UserItem {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
}

interface LikeItem {
  userId: string;
}

interface EssayItem {
  id: string;
  title: string;
  content: string;
  tmdbId: number;
  movieTitle: string;
  moviePoster: string | null;
  isSpoiler: boolean;
  createdAt: Date;
  userId: string;
  user: UserItem;
  likes: LikeItem[];
}

interface EssayReaderProps {
  essay: EssayItem;
  currentUserId?: string;
  isAdmin?: boolean;
  backdropUrl: string | null;
}

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
      return `<p style="line-height: 1.7; margin-bottom: 20px; color: var(--text-secondary); font-size: 1rem;">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");

  return html;
}

export default function EssayReader({ essay, currentUserId, isAdmin = false, backdropUrl }: EssayReaderProps) {
  const router = useRouter();
  const [showSpoilerBlocker, setShowSpoilerBlocker] = useState(essay.isSpoiler);
  const [deleting, setDeleting] = useState(false);

  const authorName = essay.user.name || essay.user.email.split("@")[0];
  const isAuthor = essay.userId === currentUserId;
  const canDelete = isAuthor || isAdmin;

  const handleDelete = async () => {
    if (!confirm("Deseja mesmo excluir esta resenha editorial?")) return;

    setDeleting(true);
    try {
      const res = await deleteEssay(essay.id);
      if (res.error) {
        alert(res.error);
        setDeleting(false);
      } else {
        router.push("/resenhas");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir artigo.");
      setDeleting(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 80 }}>
      {/* ─── FILM BACKDROP HERO BANNER ─────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "440px",
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : "linear-gradient(135deg, #1b162c 0%, #0a0a0f 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          zIndex: 1,
        }}
      >
        {/* Overlay escuro radial e gradiente */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(10,10,15,0.4) 0%, #0a0a0f 100%)",
          }}
        />
      </div>

      {/* Conteúdo Principal do Artigo */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: 260,
          maxWidth: 740,
        }}
      >
        {/* Voltar */}
        <Link
          href="/resenhas"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--accent)",
            fontSize: "0.875rem",
            fontWeight: 700,
            textDecoration: "none",
            marginBottom: 28,
            transition: "transform 0.2s",
          }}
          className="back-link"
        >
          <ArrowLeft size={16} />
          Voltar para Resenhas
        </Link>

        {/* Artigo Card principal */}
        <article
          style={{
            background: "rgba(10, 10, 15, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "40px 36px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
          }}
        >
          {/* Filme associado Tag */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#0a0a0f",
                background: "var(--accent)",
                padding: "3px 10px",
                borderRadius: 4,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Film size={12} />
              {essay.movieTitle}
            </span>

            {essay.isSpoiler && (
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "var(--red)",
                  background: "rgba(224,82,82,0.1)",
                  border: "1px solid rgba(224,82,82,0.2)",
                  padding: "2px 10px",
                  borderRadius: 4,
                }}
              >
                ⚠️ CONTÉM SPOILER
              </span>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  marginLeft: "auto",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <Trash2 size={14} />
                Excluir Artigo
              </button>
            )}
          </div>

          {/* Título Principal */}
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.25,
              marginBottom: 20,
            }}
            className="font-display"
          >
            {essay.title}
          </h1>

          {/* Autor Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--border)",
              paddingBottom: 24,
              marginBottom: 32,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <Link
              href={`/profile/${essay.user.id}`}
              style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
              className="author-avatar-link"
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <img
                  src={essay.user.image || "/placeholder-avatar.jpg"}
                  alt={authorName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                  {authorName}
                </p>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Autor Editorial</span>
              </div>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <Calendar size={13} />
                <span>Publicado em {new Date(essay.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
              </div>
              <LikeEssayButton
                essayId={essay.id}
                initialLikesCount={essay.likes ? essay.likes.length : 0}
                initialLiked={essay.likes ? essay.likes.some((like) => like.userId === currentUserId) : false}
                isLoggedIn={!!currentUserId}
              />
            </div>
          </div>

          {/* BLOCKER DE SPOILER */}
          {showSpoilerBlocker ? (
            <div
              style={{
                background: "rgba(224, 82, 82, 0.04)",
                border: "1px dashed rgba(224, 82, 82, 0.3)",
                borderRadius: "var(--radius-lg)",
                padding: "48px 24px",
                textAlign: "center",
                margin: "40px 0",
              }}
            >
              <ShieldAlert size={48} color="var(--red)" style={{ marginBottom: 16, marginInline: "auto" }} />
              <h3 style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 800, marginBottom: 8 }}>
                Alerta de Spoilers!
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: 460, margin: "0 auto 24px", lineHeight: 1.5 }}>
                Esta resenha foi marcada pelo autor como contendo revelações importantes da trama e do final de &ldquo;{essay.movieTitle}&rdquo;.
              </p>
              <button
                onClick={() => setShowSpoilerBlocker(false)}
                className="btn"
                style={{
                  background: "var(--red)",
                  color: "#fff",
                  padding: "10px 24px",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                }}
              >
                Revelar Artigo Completo
              </button>
            </div>
          ) : (
            // CORPO DO ARTIGO RENDERIZADO
            <div
              className="essay-body-content"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(essay.content) }}
              style={{
                fontFamily: "Georgia, serif", // Fonte clássica de artigos e newsletters
              }}
            />
          )}
        </article>
      </div>

      <style precedence="default" href="essayreader-styles-1">{`
        .back-link:hover {
          transform: translateX(-4px);
        }
        .author-avatar-name:hover {
          color: var(--accent) !important;
        }
        .essay-body-content h1 {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 36px 0 16px;
          color: #fff;
          font-family: var(--font-display), sans-serif;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
        }
        .essay-body-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 28px 0 12px;
          color: #fff;
          font-family: var(--font-display), sans-serif;
        }
        .essay-body-content h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 24px 0 8px;
          color: #fff;
          font-family: var(--font-display), sans-serif;
        }
        .essay-body-content blockquote {
          border-left: 4px solid var(--accent);
          background: rgba(232, 180, 75, 0.04);
          padding: 16px 20px;
          margin: 28px 0;
          font-style: italic;
          color: var(--text-secondary);
          border-radius: 0 4px 4px 0;
          font-size: 1.0625rem;
          line-height: 1.6;
        }
        .essay-body-content .preview-img-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 32px 0;
          gap: 8px;
          width: 100%;
        }
        .essay-body-content img {
          max-width: 100%;
          max-height: 480px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          box-shadow: 0 12px 36px rgba(0,0,0,0.5);
          object-fit: contain;
        }
        .essay-body-content .preview-img-caption {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
          font-family: var(--font-sans), sans-serif;
        }
      `}</style>
    </div>
  );
}
