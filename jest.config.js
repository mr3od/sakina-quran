// jest-expo/universal resolves to four platform projects (Web/Node/iOS/Android),
// each carrying its own babel-jest caller options and transformIgnorePatterns.
// Top-level `transform` / `transformIgnorePatterns` do not reach object-form
// projects, so both are extended per project below.
const universalPreset = require("jest-expo/universal/jest-preset");

// Lingui 6 ships ESM-only dists (.mjs) for core/react. Two adjustments make
// them loadable under Jest 29's CommonJS pipeline:
//   1. transformIgnorePatterns — under pnpm, dependency realpaths live at
//      <root>/node_modules/.pnpm/<key>/node_modules/<pkg>, so the pattern must
//      skip the outer `.pnpm` segment and decide on the package segment only
//      (a plain `node_modules/(?!pkg)` matches the outer segment first and
//      ignores everything).
//   2. an explicit babel-jest entry for `^.+\.mjs$` — babel-jest's default
//      matcher (\.[jt]sx?$) never selects .mjs files.
const transformIgnorePatterns = [
  "node_modules/(?!(\\.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?|@expo-google-fonts|react-navigation|@react-navigation|@shopify/flash-list|@lingui|@tanstack|uniwind|@messageformat))",
  "/node_modules/react-native-reanimated/plugin/",
];

module.exports = {
  projects: universalPreset.projects.map((project) => ({
    ...project,
    transformIgnorePatterns,
    transform: {
      ...project.transform,
      "^.+\\.mjs$": "babel-jest",
    },
  })),
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/features/search/**/*.{ts,tsx}",
    "src/hooks/useDebouncedValue.ts",
    "!**/__tests__/**",
    "!**/*.native.ts",
  ],
};
