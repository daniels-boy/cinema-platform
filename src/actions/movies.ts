"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { searchMovies, discoverMovies } from "@/lib/tmdb";

export async function toggleWatched(tmdbId: number) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Você precisa estar conectado para marcar como assistido." };
    }

    const userId = session.user.id;

    // Verificar se já está marcado como assistido
    const existing = await prisma.watched.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    let watched = false;

    if (existing) {
      // Remover dos assistidos
      await prisma.watched.delete({
        where: {
          id: existing.id,
        },
      });
      watched = false;
    } else {
      // Adicionar aos assistidos
      await prisma.watched.create({
        data: {
          userId,
          tmdbId,
        },
      });
      watched = true;
    }

    // Revalidar a página do filme e o perfil
    revalidatePath(`/movie/${tmdbId}`);
    revalidatePath("/profile");

    return { success: true, watched };
  } catch (error) {
    console.error("Erro ao gerenciar filmes assistidos:", error);
    return { error: "Erro interno ao processar a ação." };
  }
}

export async function toggleWatchlist(tmdbId: number) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Você precisa estar conectado para salvar na sua lista." };
    }

    const userId = session.user.id;

    // Verificar se já está na lista
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    let saved = false;

    if (existing) {
      // Remover da lista
      await prisma.watchlist.delete({
        where: {
          id: existing.id,
        },
      });
      saved = false;
    } else {
      // Adicionar à lista
      await prisma.watchlist.create({
        data: {
          userId,
          tmdbId,
        },
      });
      saved = true;
    }

    // Revalidar a página do filme e o perfil
    revalidatePath(`/movie/${tmdbId}`);
    revalidatePath("/profile");

    return { success: true, saved };
  } catch (error) {
    console.error("Erro ao gerenciar watchlist:", error);
    return { error: "Erro interno ao processar a ação." };
  }
}

export async function setFeaturedFavorite(position: number, tmdbId: number | null) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Você precisa estar conectado para editar seus favoritos destacados." };
    }

    if (position < 1 || position > 5) {
      return { error: "Posição inválida. Escolha entre 1 e 5." };
    }

    const userId = session.user.id;

    if (tmdbId === null) {
      // Remover favorito dessa posição
      try {
        await prisma.featuredFavorite.delete({
          where: {
            userId_position: {
              userId,
              position,
            },
          },
        });
      } catch (err) {
        // Se já não existia, tudo bem
      }
      revalidatePath("/profile");
      return { success: true, removed: true };
    }

    // Verificar se o filme já está em OUTRA posição para este mesmo usuário
    const duplicate = await prisma.featuredFavorite.findFirst({
      where: {
        userId,
        tmdbId,
        NOT: {
          position,
        },
      },
    });

    if (duplicate) {
      return { error: "Este filme já está nos seus favoritos destacados." };
    }

    // Upsert nos favoritos destacados
    await prisma.featuredFavorite.upsert({
      where: {
        userId_position: {
          userId,
          position,
        },
      },
      update: {
        tmdbId,
      },
      create: {
        userId,
        position,
        tmdbId,
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Erro ao definir favorito destacado:", error);
    return { error: "Erro interno ao salvar o favorito destacado." };
  }
}

export async function searchMoviesAction(query: string) {
  try {
    const data = await searchMovies(query);
    return { results: data.results?.slice(0, 5) || [] };
  } catch (err) {
    console.error("Erro ao pesquisar filmes no server action:", err);
    return { error: "Erro ao pesquisar filmes." };
  }
}

export async function getGamifiedRecommendationsAction(params: {
  genreId?: number;
  era?: "recent" | "classic" | "any";
}) {
  try {
    const { genreId, era } = params;
    
    // Determinar filtros de ano com base na era selecionada
    let year: number | undefined = undefined;
    if (era === "recent") {
      // Ano aleatório entre 2018 e 2026 para diversificar as recomendações
      year = Math.floor(Math.random() * (2026 - 2018 + 1)) + 2018;
    } else if (era === "classic") {
      // Ano aleatório entre 1980 e 2010
      year = Math.floor(Math.random() * (2010 - 1980 + 1)) + 1980;
    }

    // Seleciona uma página aleatória entre 1 e 3 para variar os resultados populares
    const randomPage = Math.floor(Math.random() * 3) + 1;
    const sortBy = "popularity.desc";

    const data = await discoverMovies({
      genreId,
      year,
      page: randomPage,
      sortBy,
      minRating: 6.0, // Apenas filmes com avaliação razoável
    });

    // Filtrar filmes que têm pôster, sinopse e imagem de fundo
    const filtered = (data.results || []).filter(
      (m) => m.poster_path && m.overview && m.backdrop_path
    );

    // Embaralhar os resultados locais
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    return { results: shuffled.slice(0, 8) };
  } catch (err) {
    console.error("Erro ao obter recomendações gamificadas:", err);
    return { error: "Erro ao buscar recomendações. Tente novamente." };
  }
}

export async function getUserCollectionsAction() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { watched: [], watchlist: [] };
    }
    const [watched, watchlist] = await Promise.all([
      prisma.watched.findMany({
        where: { userId: session.user.id },
        select: { tmdbId: true },
      }),
      prisma.watchlist.findMany({
        where: { userId: session.user.id },
        select: { tmdbId: true },
      }),
    ]);
    return {
      watched: watched.map((w) => w.tmdbId),
      watchlist: watchlist.map((w) => w.tmdbId),
    };
  } catch (err) {
    console.error("Erro ao carregar coleções do usuário:", err);
    return { error: "Erro ao carregar dados do usuário." };
  }
}
