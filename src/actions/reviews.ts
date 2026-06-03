"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

    // Salvar ou atualizar review
    await prisma.review.upsert({
      where: {
        userId_tmdbId: {
          userId: session.user.id,
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
        userId: session.user.id,
        tmdbId,
        rating,
        content,
        tags,
      },
    });

    // Revalidar a página do filme para exibir a nova avaliação
    revalidatePath(`/movie/${tmdbId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
    return { error: "Ocorreu um erro interno ao salvar sua avaliação." };
  }
}
