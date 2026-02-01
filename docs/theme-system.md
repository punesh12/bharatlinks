# Theme System Documentation

Complete guide to the BharatLinks theme system.

## Overview

The theme system provides:
- **Light Theme Support**: Full color palette for light theme
- **Theme Context**: React context for accessing theme throughout the app
- **Consistent Styling**: Centralized theme configuration

## Architecture

```
src/lib/theme/
├── theme-provider.tsx    # Theme context and provider
├── theme-config.ts       # Theme configuration (colors, tokens)
└── index.ts              # Exports
```

## Usage

### 1. Theme Provider Setup

The `ThemeProvider` is already set up in `src/app/layout.tsx`:

```tsx
import { ThemeProvider } from "@/lib/theme";

<ThemeProvider>
  {children}
</ThemeProvider>
```

### 2. Using Theme Hook

Access theme state anywhere in your components:

```tsx
"use client";

import { useTheme } from "@/lib/theme";

export function MyComponent() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
    </div>
  );
}
```

**Note**: Currently, both `theme` and `resolvedTheme` will always be `"light"`.

## Theme Configuration

### Color Palette

The theme system uses CSS variables defined in `globals.css`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... more colors */
}
```

### Accessing Theme Colors

Colors are automatically applied via CSS variables. Use Tailwind classes:

```tsx
<div className="bg-background text-foreground">
  <div className="bg-card text-card-foreground">
    Card content
  </div>
</div>
```

### Theme Config Object

Access theme configuration programmatically:

```tsx
import { themeConfig } from "@/lib/theme";

// Access colors
const colors = themeConfig.colors;

// Access spacing
const spacing = themeConfig.spacing[4]; // "1rem"

// Access typography
const fontSize = themeConfig.typography.fontSize.lg; // "1.125rem"
```

## CSS Variables Reference

### Light Mode Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `oklch(1 0 0)` | Main background |
| `--foreground` | `oklch(0.145 0 0)` | Main text |
| `--primary` | `oklch(0.205 0 0)` | Primary actions |
| `--secondary` | `oklch(0.97 0 0)` | Secondary elements |
| `--muted` | `oklch(0.97 0 0)` | Muted backgrounds |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Error/danger |
| `--border` | `oklch(0.922 0 0)` | Borders |
| `--input` | `oklch(0.922 0 0)` | Input borders |
| `--ring` | `oklch(0.708 0 0)` | Focus rings |

## Theme API

### `useTheme()` Hook

Returns:

```tsx
{
  theme: "light";          // Always "light"
  resolvedTheme: "light";  // Always "light"
}
```

## Best Practices

1. **Use CSS Variables**: Always use Tailwind classes that reference CSS variables
   ```tsx
   // ✅ Good
   <div className="bg-background text-foreground">
   
   // ❌ Bad
   <div className="bg-white text-black">
   ```

2. **Use Theme Hook**: Access theme state when needed
   ```tsx
   const { resolvedTheme } = useTheme();
   // Currently always "light"
   ```

3. **Test Components**: Ensure components work with CSS variables

4. **Smooth Transitions**: Add transition classes for consistent animations
   ```tsx
   <div className="bg-background text-foreground transition-colors">
   ```

## Troubleshooting

### Theme Not Applying

- Ensure `ThemeProvider` wraps your app (already done in `layout.tsx`)
- Check that CSS variables are defined in `globals.css` (already done)
- Verify Tailwind classes use CSS variables (they do)

## Theme Configuration

The theme configuration includes:

- **Colors**: Complete color palette
- **Typography**: Font families, sizes, weights
- **Spacing**: Consistent 4px grid system
- **Border Radius**: Standardized radius values
- **Shadows**: Elevation system
- **Transitions**: Animation durations and easing

All values are accessible via `themeConfig` object or CSS variables.
