import type { Metadata } from "next";
import { SiteNavigation } from "@/features/navigation/components/site-navigation";
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
      <body className="flex min-h-screen flex-col">
        <SiteNavigation />
        {children}
      </body>
    </html>
  );
}
