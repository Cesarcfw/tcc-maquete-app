const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/**"] },
  {
    ignores: [
      "backend/node_modules/**",
      "backend/data/**",
      "backend/backups/**",
    ],
  },
  {
    files: ["backend/**/*.mjs", "scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        fetch: "readonly",
        AbortSignal: "readonly",
        Headers: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
      },
    },
  },
  {
    files: ["integration/node-red/*.cjs"],
    languageOptions: { globals: { __dirname: "readonly" } },
  },
]);
