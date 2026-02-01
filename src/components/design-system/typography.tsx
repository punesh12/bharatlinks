"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Typography Component System
 * Provides consistent text styling throughout the application
 */

const typographyVariants = cva("", {
  variants: {
    variant: {
      // Display Styles
      "display-2xl": "text-6xl font-bold tracking-tight",
      "display-xl": "text-5xl font-bold tracking-tight",
      "display-lg": "text-4xl font-bold tracking-tight",
      "display-md": "text-3xl font-bold tracking-tight",
      "display-sm": "text-2xl font-bold tracking-tight",

      // Heading Styles
      h1: "text-4xl font-bold tracking-tight lg:text-5xl",
      h2: "text-3xl font-semibold tracking-tight",
      h3: "text-2xl font-semibold tracking-tight",
      h4: "text-xl font-semibold tracking-tight",
      h5: "text-lg font-semibold tracking-tight",
      h6: "text-base font-semibold tracking-tight",

      // Body Styles
      body: "text-base leading-7",
      "body-lg": "text-lg leading-7",
      "body-sm": "text-sm leading-6",
      "body-xs": "text-xs leading-5",

      // Specialized Styles
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      caption: "text-xs text-muted-foreground",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      link: "text-primary underline-offset-4 hover:underline",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
      success: "text-green-600 dark:text-green-400",
      warning: "text-yellow-600 dark:text-yellow-400",
    },
  },
  defaultVariants: {
    variant: "body",
    align: "left",
    weight: "normal",
    color: "default",
  },
});

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
  children: React.ReactNode;
}

/**
 * Typography Component
 * Base component for all text elements with consistent styling
 */
export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, weight, color, as, children, ...props }, ref) => {
    const Component = (as || getDefaultElement(variant || "body")) as React.ElementType;

    return React.createElement(
      Component,
      {
        ref,
        className: cn(typographyVariants({ variant, align, weight, color: color as typeof color }), className),
        ...props,
      },
      children
    );
  }
);

Typography.displayName = "Typography";

/**
 * Helper function to determine default HTML element based on variant
 */
function getDefaultElement(variant: string): React.ElementType {
  const elementMap: Record<string, React.ElementType> = {
    "display-2xl": "h1",
    "display-xl": "h1",
    "display-lg": "h1",
    "display-md": "h1",
    "display-sm": "h1",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    lead: "p",
    large: "div",
    small: "small",
    muted: "p",
    caption: "p",
    code: "code",
    link: "a",
    body: "p",
    "body-lg": "p",
    "body-sm": "p",
    "body-xs": "p",
  };

  return elementMap[variant] || "p";
}

/**
 * Pre-configured Typography Components
 * For convenience and semantic clarity
 */

export const Display = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
  <Typography ref={ref} variant="display-lg" className={className} {...props} />
));
Display.displayName = "Display";

export const Heading = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }
>(({ level = 1, className, ...props }, ref) => {
  const variant = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return <Typography ref={ref} variant={variant} className={className} {...props} />;
});
Heading.displayName = "Heading";

export const Text = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Typography ref={ref} variant="body" className={className} {...props} />
  )
);
Text.displayName = "Text";

export const Lead = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Typography ref={ref} variant="lead" className={className} {...props} />
  )
);
Lead.displayName = "Lead";

export const Small = React.forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Typography ref={ref} variant="small" className={className} {...props} />
  )
);
Small.displayName = "Small";

export const Muted = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Typography ref={ref} variant="muted" className={className} {...props} />
  )
);
Muted.displayName = "Muted";

export const Caption = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Typography ref={ref} variant="caption" className={className} {...props} />
  )
);
Caption.displayName = "Caption";

export const Code = React.forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Typography ref={ref} variant="code" className={className} {...props} />
  )
);
Code.displayName = "Code";
