import Nav from "@/components/Nav";
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Anime 101",
  description:
    "A personal Project to scrape gogoanime and display data with streaming feature",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans dark:bg-gray-800 dark:text-white">
        <Nav />
        {children}
      </body>
    </html>
  );
}
