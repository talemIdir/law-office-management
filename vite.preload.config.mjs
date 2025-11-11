import { defineConfig } from "vite";
import { builtinModules } from "module";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "electron/preload.js",
      formats: ["cjs"], // CommonJS format for preload script
      fileName: () => "preload.js",
    },
    rollupOptions: {
      external: [
        "electron",
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
      output: {
        format: "cjs",
        entryFileNames: "[name].js",
      },
    },
  },
});
