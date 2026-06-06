"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Users, Sparkles, Film, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/curation", label: "Curadoria", icon: Sparkles },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        background: "linear-gradient(180deg, #0d1117 0%, #080b12 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #e8b44b, #f5d07a)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Film size={18} color="#0a0a0f" />
          </div>
          <div>
            <p style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>CineVerse</p>
            <p style={{ fontSize: "0.65rem", color: "var(--accent)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: isActive ? "rgba(232,180,75,0.12)" : "transparent",
                border: `1px solid ${isActive ? "rgba(232,180,75,0.25)" : "transparent"}`,
                color: isActive ? "#e8b44b" : "rgba(255,255,255,0.5)",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.875rem",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer: voltar ao site + logout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 4 }}>
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "9px 12px", borderRadius: 10,
            color: "rgba(255,255,255,0.4)", fontSize: "0.8125rem",
            textDecoration: "none", transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          ← Ver Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "9px 12px", borderRadius: 10,
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(224,82,82,0.7)", fontSize: "0.8125rem",
            transition: "color 0.2s", width: "100%",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e05252")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(224,82,82,0.7)")}
        >
          <LogOut size={15} /> Sair
        </button>
      </div>
    </aside>
  );
}
