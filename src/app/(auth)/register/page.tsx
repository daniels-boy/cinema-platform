"use client";

import { useState } from "react";
import { Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        setError("Conta criada com sucesso, mas ocorreu um erro no login automático. Vá para a página de login.");
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Ocorreu um erro ao cadastrar. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
        background: "var(--background)",
        overflow: "hidden",
      }}
    >
      {/* Elementos decorativos de fundo */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "50vw",
          height: "50vw",
          background: "radial-gradient(circle, rgba(232, 180, 75, 0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          background: "radial-gradient(circle, rgba(224, 82, 82, 0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Card principal */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(135deg, rgba(17, 17, 24, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          animation: "pageFadeIn 0.5s ease-out",
        }}
      >
        {/* Logo / Link Home */}
        <Link href="/" style={{ display: "flex", alignItems: "center", marginBottom: 28, alignSelf: "flex-start" }}>
          <Image
            src="/cineverse-logo.png"
            alt="CineVerse Logo"
            width={34}
            height={34}
            style={{ objectFit: "contain" }}
          />
        </Link>

        {/* Título */}
        <h1
          className="font-display"
          style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}
        >
          Crie sua conta
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 28 }}>
          Cadastre-se para começar a montar sua coleção de favoritos e interagir com outros cinéfilos.
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
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: "12px",
              fontSize: "0.9375rem",
              marginTop: 10,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Criar Conta"
            )}
          </button>
        </form>

        {/* Switch Link */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
          }}
        >
          Já possui uma conta?{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            style={{
              color: "var(--accent)",
              fontWeight: 600,
            }}
          >
            Entre aqui
          </Link>
        </div>
      </div>

      <style precedence="default" href="page-styles-1">{`
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--background)",
            color: "var(--text-secondary)",
          }}
        >
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
