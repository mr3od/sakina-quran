// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const reactCompiler = require("eslint-plugin-react-compiler");

module.exports = defineConfig([
  expoConfig,
  reactCompiler.configs.recommended,
  {
    ignores: [
      "dist/*",
      "scripts/validate-seo.js",
      "scripts/generate-sitemap.js",
      "scripts/generate-static-data.mjs",
      "scripts/post-export.js",
      ".expo/types/router.d.ts",
    ],
  },
]);
