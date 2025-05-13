// moodify\src\app\layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LikedTracksProvider } from "./context/LikedTracksContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moodify - Music for Every Mood",
  description:
    "Discover music that matches your mood and create personalized playlists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LikedTracksProvider>{children}</LikedTracksProvider>
      </body>
    </html>
  );
}
