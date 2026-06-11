import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dani's Parapharmacy",
  description: "Demo de gestion de parapharmacie en mode local ou cloud.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (
    <html lang="fr">
      <head>
        {supabaseUrl ? (
          <link rel="preconnect" href={supabaseUrl} />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
