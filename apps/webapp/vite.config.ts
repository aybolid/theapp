import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  function expectEnv(key: string): string {
    const value = env[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }

  return {
    plugins: [
      devtools(),
      tailwindcss(),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    resolve: {
      alias: {
        "@theapp/webapp": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/server-proxy": {
          target: expectEnv("VITE_API_BASE_URL"),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/server-proxy/, ""),
        },
      },
    },
  };
});
