/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Posters are served by the scraped site itself; AniList adds covers and banners.
        // Hostname-only patterns match any protocol/path like the deprecated `domains` did.
        remotePatterns: [
            { hostname: new URL(process.env.SCRAPE_WEBSITE || "https://animeheaven.me").hostname },
            { hostname: "s4.anilist.co" },
        ],
        // Next 16 raised the default from 60s to 4h; keep the previous behavior.
        minimumCacheTTL: 60,
    }
}

module.exports = nextConfig
