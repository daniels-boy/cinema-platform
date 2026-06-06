"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Trash2, Send, Loader2 } from "lucide-react";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { addReviewComment, deleteReviewComment, getReviewComments } from "@/actions/social";

interface UserItem {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
}

interface CommentItem {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: UserItem;
}

interface ReviewCommentsSectionProps {
  reviewId: string;
  initialCommentsCount: number;
  isLoggedIn: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
  children?: React.ReactNode; // O botão de Like passado como filho
}

export default function ReviewCommentsSection({
  reviewId,
  initialCommentsCount,
  isLoggedIn,
  currentUserId,
  isAdmin = false,
  children,
}: ReviewCommentsSectionProps) {
  const { openLogin } = useAuthModal();
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar comentários quando expandido pela primeira vez
  useEffect(() => {
    if (!isExpanded || hasLoaded) return;

    const fetchComments = async () => {
      setLoadingComments(true);
      setError(null);
      try {
        const res = await getReviewComments(reviewId);
        if (res.error) {
          setError(res.error);
        } else if (res.comments) {
          setComments(res.comments as CommentItem[]);
          setCommentsCount(res.comments.length);
          setHasLoaded(true);
        }
      } catch (err) {
        console.error("Erro ao buscar comentários:", err);
        setError("Erro ao carregar comentários.");
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [isExpanded, reviewId, hasLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    const content = newComment.trim();
    if (!content) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await addReviewComment(reviewId, content);
      if (res.error) {
        setError(res.error);
      } else if (res.comment) {
        setComments((prev) => [...prev, res.comment as CommentItem]);
        setCommentsCount((prev) => prev + 1);
        setNewComment("");
      }
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
      setError("Erro ao enviar comentário. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Deseja mesmo excluir este comentário?")) return;

    try {
      const res = await deleteReviewComment(commentId);
      if (res.error) {
        alert(res.error);
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentsCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Erro ao deletar comentário:", err);
      alert("Erro ao excluir comentário.");
    }
  };

  return (
    <div style={{ width: "100%", marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: 12 }}>
      {/* Botões de Ação (Like + Comentar) */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {children}
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: "none",
            border: "none",
            color: isExpanded ? "var(--accent)" : "var(--text-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 4,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isExpanded) {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isExpanded) {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "none";
            }
          }}
        >
          <MessageSquare size={14} />
          <span>
            {commentsCount} {commentsCount === 1 ? "comentário" : "comentários"}
          </span>
        </button>
      </div>

      {/* Seção colapsável de comentários */}
      {isExpanded && (
        <div
          style={{
            marginTop: 12,
            background: "rgba(255, 255, 255, 0.01)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "16px 20px",
            animation: "slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Lista de Comentários */}
          {loadingComments ? (
            <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 8, padding: "12px 0", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
              <Loader2 size={14} className="animate-spin" color="var(--accent)" />
              Carregando comentários...
            </div>
          ) : error && comments.length === 0 ? (
            <div style={{ color: "var(--red)", fontSize: "0.8125rem", padding: "8px 0" }}>{error}</div>
          ) : comments.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.8125rem", padding: "12px 0", fontStyle: "italic" }}>
              Nenhum comentário ainda. Seja o primeiro a responder!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {comments.map((comment) => {
                const displayName = comment.user.name || comment.user.email.split("@")[0];
                const isCommentAuthor = comment.userId === currentUserId;
                const canDelete = isCommentAuthor || isAdmin;

                return (
                  <div
                    key={comment.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {/* Avatar do Autor */}
                    <Link
                      href={`/profile/${comment.user.id}`}
                      style={{
                        position: "relative",
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1px solid var(--border)",
                        background: "var(--surface-2)",
                        flexShrink: 0,
                        display: "block",
                      }}
                    >
                      <img
                        src={comment.user.image || "/placeholder-avatar.jpg"}
                        alt={displayName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-avatar.jpg";
                        }}
                      />
                    </Link>

                    {/* Conteúdo do Comentário */}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                        <Link
                          href={`/profile/${comment.user.id}`}
                          style={{
                            fontWeight: 700,
                            color: "#fff",
                            textDecoration: "none",
                          }}
                          className="comment-author-name"
                        >
                          {displayName}
                        </Link>
                        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                          {new Date(comment.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.4, whiteSpace: "pre-line" }}>
                        {comment.content}
                      </p>
                    </div>

                    {/* Botão Deletar */}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: 4,
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--red)";
                          e.currentTarget.style.background = "rgba(224, 82, 82, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-muted)";
                          e.currentTarget.style.background = "none";
                        }}
                        title="Excluir Comentário"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Form para adicionar comentário */}
          {isLoggedIn ? (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-end",
                borderTop: "1px solid var(--border)",
                paddingTop: 16,
              }}
            >
              <textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, 500))}
                required
                style={{
                  flexGrow: 1,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "#fff",
                  fontSize: "0.8125rem",
                  padding: "8px 12px",
                  outline: "none",
                  resize: "none",
                  height: 36,
                  fontFamily: "inherit",
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "36px";
                  el.style.height = Math.min(el.scrollHeight, 120) + "px";
                }}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                style={{
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  color: "#0a0a0f",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                  opacity: newComment.trim() ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (newComment.trim()) e.currentTarget.style.filter = "brightness(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "none";
                }}
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </form>
          ) : (
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 16,
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                textAlign: "center",
              }}
            >
              Você precisa estar conectado para comentar.{" "}
              <button
                onClick={openLogin}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent)",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "inherit",
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
              >
                Entrar
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .comment-author-name:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
