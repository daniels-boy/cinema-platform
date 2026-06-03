import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "CineVerse — Descubra, Avalie e Compartilhe Cinema",
    template: "%s | CineVerse",
  },
  description:
    "CineVerse é a sua plataforma de cinema: descubra filmes, leia e escreva reviews, e receba recomendações personalizadas.",
  keywords: ["filmes", "cinema", "reviews", "recomendações", "TMDB"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
