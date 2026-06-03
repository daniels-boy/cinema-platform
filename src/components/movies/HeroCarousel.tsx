"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTMDBImageUrl } from "@/lib/tmdb";
import type { TMDBMovie } from "@/types/tmdb";
import { Play, Sparkles, Star, ChevronRight } from "lucide-react";

interface HeroCarouselProps {
  movies: TMDBMovie[];
}

export default function HeroCarousel({ movies }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const featured = movies.slice(0, 8);

  const goTo = useCallback(
    (index: number) => {
      if (animating) return;
      setAnimating(true);
      setCurrent((index + featured.length) % featured.length);
      setTimeout(() => setAnimating(false), 600);
    },
    [animating, featured.length]
  );

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  // Auto-advance a cada 7s
  useEffect(() => {
    const timer = setTimeout(() => goTo(current + 1), 7000);
    return () => clearTimeout(timer);
  }, [current, goTo]);

  const movie = featured[current];
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";

  // Ajusta automaticamente o tamanho da font para caber em 1 linha
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const MAX = 3;    // rem máximo
    const MIN = 1.25; // rem mínimo
    const STEP = 0.05;
    el.style.fontSize = MAX + "rem";
    while (el.scrollWidth > el.offsetWidth && parseFloat(el.style.fontSize) > MIN) {
      el.style.fontSize = (parseFloat(el.style.fontSize) - STEP).toFixed(2) + "rem";
    }
  }, [movie.title]);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 600,
        overflow: "hidden",
      }}
    >
      {/* ── Backdrop full-screen ── */}
      {featured.map((m, i) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.8s ease",
            zIndex: 0,
          }}
        >
          <Image
            src={getTMDBImageUrl(m.backdrop_path, "original")}
            alt={m.title}
            fill
            priority={i === 0}
            style={{ objectFit: "cover", objectPosition: "center top" }}
            sizes="100vw"
          />
        </div>
      ))}

      {/* ── Gradientes ── */}
      {/* Escurece os lados e baixo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%),
            linear-gradient(to top, rgba(10,10,15,1) 0%, rgba(10,10,15,0.4) 30%, transparent 60%),
            linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 20%)
          `,
          zIndex: 1,
        }}
      />

      {/* ── Conteúdo principal ── */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          paddingBottom: 120,
        }}
      >
        <div
          style={{
            maxWidth: 640,
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(12px)" : "translateY(0)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          {/* Gênero / badge */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--accent)",
                color: "#0a0a0f",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 20,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              ★ Em Alta #{current + 1}
            </span>
            {year && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {year}
              </span>
            )}
          </div>

          {/* Título */}
          <h1
            ref={titleRef}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "3rem",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.08,
              marginBottom: 16,
              letterSpacing: "-0.03em",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {movie.title}
          </h1>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--accent)",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              <Star size={17} fill="currentColor" />
              {movie.vote_average.toFixed(1)}
              <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400, fontSize: "0.875rem" }}>
                / 10
              </span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>
              {movie.vote_count.toLocaleString("pt-BR")} avaliações
            </span>
          </div>

          {/* Sinopse */}
          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "0.975rem",
              lineHeight: 1.75,
              marginBottom: 28,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {movie.overview || "Sinopse não disponível."}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href={`/movie/${movie.id}`}
              id={`hero-watch-${movie.id}`}
              className="btn btn-primary"
              style={{ padding: "12px 28px", fontSize: "0.9375rem" }}
            >
              <Play size={17} fill="currentColor" />
              Ver Detalhes
            </Link>
            <Link
              href="/recommend"
              id="hero-recommend-link"
              className="btn btn-ghost"
              style={{
                padding: "12px 24px",
                fontSize: "0.9375rem",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                borderColor: "rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            >
              <Sparkles size={15} />
              Recomendações
            </Link>
          </div>
        </div>
      </div>



      {/* ── Seta direita ── */}
      <button
        id="hero-next-btn"
        onClick={next}
        aria-label="Próximo"
        style={{
          position: "absolute",
          right: 24,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 3,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.4)")}
      >
        <ChevronRight size={22} />
      </button>

      {/* ── Dots indicadores ── */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {featured.map((_, i) => (
          <button
            key={i}
            id={`hero-dot-${i}`}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 24 : 6,
              height: 6,
              borderRadius: 3,
              background: i === current ? "var(--accent)" : "rgba(255,255,255,0.3)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
            aria-label={`Ir para filme ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
