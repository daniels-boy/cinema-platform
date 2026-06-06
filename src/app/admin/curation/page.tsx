import { prisma } from "@/lib/prisma";
import CurationPanel from "@/components/admin/CurationPanel";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Curadoria | Admin" };

export default async function AdminCurationPage() {
  const [banner, collections] = await Promise.all([
    prisma.featuredBanner.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.curatedCollection.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff", marginBottom: 4 }}>Curadoria da Homepage</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
          Controle o que aparece em destaque na página inicial
        </p>
      </div>
      <CurationPanel
        currentBanner={banner ? { id: banner.id, tmdbId: banner.tmdbId, title: banner.title, subtitle: banner.subtitle ?? "" } : null}
        collections={collections.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description ?? "",
          emoji: c.emoji,
          tmdbIds: c.tmdbIds,
          active: c.active,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
