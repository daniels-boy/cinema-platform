import { prisma } from "@/lib/prisma";
import { getMovieDetails } from "@/lib/tmdb";
import StatsCards from "@/components/admin/StatsCards";
import UsersChart from "@/components/admin/UsersChart";
import ReviewsChart from "@/components/admin/ReviewsChart";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Admin CineVerse" };

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

export default async function AdminDashboardPage() {
  const days = getLast7Days();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = days[0];

  const [
    totalUsers,
    totalReviews,
    reviewsToday,
    usersPerDay,
    reviewsPerDay,
    topReviewedRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.review.count(),
    prisma.review.count({ where: { createdAt: { gte: todayStart } } }),
    // Novos usuários por dia (últimos 7 dias)
    Promise.all(
      days.map(async (day) => {
        const next = new Date(day); next.setDate(next.getDate() + 1);
        const count = await prisma.user.count({ where: { createdAt: { gte: day, lt: next } } });
        return { date: day.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }), count };
      })
    ),
    // Reviews por dia (últimos 7 dias)
    Promise.all(
      days.map(async (day) => {
        const next = new Date(day); next.setDate(next.getDate() + 1);
        const count = await prisma.review.count({ where: { createdAt: { gte: day, lt: next } } });
        return { date: day.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }), count };
      })
    ),
    // Filme mais avaliado da semana
    prisma.review.groupBy({
      by: ["tmdbId"],
      where: { createdAt: { gte: weekStart } },
      _count: { tmdbId: true },
      orderBy: { _count: { tmdbId: "desc" } },
      take: 1,
    }),
  ]);

  // Buscar detalhes do filme mais avaliado
  let topMovie: { title: string; poster: string | null; count: number } | null = null;
  if (topReviewedRaw.length > 0) {
    try {
      const m = await getMovieDetails(topReviewedRaw[0].tmdbId);
      topMovie = { title: m.title, poster: m.poster_path, count: topReviewedRaw[0]._count.tmdbId };
    } catch { /* sem detalhes */ }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff", marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
          Visão geral da plataforma — últimos 7 dias
        </p>
      </div>

      {/* Cards de stats */}
      <StatsCards
        totalUsers={totalUsers}
        totalReviews={totalReviews}
        reviewsToday={reviewsToday}
        topMovie={topMovie}
      />

      {/* Gráficos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 28 }}>
        <UsersChart data={usersPerDay} />
        <ReviewsChart data={reviewsPerDay} />
      </div>
    </div>
  );
}
