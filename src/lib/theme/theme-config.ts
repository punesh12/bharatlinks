/**
 * Theme Configuration
 * Centralized theme configuration for light theme
 */

export const themeConfig = {
  // Color Palette (Light theme only)
  colors: {
    background: "oklch(1 0 0)", // Pure white
    foreground: "oklch(0.145 0 0)", // Near black
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.145 0 0)",
    primary: "oklch(0.205 0 0)", // Dark gray/black
    "primary-foreground": "oklch(0.985 0 0)", // Near white
    secondary: "oklch(0.97 0 0)", // Light gray
    "secondary-foreground": "oklch(0.205 0 0)",
    muted: "oklch(0.97 0 0)",
    "muted-foreground": "oklch(0.556 0 0)", // Medium gray
    accent: "oklch(0.97 0 0)",
    "accent-foreground": "oklch(0.205 0 0)",
    destructive: "oklch(0.577 0.245 27.325)", // Red
    "destructive-foreground": "oklch(0.985 0 0)",
    border: "oklch(0.922 0 0)", // Light border
    input: "oklch(0.922 0 0)",
    ring: "oklch(0.708 0 0)", // Medium gray ring
    // Chart colors
    "chart-1": "oklch(0.646 0.222 41.116)", // Orange
    "chart-2": "oklch(0.6 0.118 184.704)", // Blue
    "chart-3": "oklch(0.398 0.07 227.392)", // Purple
    "chart-4": "oklch(0.828 0.189 84.429)", // Yellow
    "chart-5": "oklch(0.769 0.188 70.08)", // Green
    // Sidebar colors
    sidebar: "oklch(0.985 0 0)",
    "sidebar-foreground": "oklch(0.145 0 0)",
    "sidebar-primary": "oklch(0.205 0 0)",
    "sidebar-primary-foreground": "oklch(0.985 0 0)",
    "sidebar-accent": "oklch(0.97 0 0)",
    "sidebar-accent-foreground": "oklch(0.205 0 0)",
    "sidebar-border": "oklch(0.922 0 0)",
    "sidebar-ring": "oklch(0.708 0 0)",
  },

  // Typography
  typography: {
    fontFamily: {
      sans: "var(--font-geist-sans)",
      mono: "var(--font-geist-mono)",
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Spacing (4px grid)
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
  },

  // Border Radius
  radius: {
    none: "0",
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    base: "var(--radius)",
    lg: "calc(var(--radius) + 4px)",
    xl: "calc(var(--radius) + 8px)",
    "2xl": "calc(var(--radius) + 12px)",
    "3xl": "calc(var(--radius) + 16px)",
    full: "9999px",
  },

  // Shadows
  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  // Transitions
  transitions: {
    duration: {
      fast: "150ms",
      base: "200ms",
      slow: "300ms",
      slower: "500ms",
    },
    easing: {
      linear: "linear",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
} as const;

export type ThemeConfig = typeof themeConfig;
