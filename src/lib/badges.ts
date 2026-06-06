// ─── Sistema de Conquistas (Badges) do CineVerse ──────────────────────────────

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Dica de progresso para badges ainda bloqueadas */
  hint: string;
  /** Quantos filmes/reviews são necessários */
  threshold: number;
  /** Categoria da badge para agrupamento visual */
  category: "genre" | "director" | "era" | "milestone";
}

/** Metadados de um filme relevantes para o cálculo de badges */
export interface MovieMeta {
  tmdbId: number;
  genreIds: number[];
  directorId?: number;
  releaseYear?: number;
}

// ─── IDs TMDB de referência ────────────────────────────────────────────────────
const GENRE = {
  ACTION: 28,
  COMEDY: 35,
  HORROR: 27,
  ROMANCE: 10749,
  SCIFI: 878,
  THRILLER: 53,
  ANIMATION: 16,
  DOCUMENTARY: 99,
  DRAMA: 18,
} as const;

// ID do diretor no TMDB (person_id)
const DIRECTOR = {
  TARANTINO: 138,
  NOLAN: 525,
  KUBRICK: 240,
} as const;

// ─── Definição de todas as badges disponíveis ──────────────────────────────────
export const ALL_BADGES: Badge[] = [
  // ── Gênero: Terror ──
  {
    id: "slasher_survivor",
    label: "Sobrevivente de Slasher",
    emoji: "🪓",
    description: "Encarou o terror de frente e ainda sobreviveu para contar a história.",
    hint: "Avalie 5 filmes de Terror",
    threshold: 5,
    category: "genre",
  },
  // ── Gênero: Romance ──
  {
    id: "romanticao",
    label: "Romanticão(a) Assumido(a)",
    emoji: "💘",
    description: "Abraçou o drama romântico sem vergonha. Cafuné e créditos finais.",
    hint: "Avalie 5 filmes de Romance",
    threshold: 5,
    category: "genre",
  },
  // ── Gênero: Ação ──
  {
    id: "action_junkie",
    label: "Fodão de Ação",
    emoji: "🍿",
    description: "Vive para explosões, perseguições e heróis impossíveis. Sem arrependimento.",
    hint: "Avalie 5 filmes de Ação",
    threshold: 5,
    category: "genre",
  },
  // ── Gênero: Comédia ──
  {
    id: "laugh_master",
    label: "Mestre do Riso",
    emoji: "🤡",
    description: "Especialista em gargalhadas e em esquecimento temporário dos boletos.",
    hint: "Avalie 5 filmes de Comédia",
    threshold: 5,
    category: "genre",
  },
  // ── Gênero: Sci-Fi ──
  {
    id: "couch_astronaut",
    label: "Astronauta de Sofá",
    emoji: "🚀",
    description: "Explorou galáxias, universos paralelos e plot twists alienígenas sem sair de casa.",
    hint: "Avalie 5 filmes de Ficção Científica",
    threshold: 5,
    category: "genre",
  },
  // ── Gênero: Animação ──
  {
    id: "forever_kid",
    label: "Criança Grande",
    emoji: "🧸",
    description: "Nunca cresceu de verdade, e isso é um elogio. Pixar chora junto.",
    hint: "Avalie 5 filmes de Animação",
    threshold: 5,
    category: "genre",
  },
  // ── Diretor: Tarantino ──
  {
    id: "tarantino_fan",
    label: "Banho de Sangue",
    emoji: "🩸",
    description: "Fanático(a) confesso(a) pelo mestre dos diálogos afiados e da violência estilizada.",
    hint: "Avalie 3 filmes de Quentin Tarantino",
    threshold: 3,
    category: "director",
  },
  // ── Diretor: Nolan ──
  {
    id: "nolan_fan",
    label: "Fã do Confuso",
    emoji: "🌀",
    description: "Assistiu Nolan e ainda tentou explicar o enredo pro pessoal. Respeitável.",
    hint: "Avalie 3 filmes de Christopher Nolan",
    threshold: 3,
    category: "director",
  },
  // ── Era: Anos 80 ──
  {
    id: "neon_nostalgia",
    label: "Nostalgia Neon",
    emoji: "📼",
    description: "Maratonou os anos 80 de fita VHS em fita VHS. Mito da locadora.",
    hint: "Avalie 5 filmes dos anos 80 (1980–1989)",
    threshold: 5,
    category: "era",
  },
  // ── Era: Clássicos ──
  {
    id: "classic_buff",
    label: "Maratonista Clássico",
    emoji: "🎞️",
    description: "Desbravou o cinema antes de 1980. Prefere grão de película ao CGI.",
    hint: "Avalie 5 filmes de antes de 1980",
    threshold: 5,
    category: "era",
  },
  // ── Milestone: 10 reviews ──
  {
    id: "reviewer_10",
    label: "Crítico de Plantão",
    emoji: "✍️",
    description: "Dez avaliações registradas. Sua opinião está sendo levada a sério.",
    hint: "Escreva 10 avaliações",
    threshold: 10,
    category: "milestone",
  },
  // ── Milestone: 25 reviews ──
  {
    id: "reviewer_25",
    label: "Cinéfilo VIP",
    emoji: "🏆",
    description: "25 avaliações! Você não perdoa um lançamento. A comunidade te respeita.",
    hint: "Escreva 25 avaliações",
    threshold: 25,
    category: "milestone",
  },
  // ── Milestone: 50 reviews ──
  {
    id: "reviewer_50",
    label: "Viciado em Tela",
    emoji: "🎬",
    description: "50 avaliações. Isso não é hobby, isso é estilo de vida. Lenda.",
    hint: "Escreva 50 avaliações",
    threshold: 50,
    category: "milestone",
  },
];

