# 🌙 **SAKINAH DESIGN SYSTEM**

## _A Design Language for Tranquility and Sacred Focus_

### بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

---

## 📖 **Table of Contents**

1. [Philosophy & Vision](#philosophy--vision)
2. [Design Foundations](#design-foundations)
3. [Foundational Tokens](#foundational-tokens)
4. [Theme System](#theme-system)
5. [Typography System](#typography-system)
6. [Spacing & Layout](#spacing--layout)
7. [Color System](#color-system)
8. [Component Guidelines](#component-guidelines)
9. [Accessibility](#accessibility)
10. [Best Practices](#best-practices)
11. [Cultural & Spiritual Alignment](#cultural--spiritual-alignment)

---

## 🕌 **Philosophy & Vision**

### **السكينة** — _As-Sakīnah_ (Divine Tranquility)

> _"Every colour, curve, and character should invite the reader to linger with the divine words in peace."_

Sakinah is a design language born from **devotional minimalism** — honoring sacred text by creating calm, contemplative interfaces. It balances **heritage and modernity**, guiding every UI element toward clarity and reverence.

### **Sacred Principles**

1. **Qur’an First, Interface Second** — The interface never competes with revelation.
2. **Beauty Through Restraint** — Simplicity enhances focus.
3. **Arabic & Latin in Harmony** — Dual typography with equal dignity.
4. **Light that Guides, Dark that Soothes** — Adaptive theming for reflection and comfort.
5. **Tokenized Everything** — Consistency through shared design variables.
6. **Accessibility as Worship** — Inclusion is an act of respect.
7. **Performance is Piety** — A tranquil experience must feel effortless.

### **Core Design Principles**

- **The Vessel, Not the Voice** — UI is a frame for sacred meaning.
- **Clarity as Devotion** — Readability is a moral imperative.
- **Tranquility by Design** — Calm, spacious interfaces.
- **Rooted Yet Modern** — Traditional aesthetics, contemporary execution.
- **Universally Welcoming** — Designed for every believer, every device.

---

## ⚛️ **Design Foundations**

Sakinah operates on three foundational layers:

| Layer          | Purpose                                  | Examples                     |
| -------------- | ---------------------------------------- | ---------------------------- |
| **Tokens**     | The immutable source of truth            | Colors, spacing, fonts       |
| **Themes**     | Contextual moods or prayer-time palettes | Fajr, Layl, Asr, Tahajjud    |
| **Components** | Reusable building blocks                 | Buttons, cards, verse blocks |

All visual styles must derive from tokens and adhere to the system’s semantic naming.

---

## 🧭 **Foundational Tokens**

### **1. Typography Tokens**

| Token                    | Description                 | Example            |
| ------------------------ | --------------------------- | ------------------ |
| `--font-arabic`          | Primary Quranic font        | `Uthmanic Hafs`    |
| `--font-ui-ar`           | Arabic interface font       | `Noto Sans Arabic` |
| `--font-ui-en`           | English interface font      | `Inter`            |
| `--font-size-quran-base` | Default Quranic font size   | `1.875rem` (30px)  |
| `--leading-quran`        | Line height for Arabic text | `2.2`              |

### **2. Spacing Tokens**

- Scale based on **tasbīḥ count** rhythm (multiples of 4px):
  `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), etc.

- **Semantic spacing** (use instead of numeric values):

  - `--space-reading-margin`: page padding
  - `--space-verse-gap`: gap between verses
  - `--space-section-gap`: spacing between surah sections

### **3. Radii & Shadows**

| Token         | Use                 | Example                      |
| ------------- | ------------------- | ---------------------------- |
| `--radius-md` | Default card corner | `10px`                       |
| `--shadow-md` | Base elevation      | `0 4px 8px rgba(0,0,0,0.06)` |

---

## 🎨 **Color System**

### **Color Families**

| Name                 | Meaning            | Use                           |
| -------------------- | ------------------ | ----------------------------- |
| **Raml (رمل)**       | Sand tones         | Backgrounds, neutral surfaces |
| **Zumurrud (زمرّد)** | Emerald tones      | Accents, success              |
| **Dhahab (ذهب)**     | Gold tones         | Highlights, ornamentation     |
| **Slate**            | Neutral foundation | Dark mode contrast            |

### **Semantic Tokens**

| Token                  | Purpose            | Example                     |
| ---------------------- | ------------------ | --------------------------- |
| `--color-bg-primary`   | Page background    | `var(--color-raml-50)`      |
| `--color-surface`      | Elevated container | `#ffffff`                   |
| `--color-text-primary` | Body text          | `var(--color-raml-900)`     |
| `--color-accent`       | Action elements    | `var(--color-zumurrud-600)` |
| `--color-highlight`    | Verse highlight    | `rgba(234, 179, 8, 0.25)`   |

---

## 🕯️ **Theme System**

Themes express **time, mood, and spiritual rhythm**.
Each theme applies unique color mappings without breaking typographic or spacing consistency.

| Theme        | Symbolism           | Palette Essence      |
| ------------ | ------------------- | -------------------- |
| **Fajr**     | Dawn / Renewal      | Light sand & emerald |
| **Layl**     | Night / Reflection  | Deep slate & emerald |
| **Asr**      | Afternoon / Warmth  | Golden beige tones   |
| **Tahajjud** | Midnight / Solitude | Pure black serenity  |
| **Masjid**   | Sacred Presence     | Deep green & gold    |

Each theme defines:

- `--color-bg-primary`
- `--color-text-primary`
- `--color-accent`
- `--color-highlight`
- `--color-border-base`

No component should hardcode colors outside these semantic tokens.

---

## ✍️ **Typography System**

### **1. Quranic Text**

- Font: `Uthmanic Hafs`
- Size scale: `--font-size-quran-base` to `--font-size-quran-3xl`
- Line height: `2.2× font size`
- Direction: `rtl`
- Weight: `regular`
- Letter spacing: neutral (`0em`)

**Best Practice:** Maintain consistent leading between Arabic and translation for visual harmony.

### **2. UI Text**

| Role    | Font                         | Size              | Weight    |
| ------- | ---------------------------- | ----------------- | --------- |
| Body    | `Inter` / `Noto Sans Arabic` | `--font-size-md`  | Regular   |
| Heading | Same as UI font              | `--font-size-xl`+ | Semi-bold |
| Label   | Same                         | `--font-size-sm`  | Medium    |

---

## 📐 **Spacing & Layout**

- **Grid Principle:** 8px baseline, with exceptions for sacred typography.
- **Container Margins:** Use `--space-reading-margin`.
- **Hierarchy:** Maintain large breathing space between verses and sections.
- **Safe Areas:** Always respect OS-specific safe insets.
- **Directionality:** Arabic screens are RTL by default.

---

## 🧩 **Component Guidelines**

### **Buttons**

- Use semantic colors: `bg-accent`, `text-surface`.
- Minimum touch area: **48×48dp**.
- States: default, pressed, focused, disabled.

### **Cards / Surfaces**

- Default background: `bg-surface`.
- Elevation: `shadow-md`.
- Corner radius: `radius-md`.

### **Typography Components**

- Quranic text: `font-arabic`, correct line height.
- Translation: `font-ui-en` or `font-ui-ar` depending on language.

### **Iconography**

- Use minimal, line-based icons.
- Align visually to text baselines.
- Avoid clutter or figurative imagery.

---

## ♿ **Accessibility**

Sakinah is **WCAG AA compliant** and rooted in **inclusive design ethics**.

**Requirements:**

- Minimum color contrast ratio: **4.5:1**.
- Every interactive element must have `accessibilityLabel`.
- Respect user font scaling preferences.
- Ensure correct reading order for RTL and LTR.
- Use logical focus flow and visible focus indicators.
- Never rely on color alone for meaning.

---

## 🧘 **Best Practices**

### ✅ Use Semantic Tokens

Always derive colors, spacing, and typography from tokens.

```jsx
<View className="bg-surface border border-border-base">
  <Text className="text-text-primary">Ayah Content</Text>
</View>
```

### 🚫 Avoid Hardcoding

```jsx
<View className="bg-white text-black">...</View> // ❌ Not allowed
```

### ✅ Preserve Arabic Line Height

```jsx
<Text className="font-arabic" style={{ lineHeight: 30 * 2.2 }}>
  {arabicText}
</Text>
```

### ✅ Include Accessibility Metadata

```jsx
<Pressable
  accessible
  accessibilityRole="button"
  accessibilityLabel="Play recitation"
  accessibilityHint="Double tap to play"
/>
```

### ✅ Respect Safe Areas

Use system insets instead of fixed padding.

---

## 🕊️ **Cultural & Spiritual Alignment**

Sakinah’s design language is deeply **contextual to Islamic aesthetics**:

| Element                    | Reflection                   |
| -------------------------- | ---------------------------- |
| **Raml (Sand)**            | Groundedness & humility      |
| **Zumurrud (Emerald)**     | Renewal & paradise           |
| **Dhahab (Gold)**          | Divine beauty & illumination |
| **Themes by Prayer Times** | Spiritual cadence of the day |

Every token, font, and gradient is an act of **intentional design**, meant to invite stillness and focus.

---

## 🌟 **Summary**

**Sakinah Design System** is not just a toolkit — it is a **philosophy of sacred interaction**.
It seeks harmony between technology and spirituality through beauty, restraint, and reverence.

**Core Values**

- Culturally authentic
- Token-driven
- Accessible by default
- Cross-platform consistent
- Spiritually aligned

---

**بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ**
_May every interface built with Sakinah be a vessel for peace._
_May this system serve millions in their journey with the Quran._  
_May every line of code be an act of worship._  
_May the interface disappear, leaving only the divine Word._
**الحمد لله رب العالمين**

**Sakinah Design System — v1.0**
