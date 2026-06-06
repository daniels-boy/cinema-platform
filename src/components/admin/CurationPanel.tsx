"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Star, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { setFeaturedBanner, removeFeaturedBanner, createCuratedCollection, toggleCollection, deleteCollection } from "@/actions/admin";
import { getTMDBImageUrl } from "@/lib/tmdb";

interface Banner { id: string; tmdbId: number; title: string; subtitle: string; }
interface Collection { id: string; title: string; description: string; emoji: string; tmdbIds: number[]; active: boolean; createdAt: string; }

export default function CurationPanel({
  currentBanner: initBanner,
  collections: initCollections,
}: {
  currentBanner: Banner | null;
  collections: Collection[];
}) {
  const [banner, setBanner] = useState<Banner | null>(initBanner);
  const [collections, setCollections] = useState(initCollections);
  const [bannerInput, setBannerInput] = useState("");
  const [bannerPreview, setBannerPreview] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [collForm, setCollForm] = useState({ title: "", description: "", emoji: "🎬", tmdbIds: "" });
  const [showCollForm, setShowCollForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(null), 3000); };
  const showErr = (text: string) => { setError(text); setTimeout(() => setError(null), 4000); };

  const handleSetBanner = () => {
    const id = parseInt(bannerInput.trim());
    if (isNaN(id)) return showErr("Digite um TMDB ID válido (apenas números).");
    setLoadingId("banner");
    startTransition(async () => {
      const res = await setFeaturedBanner(id);
      if (res.error) showErr(res.error);
      else {
        setBanner({ id: "new", tmdbId: (res.movie as any).id, title: (res.movie as any).title, subtitle: (res.movie as any).overview?.slice(0, 160) ?? "" });
        setBannerInput("");
        showMsg("✅ Destaque atualizado!");
      }
      setLoadingId(null);
    });
  };

  const handleRemoveBanner = () => {
    setLoadingId("banner-remove");
    startTransition(async () => {
      await removeFeaturedBanner();
      setBanner(null);
      showMsg("Banner removido.");
      setLoadingId(null);
    });
  };

  const handleCreateCollection = () => {
    const ids = collForm.tmdbIds.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
    if (!collForm.title.trim()) return showErr("O título é obrigatório.");
    if (ids.length === 0) return showErr("Adicione pelo menos 1 TMDB ID.");
    setLoadingId("new-coll");
    startTransition(async () => {
      const res = await createCuratedCollection({ title: collForm.title, description: collForm.description, emoji: collForm.emoji, tmdbIds: ids });
      if (res.error) showErr(res.error);
      else {
        setCollections((prev) => [{ id: Date.now().toString(), ...collForm, tmdbIds: ids, active: true, createdAt: new Date().toISOString() }, ...prev]);
        setCollForm({ title: "", description: "", emoji: "🎬", tmdbIds: "" });
        setShowCollForm(false);
        showMsg("✅ Coleção criada!");
      }
      setLoadingId(null);
    });
  };

  const handleToggle = (id: string, active: boolean) => {
    setLoadingId(id);
    startTransition(async () => {
      const res = await toggleCollection(id, active);
      if (res.success) setCollections((prev) => prev.map((c) => c.id === id ? { ...c, active: !active } : c));
      setLoadingId(null);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Deletar esta coleção?")) return;
    setLoadingId(id + "-del");
    startTransition(async () => {
      const res = await deleteCollection(id);
      if (res.success) setCollections((prev) => prev.filter((c) => c.id !== id));
      setLoadingId(null);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Feedback */}
      {msg && <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", padding: "12px 16px", borderRadius: 10, fontSize: "0.875rem" }}>{msg}</div>}
      {error && <div style={{ background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.3)", color: "#e05252", padding: "12px 16px", borderRadius: 10, fontSize: "0.875rem" }}>{error}</div>}

      {/* ── BANNER ────────────────────────────────────────────────────── */}
      <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 28 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", marginBottom: 4 }}>⭐ Destaque da Semana</h2>
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
          O filme escolhido aparece em banner gigante no topo da homepage.
        </p>

        {banner && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(232,180,75,0.06)", border: "1px solid rgba(232,180,75,0.2)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#e8b44b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Destaque Atual</p>
              <p style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{banner.title}</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>TMDB #{banner.tmdbId}</p>
            </div>
            <button
              onClick={handleRemoveBanner}
              disabled={loadingId === "banner-remove"}
              style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.25)", color: "#e05252", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
            >
              <Trash2 size={13} /> Remover
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="number"
            placeholder="TMDB ID do filme (ex: 550)"
            value={bannerInput}
            onChange={(e) => setBannerInput(e.target.value)}
            style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: "10px 14px", color: "#fff", fontSize: "0.875rem", outline: "none" }}
          />
          <button
            onClick={handleSetBanner}
            disabled={loadingId === "banner" || !bannerInput}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 9, background: "rgba(232,180,75,0.15)", border: "1px solid rgba(232,180,75,0.35)", color: "#e8b44b", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
          >
            {loadingId === "banner" ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
            Definir Destaque
          </button>
        </div>
      </section>

      {/* ── COLEÇÕES ──────────────────────────────────────────────────── */}
      <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>🎭 Coleções Manuais</h2>
          <button
            onClick={() => setShowCollForm((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
          >
            <Plus size={13} /> Nova Coleção
          </button>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
          Crie seções temáticas que aparecem na homepage (ex: "Especial Halloween").
        </p>

        {/* Formulário de nova coleção */}
        {showCollForm && (
          <div style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 12, padding: 20, marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={collForm.emoji} onChange={(e) => setCollForm((f) => ({ ...f, emoji: e.target.value }))} placeholder="🎬" style={{ width: 56, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px", color: "#fff", fontSize: "1.2rem", outline: "none" }} />
              <input value={collForm.title} onChange={(e) => setCollForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título (ex: Especial Halloween)" style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: "0.875rem", outline: "none" }} />
            </div>
            <input value={collForm.description} onChange={(e) => setCollForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descrição (opcional)" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: "0.875rem", outline: "none" }} />
            <input value={collForm.tmdbIds} onChange={(e) => setCollForm((f) => ({ ...f, tmdbIds: e.target.value }))} placeholder="TMDB IDs separados por vírgula (ex: 550, 278, 238)" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: "0.875rem", outline: "none" }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCollForm(false)} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontWeight: 600, cursor: "pointer", fontSize: "0.8125rem" }}>Cancelar</button>
              <button onClick={handleCreateCollection} disabled={loadingId === "new-coll"} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)", color: "#a78bfa", fontWeight: 700, cursor: "pointer", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 6 }}>
                {loadingId === "new-coll" ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Criar
              </button>
            </div>
          </div>
        )}

        {/* Lista de coleções */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {collections.length === 0 && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.875rem" }}>Nenhuma coleção criada ainda.</p>}
          {collections.map((col) => (
            <div key={col.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${col.active ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "14px 16px", opacity: col.active ? 1 : 0.6, transition: "opacity 0.2s" }}>
              <span style={{ fontSize: "1.5rem" }}>{col.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.875rem" }}>{col.title}</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>{col.tmdbIds.length} filme{col.tmdbIds.length !== 1 ? "s" : ""} · {col.active ? "✅ Ativo" : "⏸ Inativo"}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handleToggle(col.id, col.active)} disabled={!!loadingId} title={col.active ? "Desativar" : "Ativar"} style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {loadingId === col.id ? <Loader2 size={12} className="animate-spin" /> : col.active ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button onClick={() => handleDelete(col.id)} disabled={!!loadingId} title="Deletar" style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)", color: "rgba(224,82,82,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {loadingId === col.id + "-del" ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