// ─── Contadores por badge ──────────────────────────────────────────────────────

function countGenre(movies: MovieMeta[], genreId: number): number {
  return movies.filter((m) => m.genreIds.includes(genreId)).length;
}

function countDirector(movies: MovieMeta[], directorId: number): number {
  return movies.filter((m) => m.directorId === directorId).length;
}

function countDecade(movies: MovieMeta[], startYear: number, endYear: number): number {
  return movies.filter(
    (m) => m.releaseYear !== undefined && m.releaseYear >= startYear && m.releaseYear <= endYear
  ).length;
}

/** Retorna o progresso (quantos filmes o usuário já tem para cada badge) */
export function getBadgeProgress(
  badgeId: string,
  movies: MovieMeta[],
  totalReviews: number
): number {
  switch (badgeId) {
    case "slasher_survivor":
      return countGenre(movies, GENRE.HORROR);
    case "romanticao":
      return countGenre(movies, GENRE.ROMANCE);
    case "action_junkie":
      return countGenre(movies, GENRE.ACTION);
    case "laugh_master":
      return countGenre(movies, GENRE.COMEDY);
    case "couch_astronaut":
      return countGenre(movies, GENRE.SCIFI);
    case "forever_kid":
      return countGenre(movies, GENRE.ANIMATION);
    case "tarantino_fan":
      return countDirector(movies, DIRECTOR.TARANTINO);
    case "nolan_fan":
      return countDirector(movies, DIRECTOR.NOLAN);
    case "neon_nostalgia":
      return countDecade(movies, 1980, 1989);
    case "classic_buff":
      return countDecade(movies, 0, 1979);
    case "reviewer_10":
    case "reviewer_25":
    case "reviewer_50":
      return totalReviews;
    default:
      return 0;
  }
}

export interface BadgeResult {
  badge: Badge;
  unlocked: boolean;
  progress: number;
}

/**
 * Computa todas as badges para um usuário com base nos metadados dos filmes avaliados.
 * @param movies - Metadados de cada filme que o usuário avaliou
 * @returns Array com todas as badges e o status de desbloqueio
 */
export function computeUserBadges(movies: MovieMeta[]): BadgeResult[] {
  const totalReviews = movies.length;

  return ALL_BADGES.map((badge) => {
    const progress = getBadgeProgress(badge.id, movies, totalReviews);
    return {
      badge,
      unlocked: progress >= badge.threshold,
      progress,
    };
  });
}

/**
 * Retorna apenas as badges desbloqueadas
 */
export function getUnlockedBadges(movies: MovieMeta[]): BadgeResult[] {
  return computeUserBadges(movies).filter((r) => r.unlocked);
}
