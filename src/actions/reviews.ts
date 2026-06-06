"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getMovieDetails } from "@/lib/tmdb";
import { computeUserBadges, type MovieMeta, type BadgeResult } from "@/lib/badges";

const reviewSchema = z.object({
  tmdbId: z.number().int(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(3, "O comentário deve ter pelo menos 3 caracteres"),
  tags: z.array(z.string()).default([]),
});

export async function submitReview(formData: {
  tmdbId: number;
  rating: number;
  content: string;
  tags?: string[];
}) {
  try {
    // Verificar sessão do usuário
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Você precisa estar conectado para avaliar um filme." };
    }

    // Validar dados
    const parsed = reviewSchema.safeParse(formData);
    if (!parsed.success) {
      const errorMsg = parsed.error.flatten().fieldErrors.content?.[0] || "Dados inválidos.";
      return { error: errorMsg };
    }

    const { tmdbId, rating, content, tags } = parsed.data;
    const userId = session.user.id;

    // ── Badges ANTES da nova review ──────────────────────────────────────────
    const previousReviews = await prisma.review.findMany({
      where: { userId },
      select: { tmdbId: true },
    });

    // Buscar metadados dos filmes já avaliados
    const previousMetas = await buildMovieMetas(previousReviews.map((r: { tmdbId: number }) => r.tmdbId));
    const badgesBefore = computeUserBadges(previousMetas)
      .filter((b) => b.unlocked)
      .map((b) => b.badge.id);

    // ── Salvar ou atualizar review ──────────────────────────────────────────
    await prisma.review.upsert({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
      update: {
        rating,
        content,
        tags,
        updatedAt: new Date(),
      },
      create: {
        userId,
        tmdbId,
        rating,
        content,
        tags,
      },
    });

    // ── Badges DEPOIS da nova review ─────────────────────────────────────────
    // Incluir o filme atual nas metas
    const currentMeta = await buildSingleMovieMeta(tmdbId);
    const allMetas = currentMeta
      ? [...previousMetas.filter((m) => m.tmdbId !== tmdbId), currentMeta]
      : previousMetas;

    const badgesAfter = computeUserBadges(allMetas);
    const newBadges: BadgeResult[] = badgesAfter.filter(
      (b) => b.unlocked && !badgesBefore.includes(b.badge.id)
    );

    // Revalidar a página do filme para exibir a nova avaliação
    revalidatePath(`/movie/${tmdbId}`);
    revalidatePath("/profile");

    return { success: true, newBadges };
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
    return { error: "Ocorreu um erro interno ao salvar sua avaliação." };
  }
}

// ─── Helpers para buscar metadados de filmes no TMDB ─────────────────────────

async function buildSingleMovieMeta(tmdbId: number): Promise<MovieMeta | null> {
  try {
    const movie = await getMovieDetails(tmdbId);
    const director = movie.credits?.crew?.find(
      (c: { job: string; id: number }) => c.job === "Director"
    );
    return {
      tmdbId: movie.id,
      genreIds: (movie.genres || []).map((g: { id: number }) => g.id),
      directorId: director?.id,
      releaseYear: movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : undefined,
    };
  } catch {
    return null;
  }
}

async function buildMovieMetas(tmdbIds: number[]): Promise<MovieMeta[]> {
  const results = await Promise.allSettled(
    tmdbIds.map((id) => buildSingleMovieMeta(id))
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<MovieMeta> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value);
}
