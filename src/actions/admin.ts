"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getMovieDetails, searchMovies } from "@/lib/tmdb";

// ─── Guard: só admins podem executar estas actions ────────────────────────────
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Acesso negado. Apenas administradores.");
  }
  return session.user.id;
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export async function deleteReview(reviewId: string) {
  try {
    await requireAdmin();
    await prisma.review.delete({ where: { id: reviewId } });
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function toggleSpoiler(reviewId: string, isSpoiler: boolean) {
  try {
    await requireAdmin();
    await prisma.review.update({
      where: { id: reviewId },
      data: { isSpoiler: !isSpoiler },
    });
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ─── USUÁRIOS ─────────────────────────────────────────────────────────────────

export async function banUser(userId: string) {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { banned: true, suspendedUntil: null },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function suspendUser(userId: string, days: number) {
  try {
    await requireAdmin();
    const until = new Date();
    until.setDate(until.getDate() + days);
    await prisma.user.update({
      where: { id: userId },
      data: { suspendedUntil: until, banned: false },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function unbanUser(userId: string) {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { banned: false, suspendedUntil: null },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ─── CURADORIA ────────────────────────────────────────────────────────────────

export async function setFeaturedBanner(tmdbId: number) {
  try {
    await requireAdmin();
    const movie = await getMovieDetails(tmdbId);
    // Apaga o banner anterior e cria novo
    await prisma.featuredBanner.deleteMany();
    await prisma.featuredBanner.create({
      data: {
        tmdbId: movie.id,
        title: movie.title,
        subtitle: movie.overview?.slice(0, 160) ?? "",
      },
    });
    revalidatePath("/");
    revalidatePath("/admin/curation");
    return { success: true, movie };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function removeFeaturedBanner() {
  try {
    await requireAdmin();
    await prisma.featuredBanner.deleteMany();
    revalidatePath("/");
    revalidatePath("/admin/curation");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createCuratedCollection(data: {
  title: string;
  description?: string;
  emoji?: string;
  tmdbIds: number[];
}) {
  try {
    await requireAdmin();
    await prisma.curatedCollection.create({
      data: {
        title: data.title,
        description: data.description ?? "",
        emoji: data.emoji ?? "🎬",
        tmdbIds: data.tmdbIds,
        active: true,
      },
    });
    revalidatePath("/");
    revalidatePath("/admin/curation");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function toggleCollection(id: string, active: boolean) {
  try {
    await requireAdmin();
    await prisma.curatedCollection.update({
      where: { id },
      data: { active: !active },
    });
    revalidatePath("/");
    revalidatePath("/admin/curation");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteCollection(id: string) {
  try {
    await requireAdmin();
    await prisma.curatedCollection.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/curation");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function searchMoviesAction(query: string) {
  try {
    const data = await searchMovies(query);
    return { success: true, results: data.results || [] };
  } catch (e: any) {
    return { error: e.message };
  }
}
