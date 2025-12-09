import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

export default {
  packagerConfig: {
    icon: "./build/app.jpg",
    extraResource: [
      "./build/app.jpg"
    ],
    asar: {
      unpack: "*.{node,dll,ttf}",
    },
    // Prune devDependencies but keep all production dependencies
    prune: true,
    // Explicitly ignore only development and build files
    ignore: [
      /^\/\.vscode/,
      /^\/\.git/,
      /^\/\.gitignore/,
      /^\/\.env$/,
      /^\/build/,
      /^\/release/,
      /^\/out/,
      /^\/src/, // Source files (already compiled to dist)
      /^\/public/,
      /^\/vite\..*\.mjs/,
      /^\/forge\.config\.js/,
      /^\/INSTALLER_SETUP\.md/,
      /^\/nul$/,
      /^\/node_modules\/\.cache/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        setupIcon: "./build/app.jpg",
        iconUrl: "./build/app.jpg",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-vite",
      config: {
        build: [
          {
            entry: "electron/main.js",
            config: "vite.main.config.mjs",
            target: "main",
          },
          {
            entry: "src/utils/api.js",
            config: "vite.preload.config.mjs",
            target: "preload",
          },
        ],
        renderer: [
          {
            name: "main_window",
            config: "vite.renderer.config.mjs",
          },
        ],
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: false,
    }),
  ],
};
