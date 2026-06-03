"use client";

import { useState } from "react";
import { Star, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { submitReview } from "@/actions/reviews";
import { HOT_TAKES } from "@/types/reviews";

interface ReviewFormProps {
  tmdbId: number;
  initialReview?: {
    rating: number;
    content: string;
    tags?: string[];
  } | null;
}

export default function ReviewForm({ tmdbId, initialReview }: ReviewFormProps) {
  const { data: session } = useSession();
  const { openLogin } = useAuthModal();

  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(initialReview?.content ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialReview?.tags ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      openLogin();
      return;
    }

    if (rating === 0) {
      setError("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    if (content.trim().length < 3) {
      setError("Sua avaliação deve conter pelo menos 3 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await submitReview({ 
        tmdbId, 
        rating, 
        content: content.trim(), 
        tags: selectedTags 
      });
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        // Se for uma nova avaliação, podemos limpar o campo (ou manter para edições)
        if (!initialReview) {
          setContent("");
          setRating(0);
          setSelectedTags([]);
        }
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError("Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, rgba(26,20,38,0.4) 0%, rgba(15,21,32,0.4) 100%)",
          border: "1px dashed rgba(232,180,75,0.25)",
          borderRadius: "var(--radius-lg)",
          padding: "32px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          marginTop: 24,
          backdropFilter: "blur(8px)",
        }}
      >
        <Sparkles size={24} color="var(--accent)" />
        <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
          Quer deixar sua avaliação?
        </h4>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: 360, margin: "0 auto 8px" }}>
          Faça login para dar nota e compartilhar sua opinião sobre este filme com a comunidade.
        </p>
        <button
          onClick={openLogin}
          className="btn btn-primary"
          style={{ padding: "10px 24px" }}
        >
          Entrar para avaliar
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 28px",
        marginTop: 24,
      }}
    >
      <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: 16 }}>
        {initialReview ? "Editar sua avaliação" : "Escrever uma avaliação"}
      </h3>

      {error && (
        <div
          style={{
            background: "rgba(224, 82, 82, 0.1)",
            border: "1px solid rgba(224, 82, 82, 0.25)",
            color: "var(--red)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: "0.8125rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
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
            padding: "10px 12px",
            fontSize: "0.8125rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span>Sua avaliação foi salva com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Star Rating Select */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Sua nota:
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: (hoverRating || rating) >= star ? "var(--accent)" : "var(--text-muted)",
                  transition: "transform 0.15s, color 0.15s",
                  transform: (hoverRating || rating) >= star ? "scale(1.15)" : "scale(1)",
                }}
              >
                <Star
                  size={24}
                  fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Hot Take Tags Select */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600 }}>
            Tags de Reação Rápida ("Hot Takes"):
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {HOT_TAKES.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: isSelected ? tag.bgColor : "rgba(255,255,255,0.03)",
                    border: "1px solid " + (isSelected ? tag.color : "rgba(255,255,255,0.1)"),
                    color: isSelected ? "#fff" : "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = tag.color;
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <span>{tag.emoji}</span>
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment textarea */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            Sua opinião
          </label>
          <textarea
            required
            rows={4}
            placeholder="O que você achou deste filme? História, atuação, efeitos, trilha sonora..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input"
            style={{
              resize: "vertical",
              minHeight: 80,
              fontSize: "0.875rem",
              background: "var(--surface-2)",
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{
            alignSelf: "flex-end",
            padding: "10px 24px",
            minWidth: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 38,
          }}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : initialReview ? (
            "Salvar Alterações"
          ) : (
            "Enviar Avaliação"
          )}
        </button>
      </form>
    </div>
  );
}
