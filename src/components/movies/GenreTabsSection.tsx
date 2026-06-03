"use client";

import { useState } from "react";
import type { TMDBMovie } from "@/types/tmdb";
import MovieRow from "./MovieRow";
import { Star, Award, Flame, Heart, Smile } from "lucide-react";

interface GenreTabsSectionProps {
  actionMovies: TMDBMovie[];
  comedyMovies: TMDBMovie[];
  horrorMovies: TMDBMovie[];
  romanceMovies: TMDBMovie[];
  scifiMovies: TMDBMovie[];
  acclaimedMovies: TMDBMovie[];
  watchedMovieIds: number[];
  watchlistMovieIds: number[];
}

type TabType = "action" | "comedy" | "horror" | "romance" | "scifi" | "acclaimed";

export default function GenreTabsSection({
  actionMovies,
  comedyMovies,
  horrorMovies,
  romanceMovies,
  scifiMovies,
  acclaimedMovies,
  watchedMovieIds,
  watchlistMovieIds,
}: GenreTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>("acclaimed"); // Inicia com os aclamados em destaque!

  const tabs = [
    { 
      id: "acclaimed" as const, 
      label: "🏆 Zeraram as Premiações", 
      movies: acclaimedMovies,
      description: "Só os filmes de grife que limparam as premiações e deixaram os concorrentes chorando no banho. Respeita a grife! 🏆💅"
    },
    { 
      id: "action" as const, 
      label: "🍿 Ação", 
      movies: actionMovies,
      description: "Tiro, porrada, bomba e perseguição insana. Explosão de adrenalina!" 
    },
    { 
      id: "comedy" as const, 
      label: "🤡 Comédia", 
      movies: comedyMovies,
      description: "Para dar gargalhada e esquecer dos boletos acumulados." 
    },
    { 
      id: "horror" as const, 
      label: "🫣 Terror", 
      movies: horrorMovies,
      description: "Para fingir que é corajoso e depois dormir com a luz acesa." 
    },
    { 
      id: "romance" as const, 
      label: "👩‍❤️‍👨 Romance", 
      movies: romanceMovies,
      description: "Amor no ar, cafuné, clichês fofos e lágrimas garantidas." 
    },
    { 
      id: "scifi" as const, 
      label: "🧠 Sci-Fi", 
      movies: scifiMovies,
      description: "Plot twists alienígenas e universos que vão fritar seus neurônios." 
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section style={{ marginBottom: 56 }}>
      {/* Título da Seção */}
      <h2 className="section-title" style={{ marginBottom: 16 }}>
        <Award size={18} color="var(--accent)" />
        Explorar por Categoria
      </h2>

      {/* Navegação por Abas (Scroll horizontal no mobile) */}
      <div 
        style={{ 
          display: "flex", 
          gap: 10, 
          overflowX: "auto", 
          paddingBottom: 10,
          marginBottom: 16,
          borderBottom: "1px solid var(--border)",
          scrollbarWidth: "none"
        }}
        className="hide-scrollbar"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                background: isActive ? "var(--accent)" : "var(--surface)",
                border: "1px solid " + (isActive ? "var(--accent)" : "var(--border)"),
                color: isActive ? "#0a0a0f" : "var(--text-secondary)",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--border-hover)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Descrição Jovem da Aba Ativa */}
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 20, fontStyle: "italic" }}>
        {currentTab.description}
      </p>

      {/* Carrossel de Filmes da Aba Ativa */}
      <div className="fade-in" key={activeTab}>
        <MovieRow
          movies={currentTab.movies}
          watchedMovieIds={watchedMovieIds}
          watchlistMovieIds={watchlistMovieIds}
        />
      </div>
    </section>
  );
}
