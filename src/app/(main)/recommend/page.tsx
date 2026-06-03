"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { getGamifiedRecommendationsAction, getUserCollectionsAction, toggleWatched, toggleWatchlist } from "@/actions/movies";
import { getTMDBImageUrl } from "@/lib/tmdb";
import type { TMDBMovie } from "@/types/tmdb";
import Link from "next/link";
import { 
  Sparkles, 
  HelpCircle, 
  User, 
  Users, 
  Heart, 
  Loader2, 
  RotateCcw, 
  Dice5, 
  Eye, 
  Bookmark, 
  Star, 
  ChevronRight, 
  ArrowLeft,
  Flame,
  Award,
  Video
} from "lucide-react";

// --- Tipagens e Mapeamentos ---
interface Option {
  id: string;
  label: string;
  description: string;
  emoji: string;
  genreIds?: number[];
  genreId?: number; // para moods específicos
  era?: "recent" | "classic" | "any";
}

// 1. Passo do Rolê / Companhia
const VIBE_OPTIONS: Option[] = [
  { 
    id: "solo", 
    label: "Lobo Solitário", 
    description: "Só eu, meu silêncio e um balde de pipoca no escuro.", 
    emoji: "👤",
    genreIds: [18, 878, 53, 9648] // Drama, Sci-Fi, Thriller, Mystery
  },
  { 
    id: "couple", 
    label: "Casalzin", 
    description: "Clima de romance, cafuné e um cineminha pra relaxar.", 
    emoji: "👩‍❤️‍👨",
    genreIds: [10749, 35, 14] // Romance, Comedy, Fantasy
  },
  { 
    id: "friends", 
    label: "Galera Reunida", 
    description: "Gritos, risadas altas, pizza e bagunça garantida.", 
    emoji: "🍕",
    genreIds: [27, 28, 35, 12] // Horror, Action, Comedy, Adventure
  },
  { 
    id: "family", 
    label: "Família no Sofá", 
    description: "Livre de constrangimento e seguro para todas as idades.", 
    emoji: "👨‍👩‍👧",
    genreIds: [16, 10751, 12, 14] // Animation, Family, Adventure, Fantasy
  }
];

// 2. Passo do Humor / Vibe Emocional
const MOOD_OPTIONS: Option[] = [
  { 
    id: "sad", 
    label: "Tô na fossa", 
    description: "Quero chorar as pitangas e me afogar nas minhas lágrimas.", 
    emoji: "😭",
    genreId: 18 // Drama
  },
  { 
    id: "romance", 
    label: "Clima de romance", 
    description: "Aquele romance levinho e fofo estilo anos 2000, bem água com açúcar e sem drama pesado para deixar o coração quentinho. 🧸✨", 
    emoji: "🥰",
    genreId: 10749 // Romance
  },
  { 
    id: "mindless", 
    label: "Desligar o cérebro", 
    description: "Popcorn puro: explosão, pancadaria ou diversão boba.", 
    emoji: "🍿",
    genreId: 28 // Action
  },
  { 
    id: "laugh", 
    label: "Rindo à toa", 
    description: "Preciso de piadas boas (ou ruins) para esquecer os boletos.", 
    emoji: "🤡",
    genreId: 35 // Comedy
  },
  { 
    id: "mindbending", 
    label: "Fritar os neurônios", 
    description: "Mindfucks, plot twists malucos e ficção científica.", 
    emoji: "🧠",
    genreId: 878 // Sci-Fi
  },
  { 
    id: "spooky", 
    label: "Medo & Delírio", 
    description: "Quero levar sustos, ficar tenso e me arrepender depois.", 
    emoji: "🫣",
    genreId: 27 // Horror
  },
  { 
    id: "action", 
    label: "Porrada e adrenalina", 
    description: "Tiroteio, perseguição rápida, roubos e ação frenética.", 
    emoji: "⚔️",
    genreId: 53 // Thriller
  }
];

