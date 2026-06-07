"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Loader2, Users } from "lucide-react";
import { getUserFollowers, getUserFollowing } from "@/actions/social";

interface UserItem {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
}

interface FollowersModalProps {
  userId: string;
  type: "followers" | "following";
  isOpen: boolean;
  onClose: () => void;
}

export default function FollowersModal({ userId, type, isOpen, onClose }: FollowersModalProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = type === "followers"
          ? await getUserFollowers(userId)
          : await getUserFollowing(userId);

        if (res.error) {
          setError(res.error);
        } else if (res.users) {
          setUsers(res.users);
        }
      } catch (err) {
        console.error("Erro ao buscar lista de usuários:", err);
        setError("Erro ao carregar lista. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          overflow: "hidden",
          animation: "modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            background: "rgba(255,255,255,0.01)",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 800,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: 0,
            }}
          >
            <Users size={16} color="var(--accent)" />
            {type === "followers" ? "Seguidores" : "Seguindo"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "12px 0",
            maxHeight: 340,
            overflowY: "auto",
          }}
          className="modal-users-list"
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                gap: 12,
              }}
            >
              <Loader2 size={24} className="animate-spin" color="var(--accent)" />
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Carregando...</span>
            </div>
          ) : error ? (
            <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--red)", fontSize: "0.875rem" }}>
              {error}
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Nenhum usuário encontrado.
            </div>
          ) : (
            users.map((u) => {
              const displayName = u.name || u.email.split("@")[0];
              return (
                <Link
                  key={u.id}
                  href={`/profile/${u.id}`}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 20px",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  className="modal-user-item"
                >
                  <div
                    style={{
                      position: "relative",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={u.image || "/placeholder-avatar.jpg"}
                      alt={displayName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-avatar.jpg";
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#fff",
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {displayName}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <style precedence="default" href="followersmodal-styles-1">{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .modal-users-list::-webkit-scrollbar {
          width: 6px;
        }
        .modal-users-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-users-list::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
        }
        .modal-user-item:hover {
          background: rgba(255,255,255,0.03);
        }
        .modal-user-item:hover p {
          color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
