import Link from "next/link";
import { Film, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        marginTop: 80,
        padding: "48px 0 32px",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "var(--accent)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Film size={18} color="#0a0a0f" />
              </div>
              <span
                className="font-display"
                style={{ fontSize: "1.125rem", fontWeight: 900, color: "var(--text-primary)" }}
              >
                CineVerse
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
              Sua plataforma de cinema. Descubra, avalie e compartilhe o amor pelo cinema.
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: 16, color: "var(--text-primary)", fontSize: "0.875rem" }}>
              Navegação
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { href: "/", label: "Início" },
                { href: "/recommend", label: "Recomendações" },
                { href: "/search", label: "Buscar" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ color: "var(--text-muted)", fontSize: "0.875rem", transition: "color 0.2s" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Conta */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: 16, color: "var(--text-primary)", fontSize: "0.875rem" }}>
              Conta
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { href: "/login", label: "Entrar" },
                { href: "/register", label: "Criar conta" },
                { href: "/profile", label: "Meu Perfil" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ color: "var(--text-muted)", fontSize: "0.875rem", transition: "color 0.2s" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            © 2025 CineVerse. Dados de filmes fornecidos por{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}
            >
              TMDB
            </a>.
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Feito com <Heart size={13} color="var(--red)" fill="var(--red)" /> para o TCC
          </p>
        </div>
      </div>
    </footer>
  );
}
