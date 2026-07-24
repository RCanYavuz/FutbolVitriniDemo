import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite config calisirken `.env` degerleri process.env'e otomatik eklenmez.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      host: true,
      port: 5173,
      // Gelistirmede tarayici ayni origin'e istek atar; HttpOnly cookie'ler sorunsuz calisir.
      proxy: {
        "/api": {
          target: env.VITE_DEV_API_PROXY || "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: 4173,
    },
    build: {
      // Recharts + React tek parcada 700 kB'i asiyordu; saticiyi ayirinca ilk yukleme hafifler.
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;
            if (id.includes("recharts") || id.includes("d3-")) return "charts";
            if (
              id.includes("react-router") ||
              id.includes("/react-dom/") ||
              id.includes("/react/")
            ) {
              return "react";
            }
          },
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        exclude: ["src/test/**", "**/*.d.ts", "src/main.tsx"],
      },
    },
  };
});
