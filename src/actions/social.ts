"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Segue ou deixa de seguir outro usuário.
 */
export async function toggleFollowUser(targetUserId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Você precisa estar conectado para seguir outros usuários." };
    }

    const followerId = session.user.id;

    if (followerId === targetUserId) {
      return { error: "Você não pode seguir a si mesmo." };
    }

    // Verificar se o usuário alvo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { error: "Usuário não encontrado." };
    }

    // Verificar se já segue
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUserId,
        },
      },
    });

    let following = false;

    if (existing) {
      // Deixar de seguir
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: targetUserId,
          },
        },
      });
      following = false;
    } else {
      // Seguir
      await prisma.follow.create({
        data: {
          followerId,
          followingId: targetUserId,
        },
      });
      following = true;
    }

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath("/profile");
    revalidatePath("/search");

    return { success: true, following };
  } catch (e: any) {
    console.error("Erro ao seguir/deixar de seguir usuário:", e);
    return { error: "Erro interno ao processar a ação." };
  }
}

/**
 * Curte ou descurte uma crítica.
 */
export async function toggleLikeReview(reviewId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Você precisa estar conectado para curtir avaliações." };
    }

    const userId = session.user.id;

    // Verificar se a crítica existe
    const reviewExists = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!reviewExists) {
      return { error: "Avaliação não encontrada." };
    }

    // Verificar se já curtiu
    const existing = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    let liked = false;

    if (existing) {
      // Descurtir
      await prisma.reviewLike.delete({
        where: {
          id: existing.id,
        },
      });
      liked = false;
    } else {
      // Curtir
      await prisma.reviewLike.create({
        data: {
          userId,
          reviewId,
        },
      });
      liked = true;
    }

    // Buscar contagem atualizada
    const likesCount = await prisma.reviewLike.count({
      where: { reviewId },
    });

    // Revalidar a página do filme e o perfil
    revalidatePath(`/movie/${reviewExists.tmdbId}`);
    revalidatePath(`/profile/${reviewExists.userId}`);

    return { success: true, liked, likesCount };
  } catch (e: any) {
    console.error("Erro ao curtir/descurtir crítica:", e);
    return { error: "Erro interno ao processar a ação." };
  }
}

/**
 * Busca a lista de seguidores de um usuário.
 */
export async function getUserFollowers(userId: string) {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { 
      success: true, 
      users: followers.map(f => ({
        id: f.follower.id,
        name: f.follower.name,
        image: f.follower.image,
        email: f.follower.email,
      }))
    };
  } catch (e: any) {
    console.error("Erro ao buscar seguidores:", e);
    return { error: "Erro interno ao buscar seguidores." };
  }
}

/**
 * Busca a lista de usuários que um determinado usuário segue.
 */
export async function getUserFollowing(userId: string) {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { 
      success: true, 
      users: following.map(f => ({
        id: f.following.id,
        name: f.following.name,
        image: f.following.image,
        email: f.following.email,
      }))
    };
  } catch (e: any) {
    console.error("Erro ao buscar usuários seguidos:", e);
    return { error: "Erro interno ao buscar usuários seguidos." };
  }
}

/**
 * Adiciona um comentário a uma review.
 */
export async function addReviewComment(reviewId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Você precisa estar conectado para comentar." };
    }

    const userId = session.user.id;
    const cleanContent = content.trim();

    if (!cleanContent) {
      return { error: "O comentário não pode ser vazio." };
    }

    if (cleanContent.length > 500) {
      return { error: "O comentário deve ter no máximo 500 caracteres." };
    }

    // Verificar se a crítica existe
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { tmdbId: true, userId: true },
    });

    if (!review) {
      return { error: "Avaliação não encontrada." };
    }

    const newComment = await prisma.reviewComment.create({
      data: {
        reviewId,
        userId,
        content: cleanContent,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    // Revalidar a página do filme e do feed/reviews
    revalidatePath(`/movie/${review.tmdbId}`);
    revalidatePath("/reviews");
    revalidatePath(`/profile/${review.userId}`);

    return { success: true, comment: newComment };
  } catch (e: any) {
    console.error("Erro ao adicionar comentário:", e);
    return { error: "Erro interno ao salvar o comentário." };
  }
}

/**
 * Remove um comentário.
 */
export async function deleteReviewComment(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Você precisa estar conectado para excluir comentários." };
    }

    const userId = session.user.id;

    // Buscar o comentário para verificar o proprietário ou se é admin
    const comment = await prisma.reviewComment.findUnique({
      where: { id: commentId },
      include: {
        review: {
          select: {
            tmdbId: true,
            userId: true,
          },
        },
      },
    });

    if (!comment) {
      return { error: "Comentário não encontrado." };
    }

    // Permitir se for o autor do comentário OU se for admin
    const isAuthor = comment.userId === userId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return { error: "Você não tem permissão para excluir este comentário." };
    }

    await prisma.reviewComment.delete({
      where: { id: commentId },
    });

    // Revalidar rotas relevantes
    revalidatePath(`/movie/${comment.review.tmdbId}`);
    revalidatePath("/reviews");
    revalidatePath(`/profile/${comment.review.userId}`);

    return { success: true };
  } catch (e: any) {
    console.error("Erro ao excluir comentário:", e);
    return { error: "Erro interno ao excluir o comentário." };
  }
}

/**
 * Busca os comentários de uma determinada review.
 */
export async function getReviewComments(reviewId: string) {
  try {
    const comments = await prisma.reviewComment.findMany({
      where: { reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, comments };
  } catch (e: any) {
    console.error("Erro ao buscar comentários:", e);
    return { error: "Erro interno ao buscar comentários." };
  }
}
