import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenuAhora — Menú del día cerca de ti",
  description: "Pide tu menú casero del día con delivery. Cocineras cerca de tu ubicación.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6b21c8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-light">
        {children}
      </body>
    </html>
  );
}
