import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";

const base = "/network-simulator";

// https://vitejs.dev/config/
export default defineConfig({
  base: base,
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
      },
      manifest: {
        id: "NetworkSimulator",
        name: "Network Simulator",
        short_name: "NetSim",
        description: "Network Simulator",
        start_url: base,
        scope: base,
        display: "standalone",
        orientation: "any",
        launch_handler: {
          client_mode: "auto",
        },
        background_color: "#ffffff",
        theme_color: "#030712",
        icons: [
          // Icons taken from https://www.flaticon.com/free-icon/cloud-computing_5978028?term=network+devices&page=1&position=60&origin=search&related_id=5978028
          {
            src: `${base}/icons/512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${base}/icons/256.png`,
            sizes: "256x256",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${base}/icons/128.png`,
            sizes: "128x128",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${base}/icons/64.png`,
            sizes: "64x64",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${base}/icons/32.png`,
            sizes: "32x32",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${base}/icons/16.png`,
            sizes: "16x16",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
