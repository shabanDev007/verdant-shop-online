import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({ server: { entry: "./src/server.ts" } }),
    nitro(),
    viteReact(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["favicon-jothour.ico", "jothour-apple-touch-icon.png", "robots.txt"],
      manifest: {
        id: "/",
        name: "Jothour | جذور Plant Store",
        short_name: "جذور",
        description: "Premium plants, pots, and plant design projects across Egypt.",
        theme_color: "#315f49",
        background_color: "#fbf7ea",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        lang: "en",
        categories: ["shopping", "lifestyle"],
        icons: [
          { src: "/jothour-icon-64.png", sizes: "64x64", type: "image/png" },
          { src: "/jothour-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/jothour-icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/jothour-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Nitro writes the final browser bundle after this plugin runs. Cache
        // those same-origin assets when they are first requested instead.
        globPatterns: [],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "jothour-pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              url.origin === self.location.origin &&
              ["script", "style", "worker"].includes(request.destination),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "jothour-static-assets",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              url.origin === self.location.origin &&
              ["image", "font"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "jothour-media",
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.hostname.endsWith(".supabase.co") &&
              url.pathname.includes("/storage/v1/object/public/"),
            handler: "CacheFirst",
            options: {
              cacheName: "jothour-product-images",
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
                purgeOnQuotaError: true,
              },
            },
          },
        ],
      },
    }),
  ],
});
