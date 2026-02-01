"use client";

import * as React from "react";
import { createContext, useContext } from "react";

interface ThemeContextValue {
  theme: "light";
  resolvedTheme: "light";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme Provider
 * Simple theme provider for light theme only
 */
export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value: ThemeContextValue = {
    theme: "light",
    resolvedTheme: "light",
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
