"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, Film, Menu, X, Sparkles, User, LogOut, LogIn } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useAuthModal } from "@/contexts/AuthModalContext";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openLogin } = useAuthModal();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/recommend", label: "Oráculo" },
    { href: "/reviews", label: "Reviews" },
    { href: "/resenhas", label: "Resenhas" },
  ];

  // No home sem scroll: header completamente transparente
  // No home com scroll ou em outra página: fundo escuro com blur
  const headerBg = scrolled ? "rgba(10, 10, 15, 0.92)" : "transparent";
  const headerBlur = scrolled ? "blur(16px)" : "none";
  const headerShadow = scrolled ? "0 1px 0 rgba(255,255,255,0.06)" : "none";

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: "background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease",
          background: headerBg,
          backdropFilter: headerBlur,
          WebkitBackdropFilter: headerBlur,
          boxShadow: headerShadow,
        }}
      >
        <div
          className="container"
          style={{ display: "flex", alignItems: "center", height: 68, gap: 32 }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "var(--accent)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Film size={20} color="#0a0a0f" strokeWidth={2.5} />
            </div>
            <span
              className="font-display"
              style={{
                fontSize: "1.25rem",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              CineVerse
            </span>
          </Link>

          {/* Nav Links — desktop */}
          <nav style={{ display: "flex", gap: 4, flex: 1 }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color:
                    pathname === link.href
                      ? "var(--accent)"
                      : "rgba(255,255,255,0.75)",
                  background:
                    pathname === link.href ? "var(--accent-dim)" : "transparent",
                  transition: "all 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginLeft: "auto",
            }}
          >
            {/* Inline expanding search bar */}
            <form
              onSubmit={handleSearch}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: searchOpen ? "200px" : "36px",
                height: "36px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderColor: searchOpen ? "var(--accent)" : "rgba(255,255,255,0.12)",
                transition: "width 0.3s ease, border-color 0.2s",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                id="search-toggle-btn"
                onClick={() => {
                  if (!searchOpen) {
                    setSearchOpen(true);
                  } else if (!searchQuery.trim()) {
                    setSearchOpen(false);
                  } else {
                    // Trigger search submit programmatically
                    const form = searchRef.current?.form;
                    if (form) form.requestSubmit();
                  }
                }}
                aria-label="Buscar filmes"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 35,
                  height: 35,
                  background: "transparent",
                  border: "none",
                  color: searchOpen ? "var(--accent)" : "rgba(255,255,255,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 2,
                }}
              >
                <Search size={16} />
              </button>
              <input
                ref={searchRef}
                id="search-input"
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery.trim()) {
                    setSearchOpen(false);
                  }
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  padding: "0 10px 0 36px",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: "0.875rem",
                  outline: "none",
                  opacity: searchOpen ? 1 : 0,
                  transition: "opacity 0.25s ease",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </form>

            {session ? (
              <>
                <Link
                  href="/profile"
                  id="profile-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#fff",
                    transition: "all 0.2s",
                  }}
                >
                  {session.user?.image ? (
                    <div style={{ position: "relative", width: 18, height: 18, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                      <img
                        src={session.user.image}
                        alt="Avatar"
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
                  ) : (
                    <User size={15} />
                  )}
                  <span className="name-label">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                </Link>
                <button
                  id="signout-btn"
                  onClick={() => signOut()}
                  aria-label="Sair"
                  title="Sair"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button
                id="login-header-btn"
                className="btn btn-primary"
                onClick={openLogin}
                style={{ padding: "8px 20px", cursor: "pointer" }}
              >
                <LogIn size={15} />
                Entrar
              </button>
            )}

            <button
              className="btn-icon mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
              }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>



        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            style={{
              background: "rgba(10, 10, 15, 0.98)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "16px 24px",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color:
                    pathname === link.href
                      ? "var(--accent)"
                      : "rgba(255,255,255,0.7)",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <style>{`
        @media (min-width: 640px) {
          .name-label { display: inline !important; }
        }
        .name-label { display: none; }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
        }
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
