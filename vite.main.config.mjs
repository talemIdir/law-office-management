import { defineConfig } from "vite";
import { builtinModules } from "module";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "electron/main.js",
      formats: ["cjs"], // Use CommonJS for Electron 22 compatibility
      fileName: () => "main.cjs",
    },
    rollupOptions: {
      // Externalize all node built-ins and all dependencies
      external: [
        "electron",
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        "sequelize",
        "sqlite3",
        "bcrypt",
        "pg",
        "pg-hstore",
        "bcryptjs",
        "dotenv",
        "electron-squirrel-startup",
        "electron-store",
        "node-machine-id",
        "crypto-js",
      ],
      output: {
        format: "cjs", // Use CommonJS format
        entryFileNames: "[name].cjs",
      },
    },
  },
  optimizeDeps: {
    exclude: ["sequelize", "sqlite3", "bcrypt", "pg", "pg-hstore"],
  },
});
