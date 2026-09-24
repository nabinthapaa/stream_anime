import Nav from "@/components/Nav";
import { NavigationTracker } from "@/components/navigation/NavigationTracker";
import { DetailsHost } from "@/components/title/DetailsHost";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Anime 101",
    template: "%s · Anime 101",
  },
  description:
    "A personal Project to scrape gogoanime and display data with streaming feature",
};

export const viewport: Viewport = {
  themeColor: "#141414",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={inter.variable}>
      <body className="flex min-h-svh flex-col bg-canvas pb-[calc(4rem_+_env(safe-area-inset-bottom))] font-sans text-neutral-100 antialiased md:pb-0">
        <a
          href="#main"
          className="fixed top-2 left-2 z-[60] -translate-y-20 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-line px-page py-8 text-xs text-neutral-400">
          <p>
            <span className="font-semibold text-neutral-400">Anime 101</span> is a personal project. Titles and artwork
            belong to their respective owners.
          </p>
        </footer>
        <DetailsHost />
        <NavigationTracker />
      </body>
    </html>
  );
}
