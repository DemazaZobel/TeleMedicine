# MedLink Design System & Contributing Guide

Welcome to the MedLink frontend team! As we scale to 3 developers, it is **critical** that we maintain a consistent, premium user interface. 

This document outlines our design system rules. **Do not deviate from these rules without team discussion.**

---

## 🎨 1. The Golden Rule: Never Hardcode Styles
Our entire application is fully themed (Light & Dark mode). If you hardcode a color or pixel value, it will break when the user switches themes, and it will look inconsistent.

❌ **BAD:**
```tsx
<Text style={{ color: '#000', fontSize: 16 }}>Hello</Text>
<View style={{ padding: 10, backgroundColor: 'white' }} />
```

✅ **GOOD:**
```tsx
import { useTheme } from '../theme';

const { theme } = useTheme();

<Text style={{ ...theme.typography.body, color: theme.colors.text }}>Hello</Text>
<View style={{ padding: theme.spacing.md, backgroundColor: theme.colors.surface }} />
```

---

## 📐 2. Typography
We have a strict typography scale defined in `src/theme/tokens.ts`. **Always** spread the typography object into your style before adding color.

- `theme.typography.h1` (32px, bold) — Main App Headers
- `theme.typography.h2` (28px, bold) — Screen Titles (e.g., "Edit Profile")
- `theme.typography.h3` (24px, semi-bold) — Large Section Titles
- `theme.typography.h4` (20px, semi-bold) — Card Titles
- `theme.typography.bodyLg` (18px) — Large readable text
- `theme.typography.body` (16px) — Standard paragraph text
- `theme.typography.bodySm` (14px) — Secondary details
- `theme.typography.caption` (12px) — Small labels, tags

---

## 📏 3. Spacing Scale
We use a standardized T-shirt sizing scale for margins, paddings, and gaps. **Never** use arbitrary numbers like `15`, `25`, or `30`.

- `xs` (4px)
- `sm` (8px)
- `md` (12px)
- `lg` (16px)
- `xl` (20px)
- `2xl` (24px)
- `3xl` (32px)
- `4xl` (40px)
- `5xl` (48px)
- `6xl` (64px)

---

## 🌈 4. Colors
All semantic colors are mapped in `theme.colors`.

- **Backgrounds:** `background` (main screen), `surface` (cards), `surfaceElevated` (modals)
- **Text:** `text` (primary), `textSecondary` (grayed out), `textInverse` (white text on dark background)
- **Brand:** `primary` (blue), `primaryLight` (faint blue background for badges)
- **Status:** `error`, `errorLight`, `success`, `successLight`, `warning`, `warningLight`
- **Borders:** `border`, `divider`

---

## 🧩 5. Reusable Components
Before building a new UI element, check `src/components/ui/` to see if it already exists.

### Existing Components:
- `<ScreenContainer>`: The wrapper for EVERY screen. Handles safe areas, scrolling, and background color automatically.
- `<Card>`: A white box with a subtle shadow (adapts to dark mode).
- `<Button>`: Supports `primary`, `secondary`, `outline`, `ghost` variants and handles loading states.
- `<Input>`: Standard text inputs, handles focused border states and labels.
- `<Banner>`: Use this for showing error or success messages at the top of forms.

---

## 📁 6. File Structure
We use a **Feature-Sliced Design** approach.

- **`app/`**: ONLY contains generic routing (Expo Router). Keep these files as thin as possible.
- **`src/features/<feature-name>/`**: Contains the ACTUAL code for a domain.
  - `/components`: UI components specific to this feature.
  - `/services`: Axios API calls (`.api.ts` or `Service.ts`).
  - `/styles`: `StyleSheet.create` files extracting styles away from components.
  - `/types`: TypeScript interfaces reflecting backend models.
- **`src/store/`**: Global Zustand state (e.g., `authStore.ts`).
- **`src/components/ui/`**: Generic, dumb, reusable components (buttons, cards).

---

## 🚀 7. Workflow
1. Create a branch: `feature/<feature-name>`
2. Fetch the backend endpoint you need.
3. Add the types to your feature's `types` folder.
4. Add the API call to your feature's `services` folder.
5. Build the UI components using the `useTheme()` tokens.
6. Assemble the screen in the `app/` folder.
