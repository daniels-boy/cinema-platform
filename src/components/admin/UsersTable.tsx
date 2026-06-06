"use client";

import { useState, useTransition } from "react";
import { Ban, Clock, CheckCircle, Search, Shield } from "lucide-react";
import { banUser, suspendUser, unbanUser } from "@/actions/admin";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  banned: boolean;
  suspendedUntil: string | null;
  createdAt: string;
  image: string | null;
  _count: { reviews: number; watched: number };
}

const SUSPEND_OPTIONS = [1, 3, 7, 30];

export default function UsersTable({ users: initial }: { users: UserRow[] }) {
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState("");
  const [suspendModal, setSuspendModal] = useState<string | null>(null);
  const [suspendDays, setSuspendDays] = useState(7);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (u: UserRow) => {
    if (u.banned) return { label: "Banido", color: "#e05252", bg: "rgba(224,82,82,0.1)", border: "rgba(224,82,82,0.25)" };
    if (u.suspendedUntil && new Date(u.suspendedUntil) > new Date()) {
      const until = new Date(u.suspendedUntil).toLocaleDateString("pt-BR");
      return { label: `Suspenso até ${until}`, color: "#eab308", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)" };
    }
    if (u.role === "ADMIN") return { label: "Admin", color: "#e8b44b", bg: "rgba(232,180,75,0.1)", border: "rgba(232,180,75,0.25)" };
    return { label: "Ativo", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" };
  };

  const handleBan = (id: string) => {
    if (!confirm("Banir este usuário permanentemente?")) return;
    setLoadingId(id);
    startTransition(async () => {
      const res = await banUser(id);
      if (res.success) setUsers((prev) => prev.map((u) => u.id === id ? { ...u, banned: true } : u));
      setLoadingId(null);
    });
  };

  const handleUnban = (id: string) => {
    setLoadingId(id);
    startTransition(async () => {
      const res = await unbanUser(id);
      if (res.success) setUsers((prev) => prev.map((u) => u.id === id ? { ...u, banned: false, suspendedUntil: null } : u));
      setLoadingId(null);
    });
  };

  const handleSuspend = (id: string) => {
    setLoadingId(id);
    startTransition(async () => {
      const res = await suspendUser(id, suspendDays);
      if (res.success) {
        const until = new Date();
        until.setDate(until.getDate() + suspendDays);
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, banned: false, suspendedUntil: until.toISOString() } : u));
      }
      setLoadingId(null);
      setSuspendModal(null);
    });
  };

  return (
    <div>
      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, maxWidth: 400 }}>
        <Search size={15} color="rgba(255,255,255,0.3)" />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: "0.875rem", flex: 1 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 140px 160px", gap: 12, padding: "12px 20px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {["Usuário", "Reviews", "Filmes", "Status", "Ações"].map((h) => (
            <span key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {filtered.map((user) => {
          const status = getStatus(user);
          const isSelf = user.role === "ADMIN";
          return (
            <div key={user.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 140px 160px", gap: 12, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", opacity: loadingId === user.id ? 0.5 : 1, transition: "opacity 0.2s" }}>
              {/* Usuário */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>{user.name ?? "—"}</p>
                  {user.role === "ADMIN" && <Shield size={12} color="#e8b44b" />}
                </div>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>{user.email}</p>
                <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
                  Cadastro: {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {/* Reviews */}
              <span style={{ fontSize: "0.875rem", color: "#fff", fontWeight: 600 }}>{user._count.reviews}</span>
              {/* Filmes */}
              <span style={{ fontSize: "0.875rem", color: "#fff", fontWeight: 600 }}>{user._count.watched}</span>
              {/* Status */}
              <span style={{ fontSize: "0.7rem", fontWeight: 700, background: status.bg, color: status.color, border: `1px solid ${status.border}`, borderRadius: 6, padding: "3px 8px", display: "inline-block" }}>
                {status.label}
              </span>
              {/* Ações */}
              {!isSelf ? (
                <div style={{ display: "flex", gap: 6 }}>
                  {user.banned || user.suspendedUntil ? (
                    <button
                      onClick={() => handleUnban(user.id)}
                      title="Desbanir / Remover suspensão"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      <CheckCircle size={12} /> Desbanir
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { setSuspendModal(user.id); setSuspendDays(7); }}
                        title="Suspender temporariamente"
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)", color: "#eab308", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        <Clock size={12} /> Suspender
                      </button>
                      <button
                        onClick={() => handleBan(user.id)}
                        title="Banir permanentemente"
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.25)", color: "#e05252", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        <Ban size={12} /> Banir
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)" }}>—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de suspensão */}
      {suspendModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={() => setSuspendModal(null)}
        >
          <div
            style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, minWidth: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>Suspender Usuário</h3>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
              Por quantos dias deseja suspender?
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {SUSPEND_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSuspendDays(d)}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 8, background: suspendDays === d ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${suspendDays === d ? "rgba(234,179,8,0.5)" : "rgba(255,255,255,0.08)"}`, color: suspendDays === d ? "#eab308" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
                >
                  {d}d
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setSuspendModal(null)}
                style={{ flex: 1, padding: "10px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontWeight: 600, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSuspend(suspendModal)}
                style={{ flex: 1, padding: "10px", borderRadius: 9, background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.4)", color: "#eab308", fontWeight: 700, cursor: "pointer" }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
