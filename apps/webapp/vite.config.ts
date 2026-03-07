import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode, command }) => {
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
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
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

    ...(command === "serve"
      ? {
          server: {
            proxy: {
              "/api": {
                target: expectEnv("API_BASE_URL"),
                changeOrigin: true,
              },
              "/s3": {
                target: expectEnv("S3_BASE_URL"),
                rewrite: (path) => path.replace(/^\/s3/, ""),
                changeOrigin: true,
              },
            },
          },
        }
      : {}),

    build: {
      rolldownOptions: {
        checks: { pluginTimings: false, circularDependency: true },
        output: {
          comments: false,
          minify: true,
          codeSplitting: {
            groups: [
              {
                name: "",
                test: (module) => {
                  if (module.includes("theapp/apps/server")) {
                    throw new Error("YOU ARE ABOUT TO LEAK SERVER CODE!");
                  }
                },
              },
            ],
          },
        },
      },
    },
  };
});
