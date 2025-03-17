import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            pdfjs: ["pdfjs-dist"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["pdfjs-dist"],
    },
    server: {
      proxy: {
        "/rest": {
          target: env.VITE_APP_REST_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      coverage: {
        exclude: [
          "**src/components/**",
          "scripts/",
          "**src/api**",
          "**dist**",
          "**config.js",
          "**config.ts",
          "public/",
          "**src/**.d.ts**",
        ],
      },
    },
  };
});
