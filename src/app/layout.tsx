import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zavi Arcade",
  description: "Games, challenges, and experiments built by Zavi and family.",
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
