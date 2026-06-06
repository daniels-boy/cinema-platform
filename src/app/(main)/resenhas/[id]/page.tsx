import { notFound } from "next/navigation";
import { getEssayById } from "@/actions/essays";
import { getMovieDetails, getTMDBImageUrl } from "@/lib/tmdb";
import { auth } from "@/lib/auth";
import EssayReader from "@/components/reviews/EssayReader";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await getEssayById(id);
    if (!res.essay) {
      return {
        title: "Resenha Não Encontrada | CineVerse",
      };
    }
    return {
      title: `${res.essay.title} | CineVerse`,
      description: `Leia o ensaio completo sobre o filme "${res.essay.movieTitle}" escrito por ${res.essay.user.name || res.essay.user.email.split("@")[0]} no CineVerse.`,
    };
  } catch {
    return {
      title: "Resenha Editorial | CineVerse",
    };
  }
}

export default async function EssayDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  // Buscar artigo por ID
  const res = await getEssayById(id);
  if (res.error || !res.essay) {
    notFound();
  }

  const essay = res.essay;

  // Carregar backdrop do filme associado
  let backdropUrl: string | null = null;
  try {
    const movie = await getMovieDetails(essay.tmdbId);
    if (movie.backdrop_path) {
      backdropUrl = getTMDBImageUrl(movie.backdrop_path, "original");
    }
  } catch (err) {
    console.error("Erro ao carregar backdrop do filme:", err);
  }

  return (
    <EssayReader
      essay={essay as any}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
      backdropUrl={backdropUrl}
    />
  );
}