// 3. Passo da Era / Época
const ERA_OPTIONS: Option[] = [
  { 
    id: "recent", 
    label: "Lançamentos Quentes", 
    description: "Sair do forno, lançados nos últimos anos (2018–2026).", 
    emoji: "🚀",
    era: "recent"
  },
  { 
    id: "classic", 
    label: "Relíquias de Ouro", 
    description: "A nostalgia bateu! Clássicos eternos (1980–2010).", 
    emoji: "📼",
    era: "classic"
  },
  { 
    id: "any", 
    label: "Tanto faz, manda a call", 
    description: "Não me importo com a idade, contanto que seja brabo.", 
    emoji: "🌍",
    era: "any"
  }
];

const ORACLE_MESSAGES = [
  "🔮 Consultando o oráculo do CineVerse...",
  "🍿 Estourando a pipoca digital...",
  "🚫 Eliminando flops e filmes com nota vermelha...",
  "✨ Alinhando as estrelas da sétima arte...",
  "📊 Calculando o Match de Vibe perfeito para você...",
  "🎬 Quase lá! Preparando a sua call..."
];

const MATCH_PHRASES = [
  "Match com a sua Vibe",
  "Zero Defeitos para Hoje",
  "Chance de ser Banger",
  "A Call Perfeita",
  "Vibe Match Supremo",
  "Aprovado pelo Oráculo",
  "Papo Reto: vai dar bom",
  "Sem chances de Flop",
  "Cinema de Verdade",
  "Garantia de Pipoca Feliz",
  "Não tem erro: é brabo!"
];

