import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { builtinModules } from "module";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "electron/main.js",
      formats: ["es"], // Force ES module format
      fileName: () => "main.js",
    },
    rollupOptions: {
      // Externalize all node built-ins and all dependencies
      external: [
        "electron",
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        "sequelize",
        "pg",
        "pg-hstore",
        "bcryptjs",
        "dotenv",
        "electron-squirrel-startup",
      ],
      output: {
        format: "es", // Explicitly set ES format
        entryFileNames: "[name].js",
      },
    },
  },
  optimizeDeps: {
    exclude: ["sequelize", "pg", "pg-hstore"],
  },
});
