module.exports = {
  preset: "jest-expo/universal",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@shopify/flash-list|@lingui/.*|@tanstack/.*|uniwind)",
  ],
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
