import { prisma } from "@/lib/prisma";
import UsersTable from "@/components/admin/UsersTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Usuários | Admin" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      suspendedUntil: true,
      createdAt: true,
      image: true,
      _count: { select: { reviews: true, watched: true } },
    },
  });

  const serialized = users.map((u: any) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    suspendedUntil: u.suspendedUntil ? u.suspendedUntil.toISOString() : null,
  }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff", marginBottom: 4 }}>Usuários</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
          {users.length} usuário{users.length !== 1 ? "s" : ""} cadastrados
        </p>
      </div>
      <UsersTable users={serialized} />
    </div>
  );
}
