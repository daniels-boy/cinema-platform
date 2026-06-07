import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "CineVerse — Descubra, Avalie e Compartilhe Cinema",
    template: "%s | CineVerse",
  },
  description: "CineVerse é a sua plataforma de cinema: descubra filmes, leia e escreva reviews, e receba recomendações personalizadas.",
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh" }}>{children}</main>
      <Footer />
    </>
  );
}
