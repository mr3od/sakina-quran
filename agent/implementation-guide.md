# 📘 Expo & Uniwind Implementation Reference Guide

A concise reference for locating documentation and understanding the main use cases for each key implementation in this Expo project.
This document also includes verified dependencies and configuration details for Uniwind and Expo SQLite (with FTS).

---

## 🗃️ SQLite

**Documentation:**
🔗 [Expo SQLite Usage Guide](https://docs.expo.dev/versions/latest/sdk/sqlite/#usage)

**Use Cases:**

- Local relational database storage.
- Persistent offline data (e.g., user settings, cached API data).
- Running SQL queries directly on-device.
- Full-Text Search (FTS5) enabled for efficient text queries.

**Configuration Notes:**

- FTS is enabled via the Expo plugin:

  ```json
  "plugins": [
    ["expo-sqlite", { "enableFTS": true }]
  ]
  ```

- Web support configured in `metro.config.js` with `.wasm` assets and COEP/COOP headers.

---

## 🧩 Key-Value Storage

**Documentation:**
🔗 [Expo Key-Value Storage (via SQLite)](https://docs.expo.dev/versions/latest/sdk/sqlite/#key-value-storage)

**Use Cases:**

- Simple persistent key-value pairs (similar to AsyncStorage).
- Backed by SQLite for reliability and performance.
- Ideal for lightweight app data such as preferences and tokens.

---

## 🎨 Icons

**Documentation:**
🔗 [Expo Vector Icons Guide](https://docs.expo.dev/guides/icons/#expovector-icons)

**Use Cases:**

- Scalable, platform-consistent icons for UI.
- Integrates with libraries such as Ionicons, MaterialIcons, and FontAwesome.
- Commonly used for navigation tabs, buttons, and headers.

---

## 🧭 Routing

**Documentation:**
🔗 [Expo Router Guide](https://docs.expo.dev/versions/latest/sdk/router/)

**Use Cases:**

- File-based navigation powered by Expo Router.
- Supports stacks, tabs, modals, and nested routes.
- Simplifies navigation structure through directory layout under `/app`.

---

## 💅 Styling — Uniwind `^1.2.X`

**Documentation:**
🔗 [Uniwind Docs (LLMs Full Reference)](https://docs.uniwind.dev/llms-full.txt)

**Use Cases:**

- Utility-first styling for React Native, similar to TailwindCSS.
- Works natively across platforms with `className` syntax.
- Integrates with TailwindCSS for unified design tokens.

**Configuration Notes:**

- Global stylesheet setup:

  ```css
  @import "tailwindcss";
  @import "uniwind";
  ```

- Metro configuration includes Uniwind integration via:

  ```js
  const { withUniwindConfig } = require("uniwind/metro");
  module.exports = withUniwindConfig(config, {
    cssEntryFile: "./src/global.css",
    dtsFile: "./src/uniwind-types.d.ts",
  });
  ```

---

### 🧾 Summary Table

| Feature / SDK     | Docs Link                                                                                | Main Use Case               |
| ----------------- | ---------------------------------------------------------------------------------------- | --------------------------- |
| SQLite            | [SQLite Usage](https://docs.expo.dev/versions/latest/sdk/sqlite/#usage)                  | Local SQL database with FTS |
| Key-Value Storage | [Key-Value Storage](https://docs.expo.dev/versions/latest/sdk/sqlite/#key-value-storage) | Simple persistent data      |
| Icons             | [Expo Vector Icons](https://docs.expo.dev/guides/icons/#expovector-icons)                | UI icons                    |
| Routing           | [Expo Router](https://docs.expo.dev/versions/latest/sdk/router/)                         | Navigation                  |
| Styling (Uniwind) | [Uniwind Docs](https://docs.uniwind.dev/llms-full.txt)                                   | Utility-based styling       |

---

## 📦 Project Dependencies

```json
{
  "@expo/vector-icons": "^15.0.3",
  "@shopify/flash-list": "^2.0.2",
  "@react-navigation/bottom-tabs": "^7.4.0",
  "@react-navigation/elements": "^2.9.3",
  "@react-navigation/native": "^7.1.8",
  "@tanstack/react-query": "^5.90.12",
  "expo": "54.0.30",
  "expo-constants": "~18.0.12",
  "expo-font": "~14.0.10",
  "expo-haptics": "~15.0.8",
  "expo-image": "~3.0.11",
  "expo-linking": "~8.0.11",
  "expo-router": "~6.0.21",
  "expo-splash-screen": "~31.0.13",
  "expo-sqlite": "~16.0.10",
  "expo-status-bar": "~3.0.9",
  "expo-symbols": "~1.0.8",
  "expo-system-ui": "~6.0.9",
  "expo-web-browser": "~15.0.10",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-native": "0.81.5",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-reanimated": "~4.1.6",
  "react-native-safe-area-context": "~5.6.2",
  "react-native-screens": "~4.16.0",
  "react-native-web": "~0.21.2",
  "react-native-worklets": "0.5.1",
  "tailwindcss": "^4.1.18",
  "uniwind": "^1.2.2"
}
```

---

✅ **Status:**
All implementations are installed, configured, and verified as working across native and web platforms.
This guide serves as your single reference for linking docs, configuration context, and dependency overview.
