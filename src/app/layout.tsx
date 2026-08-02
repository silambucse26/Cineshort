import type { Metadata } from "next";
import "./globals.css";
import { ShortFilmProvider } from "@/context/ShortFilmContext";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "CineShort – Short-Film Discovery Platform for Young Directors & Actors",
  description: "Discover micro-short films by mood and duration, rate top young directors, post verified celebrity comments, and watch short film cinema.",
  keywords: ["short film", "directors", "actors", "cinema", "indie film", "leaderboard"],
  authors: [{ name: "CineShort Team" }],
};

export const viewport = {
  themeColor: "#0B0C10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-[#0B0C10] text-[#F5F5F5] flex flex-col selection:bg-[#FFD60A] selection:text-[#0B0C10]">
        <ShortFilmProvider>
          {/* Header acts as left vertical sidebar on desktop, bottom navigation on mobile */}
          <Header />

          {/* Main Content & Footer Area shifted to fit sidebar/bottom-bar */}
          <div className="flex-grow flex flex-col pt-14 md:pt-0 md:pl-20 pb-16 md:pb-0 min-h-screen">
            <main className="flex-grow flex flex-col">
              {children}
            </main>

            {/* Minimal Premium Footer */}
            <footer className="bg-[#0B0C10] border-t border-[#1F2833] py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 font-bold text-[#F5F5F5] tracking-wider">
                  <span className="text-[#FFD60A] text-base font-black uppercase">CINESHORT</span>
                  <span className="text-[10px] text-gray-500 font-normal">Short-Film Platform</span>
                </div>
                <div className="text-[11px] text-gray-400 font-medium">
                  © {new Date().getFullYear()} CineShort. All rights reserved.
                </div>
              </div>
            </footer>
          </div>
        </ShortFilmProvider>
      </body>
    </html>
  );
}
