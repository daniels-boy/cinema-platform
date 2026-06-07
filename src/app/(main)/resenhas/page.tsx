import { getEssays } from "@/actions/essays";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, FileText, User, Calendar, Plus, Sparkles, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import LikeEssayButton from "@/components/reviews/LikeEssayButton";
import UserAvatar from "@/components/ui/UserAvatar";
import VipBadge from "@/components/ui/VipBadge";

export const metadata: Metadata = {
  title: "Resenhas Longas | CineVerse",
  description: "Explore artigos editoriais, ensaios e newsletters escritos pela comunidade sobre seus filmes favoritos.",
};

// Helper simples para remover tags markdown e gerar um resumo
function generatePreview(markdown: string, maxLength = 160): string {
  if (!markdown) return "";
  // Remover cabeçalhos, links, imagens e blocos de formatação
  let cleanText = markdown
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove imagens
    .replace(/\[.*?\]\(.*?\)/g, "") // remove links
    .replace(/#+\s+/g, "") // remove hashes de heading
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // remove negrito
    .replace(/(\*|_)(.*?)\1/g, "$2") // remove itálico
    .replace(/>\s+/g, "") // remove blockquote
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, "") // remove inline code e codeblocks
    .replace(/\s+/g, " ") // colapsa múltiplos espaços
    .trim();

  if (cleanText.length > maxLength) {
    return cleanText.slice(0, maxLength) + "...";
  }
  return cleanText;
}

export default async function ResenhasPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const res = await getEssays();
  const essays = res.essays || [];

  return (
    <div style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 880 }}>
        {/* Header da Página */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 44,
            borderBottom: "1px solid var(--border)",
            paddingBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: 900,
                color: "#fff",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
              className="font-display"
            >
              <FileText size={32} color="var(--accent)" />
              Resenhas Editoriais
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", margin: 0, maxWidth: 520, lineHeight: 1.5 }}>
              Artigos completos, ensaios profundos e críticas em formato de newsletter criados pela comunidade CineVerse.
            </p>
          </div>

          <Link
            href={currentUserId ? "/resenhas/new" : "/login"}
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: "var(--radius)",
              fontWeight: 700,
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <Plus size={16} />
            Escrever Resenha
          </Link>
        </div>

        {/* Listagem de Resenhas */}
        {essays.length === 0 ? (
          <div
            style={{
              background: "var(--surface)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "80px 24px",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>
              Nenhuma resenha escrita ainda...
            </h3>
            <p style={{ maxWidth: 440, margin: "0 auto 24px", fontSize: "0.875rem", lineHeight: 1.6 }}>
              Inaugure a seção editorial do CineVerse! Escreva um artigo completo sobre seu filme preferido contendo imagens, GIFs e insights editoriais.
            </p>
            <Link
              href={currentUserId ? "/resenhas/new" : "/login"}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px" }}
            >
              <Plus size={15} />
              Criar o Primeiro Artigo
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="essays-list">
            {essays.map((essay: any) => {
              const authorName = essay.user.name || essay.user.email.split("@")[0];
              const posterPath = essay.moviePoster;
              const posterUrl = posterPath
                ? (posterPath.startsWith("http") ? posterPath : `https://image.tmdb.org/t/p/w185${posterPath}`)
                : null;
              
              const summary = generatePreview(essay.content);

              return (
                <div
                  key={essay.id}
                  style={{
                    display: "flex",
                    gap: 24,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 24,
                    transition: "all 0.25s ease",
                  }}
                  className="essay-card"
                >
                  {/* Poster Thumbnail */}
                  <Link
                    href={`/resenhas/${essay.id}`}
                    style={{
                      position: "relative",
                      width: 90,
                      aspectRatio: "2/3",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      background: "var(--surface-2)",
                      flexShrink: 0,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
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
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          padding: 6,
                          textAlign: "center",
                          fontWeight: 700,
                        }}
                      >
                        {essay.movieTitle}
                      </div>
                    )}
                  </Link>

                  {/* Essay Metadata & Preview */}
                  <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                    {/* Header info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          color: "var(--accent)",
                          background: "var(--accent-dim)",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {essay.movieTitle}
                      </span>
                      {essay.isSpoiler && (
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 800,
                            color: "var(--red)",
                            background: "rgba(224, 82, 82, 0.1)",
                            border: "1px solid rgba(224, 82, 82, 0.2)",
                            padding: "1px 8px",
                            borderRadius: 4,
                          }}
                        >
                          ⚠️ SPOILER
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#fff", margin: "0 0 8px 0", lineHeight: 1.3 }}>
                      <Link href={`/resenhas/${essay.id}`} className="essay-title-link">
                        {essay.title}
                      </Link>
                    </h2>

                    {/* Content Preview */}
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                      {summary}
                    </p>

                    {/* Author & Date Footer */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "auto",
                        borderTop: "1px solid rgba(255,255,255,0.03)",
                        paddingTop: 12,
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Link
                          href={`/profile/${essay.user.id}`}
                          style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                          className="essay-author-link"
                        >
                          <UserAvatar
                            src={essay.user.image}
                            alt={authorName}
                            size={20}
                            vipStatus={essay.user.vipStatus}
                          />
                          <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                            {authorName}
                            <VipBadge status={essay.user.vipStatus} />
                          </span>
                        </Link>
                        
                        <div style={{ display: "inline-flex" }}>
                          <LikeEssayButton
                            essayId={essay.id}
                            initialLikesCount={essay.likes.length}
                            initialLiked={essay.likes.some((like: any) => like.userId === currentUserId)}
                            isLoggedIn={!!currentUserId}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={12} />
                        <span>{new Date(essay.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style precedence="default" href="page-styles-1">{`
        .essay-card:hover {
          border-color: var(--border-hover) !important;
          background: var(--surface-2) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .essay-title-link {
          color: #fff;
          text-decoration: none;
          transition: color 0.2s;
        }
        .essay-title-link:hover {
          color: var(--accent) !important;
        }
        .essay-author-link {
          color: var(--text-secondary);
          transition: color 0.2s;
        }
        .essay-author-link:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
