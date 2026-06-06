import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Verificação server-side de role
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080b12" }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
        {children}
      </main>
    </div>
  );
}
