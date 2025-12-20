import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cosmic Runner - Space Adventure Game",
  description:
    "An infinite space runner game with stunning visuals and smooth gameplay",
  keywords: ["game", "space", "runner", "cosmic", "arcade"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