export default function RecommendPage() {
  const { data: session } = useSession();
  const { openLogin } = useAuthModal();

  // Estados do Quiz
  const [step, setStep] = useState(0); // 0: Start, 1: Vibe/Who, 2: Mood, 3: Era, 4: Loading, 5: Results
  const [selectedVibe, setSelectedVibe] = useState<Option | null>(null);
  const [selectedMood, setSelectedMood] = useState<Option | null>(null);
  const [selectedEra, setSelectedEra] = useState<Option | null>(null);

  // Estados dos Resultados
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [matchScore, setMatchScore] = useState(95);
  const [matchPhrase, setMatchPhrase] = useState("Match com a sua Vibe");
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingText, setLoadingText] = useState(ORACLE_MESSAGES[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados de Coleção do Usuário
  const [userWatched, setUserWatched] = useState<number[]>([]);
  const [userWatchlist, setUserWatchlist] = useState<number[]>([]);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null); // "watch-ID" ou "save-ID"

  // Buscar coleções do usuário ao montar e quando as ações mudam
  const fetchUserCollections = async () => {
    if (!session) return;
    const res = await getUserCollectionsAction();
    if (res.watched && res.watchlist) {
      setUserWatched(res.watched);
      setUserWatchlist(res.watchlist);
    }
  };

  useEffect(() => {
    fetchUserCollections();
  }, [session]);

  // Loop de texto do Oráculo
  useEffect(() => {
    if (step !== 4) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % ORACLE_MESSAGES.length;
      setLoadingText(ORACLE_MESSAGES[idx]);
    }, 850);

    return () => clearInterval(interval);
  }, [step]);

  // Função para carregar as recomendações
  const fetchRecommendations = async (vibe: Option, mood: Option, era: Option) => {
    setLoadingResults(true);
    setErrorMsg(null);
    try {
      // Prioriza o gênero do humor se disponível, senão pega aleatório do rolê
      const genreId = mood.genreId || (vibe.genreIds ? vibe.genreIds[Math.floor(Math.random() * vibe.genreIds.length)] : undefined);
      const res = await getGamifiedRecommendationsAction({
        genreId,
        era: era.era
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.results) {
        setMovies(res.results);
        // Gera um score de match divertido baseado no humor e vibe
        const baseScore = 90;
        const randomBonus = Math.floor(Math.random() * 10);
        setMatchScore(Math.min(99, baseScore + randomBonus));
        
        // Selecionar frase de match aleatória
        const randomPhrase = MATCH_PHRASES[Math.floor(Math.random() * MATCH_PHRASES.length)];
        setMatchPhrase(randomPhrase);
        
        setStep(5);
      }
    } catch (err) {
      setErrorMsg("Erro ao consultar o oráculo do cinema.");
    } finally {
      setLoadingResults(false);
    }
  };

  // Avançar Passos
  const handleVibeSelect = (opt: Option) => {
    setSelectedVibe(opt);
    setStep(2);
  };

  const handleMoodSelect = (opt: Option) => {
    setSelectedMood(opt);
    setStep(3);
  };

  const handleEraSelect = (opt: Option) => {
    setSelectedEra(opt);
    setStep(4);
    // Dispara a busca após 2.2s de simulação de loading
    setTimeout(() => {
      fetchRecommendations(selectedVibe!, selectedMood!, opt);
    }, 2200);
  };

  // Girar a Roleta (Re-roll)
  const handleReroll = () => {
    if (!selectedVibe || !selectedMood || !selectedEra) return;
    setStep(4);
    setTimeout(() => {
      fetchRecommendations(selectedVibe, selectedMood, selectedEra);
    }, 1500);
  };

  // Resetar Quiz
  const handleRestart = () => {
    setSelectedVibe(null);
    setSelectedMood(null);
    setSelectedEra(null);
    setMovies([]);
    setStep(0);
  };

  // Interações de Watched / Watchlist
  const handleToggleWatched = async (movieId: number) => {
    if (!session) {
      openLogin();
      return;
    }
    const actionKey = `watch-${movieId}`;
    setLoadingActionId(actionKey);
    try {
      const res = await toggleWatched(movieId);
      if (res.success && res.watched !== undefined) {
        setUserWatched((prev) => 
          res.watched 
            ? [...prev, movieId] 
            : prev.filter((id) => id !== movieId)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleToggleWatchlist = async (movieId: number) => {
    if (!session) {
      openLogin();
      return;
    }
    const actionKey = `save-${movieId}`;
    setLoadingActionId(actionKey);
    try {
      const res = await toggleWatchlist(movieId);
      if (res.success && res.saved !== undefined) {
        setUserWatchlist((prev) => 
          res.saved 
            ? [...prev, movieId] 
            : prev.filter((id) => id !== movieId)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActionId(null);
    }
  };

  // Separar o filme principal (Super Match) e alternativas
  const superMatch = movies[0];
  const alternatives = movies.slice(1, 4);

  return (
    <div style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 80, position: "relative", overflow: "hidden" }}>
      {/* Elementos Decorativos de Fundo */}
      <div style={{
        position: "absolute", top: -150, left: "10%", width: 400, height: 400,
        background: "radial-gradient(circle, rgba(232, 180, 75, 0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0
      }} />
      <div style={{
        position: "absolute", bottom: 50, right: "5%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(82, 192, 122, 0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
        
        {/* ─── PASSO 0: INTRO / BOAS-VINDAS ─── */}
        {step === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }} className="fade-in">
            <div style={{ display: "inline-flex", padding: 12, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", marginBottom: 20 }}>
              <Sparkles size={36} />
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, marginBottom: 16, color: "#fff" }} className="font-display">
              CineMatch <span style={{ color: "var(--accent)" }}>Oráculo</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", maxWidth: 540, margin: "0 auto 36px", lineHeight: 1.6 }}>
              Cansou de passar 2 horas navegando no catálogo e indo dormir sem assistir nada? 
              Responda a 3 perguntinhas rápidas que o nosso oráculo te entrega a call perfeita para o seu humor! 🍿✨
            </p>
            <button
              onClick={() => setStep(1)}
              className="btn btn-primary"
              id="start-recommendation-quiz"
              style={{ padding: "16px 40px", fontSize: "1.0625rem", borderRadius: "var(--radius-lg)" }}
            >
              <Dice5 size={18} />
              Bora Jogar!
            </button>
          </div>
        )}

        {/* ─── PASSO 1: VIBE / COMPANHIA ─── */}
        {step === 1 && (
          <div className="fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)" }}>
                Pergunta 1 de 3
              </span>
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
              Quem tá no sofá para assistir hoje? 👤🍕
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: 32 }}>
              Selecione o rolê ideal para calibrarmos os gêneros perfeitos.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
              {VIBE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleVibeSelect(opt)}
                  className="quiz-card-btn"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.25s",
                    color: "#fff"
                  }}
                >
                  <span style={{ fontSize: "2rem", width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", borderRadius: "var(--radius)" }}>
                    {opt.emoji}
                  </span>
                  <div>
                    <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: 4 }}>{opt.label}</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{opt.description}</p>
                  </div>
                  <ChevronRight size={18} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                </button>
              ))}
            </div>

            <button 
              onClick={() => setStep(0)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", marginTop: 28, fontSize: "0.875rem" }}
            >
              <ArrowLeft size={14} /> Voltar para o início
            </button>
          </div>
        )}

        {/* ─── PASSO 2: HUMOR / MOOD ─── */}
        {step === 2 && (
          <div className="fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)" }}>
                Pergunta 2 de 3
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                Rolê: {selectedVibe?.label}
              </span>
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
              Como tá o seu humor/vibe hoje? 😭🧠
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: 32 }}>
              Responde na sinceridade, sem julgamentos aqui!
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleMoodSelect(opt)}
                  className="quiz-card-btn"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.25s",
                    color: "#fff"
                  }}
                >
                  <span style={{ fontSize: "2rem", width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", borderRadius: "var(--radius)" }}>
                    {opt.emoji}
                  </span>
                  <div>
                    <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: 4 }}>{opt.label}</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{opt.description}</p>
                  </div>
                  <ChevronRight size={18} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                </button>
              ))}
            </div>

            <button 
              onClick={() => setStep(1)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", marginTop: 28, fontSize: "0.875rem" }}
            >
              <ArrowLeft size={14} /> Voltar à pergunta anterior
            </button>
          </div>
        )}

        {/* ─── PASSO 3: ERA / ÉPOCA ─── */}
        {step === 3 && (
          <div className="fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)" }}>
                Pergunta 3 de 3
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                Rolê: {selectedVibe?.label} • Humor: {selectedMood?.label}
              </span>
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
              Qual a época dos filmes que você quer? 🚀📼
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: 32 }}>
              Você quer lançamentos quentes ou clássicos nostálgicos?
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
              {ERA_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleEraSelect(opt)}
                  className="quiz-card-btn"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.25s",
                    color: "#fff"
                  }}
                >
                  <span style={{ fontSize: "2rem", width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", borderRadius: "var(--radius)" }}>
                    {opt.emoji}
                  </span>
                  <div>
                    <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: 4 }}>{opt.label}</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{opt.description}</p>
                  </div>
                  <ChevronRight size={18} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                </button>
              ))}
            </div>

            <button 
              onClick={() => setStep(2)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", marginTop: 28, fontSize: "0.875rem" }}
            >
              <ArrowLeft size={14} /> Voltar à pergunta anterior
            </button>
          </div>
        )}

        {/* ─── PASSO 4: CARREGAMENTO ORÁCULO ─── */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "80px 0" }} className="fade-in">
            <Loader2 size={48} className="animate-spin" color="var(--accent)" style={{ margin: "0 auto 28px" }} />
            <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", minHeight: 36 }}>
              {loadingText}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 12 }}>
              Aguarde enquanto analisamos nosso banco de dados cósmico...
            </p>
          </div>
        )}

        {/* ─── PASSO 5: RESULTADO DO JOGO ─── */}
        {step === 5 && (
          <div className="fade-in">
            
            {/* Mensagem de Erro */}
            {errorMsg && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "var(--red)", marginBottom: 20 }}>{errorMsg}</p>
                <button onClick={handleRestart} className="btn btn-ghost">Tentar Novamente</button>
              </div>
            )}

            {/* Caso não retorne nenhum filme */}
            {!errorMsg && movies.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <HelpCircle size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Nenhum filme atendeu exatamente à sua vibe. Que tal afrouxar os filtros?</p>
                <button onClick={handleRestart} className="btn btn-primary">Começar de Novo</button>
              </div>
            )}

            {/* Sucesso - Renders os Matches */}
            {!errorMsg && superMatch && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                      Veredito do Quiz
                    </span>
                    <h2 style={{ fontSize: "1.625rem", fontWeight: 900, color: "#fff" }}>O Oráculo Decidiu!</h2>
                  </div>

                  <div style={{
                    background: "rgba(82, 192, 122, 0.12)",
                    border: "1px solid rgba(82, 192, 122, 0.25)",
                    borderRadius: 20,
                    padding: "4px 14px",
                    color: "var(--green)",
                    fontWeight: 800,
                    fontSize: "0.8125rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <Flame size={13} fill="currentColor" />
                    <span>{matchScore}% {matchPhrase}</span>
                  </div>
                </div>

                {/* --- FILME PRINCIPAL (SUPER MATCH CARD) --- */}
                <div 
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                    marginBottom: 44
                  }}
                  className="super-match-card"
                >
                  {/* Backdrop Borrado de Fundo */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    height: "170px",
                    backgroundImage: `url(${getTMDBImageUrl(superMatch.backdrop_path, "w780")})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(6px) brightness(0.35)",
                    zIndex: 0,
                    pointerEvents: "none"
                  }} />

                  {/* Gradiente de Fusão */}
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "170px",
                    background: "linear-gradient(to bottom, transparent, var(--surface))",
                    zIndex: 1,
                    pointerEvents: "none"
                  }} />

                  {/* Conteúdo do Filme Principal */}
                  <div 
                    style={{
                      position: "relative",
                      zIndex: 2,
                      padding: "32px",
                      display: "grid",
                      gridTemplateColumns: "var(--recommend-grid, 130px 1fr)",
                      gap: 28,
                      alignItems: "start",
                      paddingTop: "60px"
                    }}
                    className="recommend-card-grid"
                  >
                    {/* Poster */}
                    <div style={{ 
                      position: "relative", 
                      aspectRatio: "2/3", 
                      width: "100%", 
                      borderRadius: "var(--radius-sm)", 
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
                      background: "var(--surface-2)"
                    }}>
                      <img
                        src={getTMDBImageUrl(superMatch.poster_path, "w342")}
                        alt={superMatch.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    {/* Infos do Filme */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {/* Rating + Badge Super Match */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{
                          background: "var(--accent-dim)",
                          color: "var(--accent)",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: 20,
                          letterSpacing: "0.05em",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}>
                          <Award size={10} fill="currentColor" />
                          Super Match
                        </span>

                        {superMatch.vote_average > 0 && (
                          <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                            <Star size={11} fill="currentColor" />
                            {superMatch.vote_average.toFixed(1)}
                          </span>
                        )}

                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          • {superMatch.release_date ? new Date(superMatch.release_date).getFullYear() : "—"}
                        </span>
                      </div>

                      {/* Título */}
                      <h3 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#fff", marginBottom: 12 }}>
                        {superMatch.title}
                      </h3>

                      {/* Sinopse */}
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 24, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {superMatch.overview || "Sinopse não disponível."}
                      </p>

                      {/* Ações Rápidas */}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {/* Assistido (Olhinho) */}
                        <button
                          onClick={() => handleToggleWatched(superMatch.id)}
                          disabled={loadingActionId === `watch-${superMatch.id}`}
                          title={userWatched.includes(superMatch.id) ? "Remover dos assistidos" : "Marcar como assistido"}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 16px",
                            borderRadius: 8,
                            background: userWatched.includes(superMatch.id) ? "var(--green)" : "rgba(255,255,255,0.06)",
                            border: "none",
                            color: userWatched.includes(superMatch.id) ? "#0a0a0f" : "#fff",
                            fontSize: "0.8125rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {loadingActionId === `watch-${superMatch.id}` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Eye size={13} fill={userWatched.includes(superMatch.id) ? "currentColor" : "none"} />
                          )}
                          Assistido
                        </button>

                        {/* Watchlist (Bookmark) */}
                        <button
                          onClick={() => handleToggleWatchlist(superMatch.id)}
                          disabled={loadingActionId === `save-${superMatch.id}`}
                          title={userWatchlist.includes(superMatch.id) ? "Remover da watchlist" : "Adicionar à watchlist"}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 16px",
                            borderRadius: 8,
                            background: userWatchlist.includes(superMatch.id) ? "var(--accent)" : "rgba(255,255,255,0.06)",
                            border: "none",
                            color: userWatchlist.includes(superMatch.id) ? "#0a0a0f" : "#fff",
                            fontSize: "0.8125rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {loadingActionId === `save-${superMatch.id}` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Bookmark size={13} fill={userWatchlist.includes(superMatch.id) ? "currentColor" : "none"} />
                          )}
                          Salvar
                        </button>

                        {/* Detalhes */}
                        <Link
                          href={`/movie/${superMatch.id}`}
                          className="btn btn-ghost"
                          style={{ padding: "6px 14px", height: 33, borderRadius: 8, fontSize: "0.8125rem" }}
                        >
                          <Video size={12} />
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- OUTRAS RECOMENDAÇÕES ALTERNATIVAS --- */}
                {alternatives.length > 0 && (
                  <div style={{ marginBottom: 44 }}>
                    <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <Video size={16} color="var(--accent)" />
                      Outras Opções na Mesma Vibe
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 20 }}>
                      {alternatives.map((movie) => {
                        const isWatched = userWatched.includes(movie.id);
                        const isSaved = userWatchlist.includes(movie.id);
                        return (
                          <div 
                            key={movie.id} 
                            style={{ 
                              background: "var(--surface)", 
                              border: "1px solid var(--border)", 
                              borderRadius: "var(--radius)", 
                              padding: 10,
                              display: "flex",
                              flexDirection: "column",
                              transition: "border-color 0.2s"
                            }}
                            className="alternative-card"
                          >
                            {/* Poster */}
                            <div 
                              style={{ position: "relative", aspectRatio: "2/3", width: "100%", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 10 }}
                              className="alternative-poster-container"
                            >
                              <Link href={`/movie/${movie.id}`} style={{ display: "block", width: "100%", height: "100%" }}>
                                <img
                                  src={getTMDBImageUrl(movie.poster_path, "w185")}
                                  alt={movie.title}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </Link>
                              
                              {/* Hover quick buttons */}
                              <div 
                                style={{
                                  position: "absolute", top: 6, right: 6,
                                  display: "flex", flexDirection: "column", gap: 4,
                                  zIndex: 10
                                }}
                                className="alternative-actions"
                              >
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleToggleWatched(movie.id);
                                  }}
                                  disabled={loadingActionId === `watch-${movie.id}`}
                                  style={{
                                    width: 24, height: 24, borderRadius: "50%",
                                    background: isWatched ? "var(--green)" : "rgba(0,0,0,0.65)",
                                    border: "none", color: isWatched ? "#0a0a0f" : "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                                    transition: "background 0.2s, transform 0.1s"
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                  <Eye size={11} fill={isWatched ? "currentColor" : "none"} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleToggleWatchlist(movie.id);
                                  }}
                                  disabled={loadingActionId === `save-${movie.id}`}
                                  style={{
                                    width: 24, height: 24, borderRadius: "50%",
                                    background: isSaved ? "var(--accent)" : "rgba(0,0,0,0.65)",
                                    border: "none", color: isSaved ? "#0a0a0f" : "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                                    transition: "background 0.2s, transform 0.1s"
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                  <Bookmark size={11} fill={isSaved ? "currentColor" : "none"} />
                                </button>
                              </div>
                            </div>

                            {/* Info */}
                            <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                              <Link href={`/movie/${movie.id}`} style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }} title={movie.title}>
                                {movie.title}
                              </Link>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                  {movie.release_date ? new Date(movie.release_date).getFullYear() : "—"}
                                </span>
                                {movie.vote_average > 0 && (
                                  <span style={{ fontSize: "0.7rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: 2 }}>
                                    <Star size={10} fill="currentColor" />
                                    {movie.vote_average.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* --- CONTROLES DE RETORNO / RE-ROLL --- */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                  borderTop: "1px solid var(--border)",
                  paddingTop: 28
                }}>
                  <button
                    onClick={handleRestart}
                    className="btn btn-ghost"
                    style={{ padding: "10px 20px" }}
                  >
                    <RotateCcw size={14} />
                    Responder de Novo
                  </button>

                  <button
                    onClick={handleReroll}
                    className="btn btn-primary"
                    style={{ padding: "10px 24px" }}
                  >
                    <Dice5 size={14} />
                    Girar a Roleta (Trocar Filmes)
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* --- ESTILOS AUXILIARES --- */}
      <style>{`
        .quiz-card-btn:hover {
          border-color: var(--accent) !important;
          background: var(--surface-2) !important;
          transform: translateX(4px);
        }
        .alternative-card:hover {
          border-color: var(--border-hover) !important;
        }
        .alternative-actions {
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          pointer-events: none;
        }
        .alternative-poster-container:hover .alternative-actions {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .recommend-card-grid {
            grid-template-columns: 1fr !important;
            padding: 20px !important;
          }
        }
        @media (min-width: 641px) {
          :root {
            --recommend-grid: 130px 1fr;
          }
        }
      `}</style>
    </div>
  );
}
