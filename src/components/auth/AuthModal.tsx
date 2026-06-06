"use client";

import { useState, useEffect } from "react";
import { X, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/contexts/AuthModalContext";

export default function AuthModal() {
  const { mode: initialMode, closeModal } = useAuthModal();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "login") {
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("E-mail ou senha incorretos.");
          setLoading(false);
        } else {
          closeModal();
          router.refresh();
        }
      } catch (err) {
        setError("Ocorreu um erro ao entrar. Tente novamente.");
        setLoading(false);
      }
    } else {
      if (!name.trim()) {
        setError("O nome é obrigatório.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Erro ao criar conta.");
          setLoading(false);
          return;
        }

        // Auto sign in
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.error) {
          setError("Conta criada, mas erro ao entrar automaticamente.");
          setLoading(false);
        } else {
          closeModal();
          router.refresh();
        }
      } catch (err) {
        setError("Ocorreu um erro ao cadastrar. Tente novamente.");
        setLoading(false);
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Overlay escuro com blur */}
      <div
        onClick={closeModal}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(6, 6, 10, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          animation: "authFadeIn 0.3s ease forwards",
        }}
      />

      {/* Card da Modal */}
      <div
        className="hide-modal-scrollbar"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 420,
          maxHeight: "min(600px, 90vh)",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          background: "linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          animation: "authSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Botão de Fechar */}
        <button
          onClick={closeModal}
          aria-label="Fechar"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
          }}
        >
          <X size={16} />
        </button>

        {/* Logo / Ícone */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          <Image
            src="/cineverse-logo.png"
            alt="CineVerse Logo"
            width={34}
            height={34}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Cabeçalho */}
        <h2
          className="font-display"
          style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}
        >
          {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 24 }}>
          {mode === "login"
            ? "Entre para salvar filmes na sua watchlist, favoritar seus títulos e escrever reviews."
            : "Faça parte da nossa comunidade de amantes de cinema hoje mesmo."}
        </p>

        {/* Feedback de erro */}
        {error && (
          <div
            style={{
              background: "rgba(224, 82, 82, 0.1)",
              border: "1px solid rgba(224, 82, 82, 0.25)",
              color: "var(--red)",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                Nome completo
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              E-mail
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Senha
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="password"
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: "12px",
              fontSize: "0.9375rem",
              marginTop: 8,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : mode === "login" ? (
              "Entrar"
            ) : (
              "Criar Conta"
            )}
          </button>
        </form>

        {/* Footer da Modal (Trocar Modo) */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
          }}
        >
          {mode === "login" ? (
            <>
              Não tem uma conta?{" "}
              <button
                onClick={() => {
                  setError(null);
                  setMode("register");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent)",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já possui uma conta?{" "}
              <button
                onClick={() => {
                  setError(null);
                  setMode("login");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent)",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Entre aqui
              </button>
            </>
          )}
        </div>
      </div>

      {/* Estilos para animações de fade e slide */}
      <style>{`
        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes authSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hide-modal-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
