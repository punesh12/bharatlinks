/**
 * Theme Configuration
 * Centralized theme values that extend CSS variables
 */

import { tokens } from "./tokens";

export const theme = {
  ...tokens,

  // Color Palette (using CSS variables from globals.css)
  colors: {
    // Semantic Colors
    background: "var(--background)",
    foreground: "var(--foreground)",
    primary: "var(--primary)",
    "primary-foreground": "var(--primary-foreground)",
    secondary: "var(--secondary)",
    "secondary-foreground": "var(--secondary-foreground)",
    muted: "var(--muted)",
    "muted-foreground": "var(--muted-foreground)",
    accent: "var(--accent)",
    "accent-foreground": "var(--accent-foreground)",
    destructive: "var(--destructive)",
    "destructive-foreground": "var(--destructive-foreground)",
    border: "var(--border)",
    input: "var(--input)",
    ring: "var(--ring)",

    // Component Colors
    card: "var(--card)",
    "card-foreground": "var(--card-foreground)",
    popover: "var(--popover)",
    "popover-foreground": "var(--popover-foreground)",

    // Sidebar Colors
    sidebar: "var(--sidebar)",
    "sidebar-foreground": "var(--sidebar-foreground)",
    "sidebar-primary": "var(--sidebar-primary)",
    "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
    "sidebar-accent": "var(--sidebar-accent)",
    "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
    "sidebar-border": "var(--sidebar-border)",
    "sidebar-ring": "var(--sidebar-ring)",

    // Chart Colors
    "chart-1": "var(--chart-1)",
    "chart-2": "var(--chart-2)",
    "chart-3": "var(--chart-3)",
    "chart-4": "var(--chart-4)",
    "chart-5": "var(--chart-5)",
  },

  // Component Variants
  variants: {
    button: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-white hover:bg-destructive/90",
      outline: "border bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
  },
} as const;

export type Theme = typeof theme;
