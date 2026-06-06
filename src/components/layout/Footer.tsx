import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/recommend", label: "Oráculo" },
  { href: "/reviews", label: "Reviews" },
  { href: "/resenhas", label: "Resenhas" },
  { href: "/search", label: "Buscar" },
];

const accountLinks = [
  { href: "/login", label: "Entrar" },
  { href: "/register", label: "Criar conta" },
  { href: "/profile", label: "Meu Perfil" },
];

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-link {
          color: rgba(255,255,255,0.45);
          font-size: 0.875rem;
          text-decoration: none;
          transition: color 0.2s;
          display: block;
        }
        .footer-link:hover {
          color: var(--accent);
        }
        .footer-tmdb {
          color: var(--accent);
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .footer-tmdb:hover {
          opacity: 0.8;
        }
      `}</style>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10, 10, 15, 0.97)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          marginTop: 80,
          padding: "56px 0 32px",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 48,
              marginBottom: 48,
            }}
          >
            {/* Brand */}
            <div>
              <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginBottom: 16,
                textDecoration: "none",
              }}
            >
              <Image
                src="/cineverse-logo.png"
                alt="CineVerse Logo"
                width={36}
                height={36}
                style={{ objectFit: "contain" }}
              />
            </Link>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                  maxWidth: 240,
                }}
              >
                Sua plataforma de cinema. Descubra, avalie e compartilhe o amor pelo cinema.
              </p>
            </div>

            {/* Navegação */}
            <div>
              <p
                style={{
                  fontWeight: 600,
                  marginBottom: 20,
                  color: "#fff",
                  fontSize: "0.8125rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Navegação
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Conta */}
            <div>
              <p
                style={{
                  fontWeight: 600,
                  marginBottom: 20,
                  color: "#fff",
                  fontSize: "0.8125rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Conta
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {accountLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 28,
            }}
          />

          {/* Bottom bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8125rem" }}>
              © 2026 CineVerse. Dados fornecidos por{" "}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-tmdb"
              >
                TMDB
              </a>
              .
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.8125rem",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Feito com{" "}
              <Heart size={13} color="var(--red)" fill="var(--red)" />{" "}
              para o TCC
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
