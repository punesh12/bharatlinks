/**
 * Design System Tokens
 * Centralized design tokens for consistent styling across the application
 */

export const tokens = {
  // Typography Scale
  typography: {
    fontFamily: {
      sans: "var(--font-geist-sans)",
      mono: "var(--font-geist-mono)",
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.025em" }], // 12px
      sm: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.01em" }], // 14px
      base: ["1rem", { lineHeight: "1.5rem", letterSpacing: "0" }], // 16px
      lg: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }], // 18px
      xl: ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.015em" }], // 20px
      "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.02em" }], // 24px
      "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.025em" }], // 30px
      "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.03em" }], // 36px
      "5xl": ["3rem", { lineHeight: "1", letterSpacing: "-0.035em" }], // 48px
      "6xl": ["3.75rem", { lineHeight: "1", letterSpacing: "-0.04em" }], // 60px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Spacing Scale (based on 4px grid)
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
  shadow: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  // Z-Index Scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Breakpoints (for reference, actual breakpoints are in Tailwind config)
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Animation Durations
  duration: {
    fast: "150ms",
    base: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  // Easing Functions
  easing: {
    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export type Tokens = typeof tokens;
