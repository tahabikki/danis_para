import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dani's Parapharmacy",
  description: "Demo de gestion de parapharmacie en mode local ou cloud.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
