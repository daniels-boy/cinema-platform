import { prisma } from "@/lib/prisma";
import ReviewsTable from "@/components/admin/ReviewsTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Moderação de Reviews | Admin" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const serialized = reviews.map((r: any) => ({
    id: r.id,
    tmdbId: r.tmdbId,
    rating: r.rating,
    content: r.content,
    isSpoiler: r.isSpoiler,
    tags: r.tags,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
  }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff", marginBottom: 4 }}>Moderação de Reviews</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} mais recentes
        </p>
      </div>
      <ReviewsTable reviews={serialized} />
    </div>
  );
}
