"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Container, type ContainerProps } from "./container";

const sectionVariants = cva("", {
  variants: {
    spacing: {
      none: "py-0",
      sm: "py-8 md:py-12",
      md: "py-12 md:py-16",
      lg: "py-16 md:py-24",
      xl: "py-24 md:py-32",
    },
    background: {
      default: "bg-background",
      muted: "bg-muted",
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
    },
  },
  defaultVariants: {
    spacing: "md",
    background: "default",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  container?: boolean;
  containerSize?: ContainerProps["size"];
  containerPadding?: ContainerProps["padding"];
  as?: React.ElementType;
}

/**
 * Section Component
 * Provides consistent spacing and background for page sections
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      spacing,
      background,
      container = true,
      containerSize,
      containerPadding,
      as = "section",
      children,
      ...props
    },
    ref
  ) => {
    const content = container ? (
      <Container size={containerSize} padding={containerPadding}>
        {children}
      </Container>
    ) : (
      children
    );

    const Component = as as React.ElementType;

    return (
      <Component
        ref={ref}
        className={cn(sectionVariants({ spacing, background }), className)}
        {...props}
      >
        {content}
      </Component>
    );
  }
);

Section.displayName = "Section";
