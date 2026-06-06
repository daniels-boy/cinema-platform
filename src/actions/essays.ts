"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateEssayInput {
  title: string;
  content: string;
  tmdbId: number;
  movieTitle: string;
  moviePoster: string | null;
  isSpoiler?: boolean;
}

/**
 * Cria uma nova Resenha Longa (Artigo/Newsletter).
 */
export async function createEssay(data: CreateEssayInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Você precisa estar conectado para publicar resenhas." };
    }

    const userId = session.user.id;
    const title = data.title.trim();
    const content = data.content.trim();

    if (!title) {
      return { error: "O título não pode ser vazio." };
    }

    if (title.length > 150) {
      return { error: "O título deve ter no máximo 150 caracteres." };
    }

    if (!content || content.length < 10) {
      return { error: "O conteúdo da resenha deve ter no mínimo 10 caracteres." };
    }

    const essay = await prisma.essay.create({
      data: {
        title,
        content,
        tmdbId: data.tmdbId,
        movieTitle: data.movieTitle,
        moviePoster: data.moviePoster,
        isSpoiler: data.isSpoiler ?? false,
        userId,
      },
    });

    revalidatePath("/resenhas");
    revalidatePath(`/profile/${userId}`);
    revalidatePath("/profile");

    return { success: true, essayId: essay.id };
  } catch (e: any) {
    console.error("Erro ao criar resenha:", e);
    return { error: "Erro interno ao publicar resenha. Tente novamente." };
  }
}

/**
 * Exclui uma Resenha Longa.
 */
export async function deleteEssay(essayId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Você precisa estar conectado para excluir resenhas." };
    }

    const userId = session.user.id;

    // Buscar a resenha para validar o proprietário ou se é admin
    const essay = await prisma.essay.findUnique({
      where: { id: essayId },
      select: { userId: true },
    });

    if (!essay) {
      return { error: "Resenha não encontrada." };
    }

    const isOwner = essay.userId === userId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { error: "Você não tem permissão para excluir esta resenha." };
    }

    await prisma.essay.delete({
      where: { id: essayId },
    });

    revalidatePath("/resenhas");
    revalidatePath(`/profile/${essay.userId}`);
    revalidatePath("/profile");

    return { success: true };
  } catch (e: any) {
    console.error("Erro ao deletar resenha:", e);
    return { error: "Erro interno ao excluir resenha." };
  }
}

/**
 * Busca todas as Resenhas Longas publicadas por ordem cronológica reversa.
 */
export async function getEssays() {
  try {
    const essays = await prisma.essay.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, essays };
  } catch (e: any) {
    console.error("Erro ao buscar resenhas:", e);
    return { error: "Erro interno ao carregar resenhas." };
  }
}

/**
 * Busca uma Resenha Longa pelo seu ID.
 */
export async function getEssayById(essayId: string) {
  try {
    const essay = await prisma.essay.findUnique({
      where: { id: essayId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!essay) {
      return { error: "Resenha não encontrada." };
    }

    return { success: true, essay };
  } catch (e: any) {
    console.error("Erro ao buscar resenha por ID:", e);
    return { error: "Erro interno ao buscar resenha." };
  }
}

/**
 * Busca todas as Resenhas Longas de um determinado usuário.
 */
export async function getUserEssays(userId: string) {
  try {
    const essays = await prisma.essay.findMany({
      where: { userId },
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, essays };
  } catch (e: any) {
    console.error("Erro ao buscar resenhas do usuário:", e);
    return { error: "Erro interno ao buscar resenhas do usuário." };
  }
}

/**
 * Curte ou descurte uma Resenha Longa.
 */
export async function toggleLikeEssay(essayId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Você precisa estar conectado para curtir resenhas." };
    }

    const userId = session.user.id;

    // Verificar se a resenha existe
    const essayExists = await prisma.essay.findUnique({
      where: { id: essayId },
    });

    if (!essayExists) {
      return { error: "Resenha não encontrada." };
    }

    // Verificar se já curtiu
    const existing = await prisma.essayLike.findUnique({
      where: {
        userId_essayId: {
          userId,
          essayId,
        },
      },
    });

    let liked = false;

    if (existing) {
      // Descurtir
      await prisma.essayLike.delete({
        where: { id: existing.id },
      });
      liked = false;
    } else {
      // Curtir
      await prisma.essayLike.create({
        data: {
          userId,
          essayId,
        },
      });
      liked = true;
    }

    revalidatePath("/resenhas");
    revalidatePath(`/resenhas/${essayId}`);

    return { success: true, liked };
  } catch (e: any) {
    console.error("Erro ao curtir resenha:", e);
    return { error: "Erro interno ao curtir resenha." };
  }
}
