"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleLikeEssay } from "@/actions/essays";
import { useAuthModal } from "@/contexts/AuthModalContext";

interface LikeEssayButtonProps {
  essayId: string;
  initialLikesCount: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
}

export default function LikeEssayButton({
  essayId,
  initialLikesCount,
  initialLiked,
  isLoggedIn,
}: LikeEssayButtonProps) {
  const { openLogin } = useAuthModal();
  const [likes, setLikes] = useState(initialLikesCount);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    if (loading) return;

    // Optimistic Update
    const previousLikes = likes;
    const previousLiked = liked;
    const nextLiked = !liked;
    const nextLikes = liked ? likes - 1 : likes + 1;

    setLiked(nextLiked);
    setLikes(nextLikes);
    setLoading(true);

    try {
      const res = await toggleLikeEssay(essayId);
      if (res.error) {
        // Rollback on error
        setLiked(previousLiked);
        setLikes(previousLikes);
        console.error("Erro ao curtir:", res.error);
      } else if (res.liked !== undefined) {
        // Sync with actual server values
        setLiked(res.liked);
      }
    } catch (err) {
      // Rollback on error
      setLiked(previousLiked);
      setLikes(previousLikes);
      console.error("Erro ao curtir resenha:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: liked ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.04)",
        border: `1px solid ${liked ? "rgba(239, 68, 68, 0.25)" : "rgba(255, 255, 255, 0.08)"}`,
        borderRadius: "100px",
        padding: "5px 12px",
        color: liked ? "#f87171" : "var(--text-secondary)",
        fontSize: "0.75rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        outline: "none",
      }}
      onMouseEnter={(e) => {
        if (!liked) {
          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
          e.currentTarget.style.color = "#f87171";
        }
      }}
      onMouseLeave={(e) => {
        if (!liked) {
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }
      }}
    >
      <Heart
        size={13}
        fill={liked ? "currentColor" : "none"}
        style={{
          transition: "transform 0.15s ease",
          transform: liked ? "scale(1.15)" : "scale(1)",
        }}
      />
      <span>
        {likes} {likes === 1 ? "curtida" : "curtidas"}
      </span>
    </button>
  );
}
