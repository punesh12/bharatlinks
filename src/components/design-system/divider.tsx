"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const dividerVariants = cva("border-t", {
  variants: {
    orientation: {
      horizontal: "w-full border-t",
      vertical: "h-full w-0 border-l border-t-0",
    },
    spacing: {
      none: "my-0",
      sm: "my-2",
      md: "my-4",
      lg: "my-6",
      xl: "my-8",
    },
    variant: {
      default: "border-border",
      muted: "border-muted",
      primary: "border-primary",
      secondary: "border-secondary",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    spacing: "md",
    variant: "default",
  },
});

export interface DividerProps
  extends React.HTMLAttributes<HTMLHRElement>,
    VariantProps<typeof dividerVariants> {
  label?: string;
}

/**
 * Divider Component
 * Visual separator with optional label
 */
export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation, spacing, variant, label, ...props }, ref) => {
    if (label && orientation === "horizontal") {
      return (
        <div className={cn("relative flex items-center", spacing === "none" ? "my-0" : `my-${spacing === "sm" ? "2" : spacing === "lg" ? "6" : spacing === "xl" ? "8" : "4"}`)}>
          <hr
            ref={ref}
            className={cn(
              dividerVariants({ orientation, spacing: "none", variant }),
              "flex-1",
              className
            )}
            {...props}
          />
          <span className={cn("px-4 text-sm text-muted-foreground", variant === "primary" && "text-primary", variant === "secondary" && "text-secondary")}>
            {label}
          </span>
          <hr
            className={cn(
              dividerVariants({ orientation, spacing: "none", variant }),
              "flex-1"
            )}
          />
        </div>
      );
    }

    return (
      <hr
        ref={ref}
        className={cn(dividerVariants({ orientation, spacing, variant }), className)}
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";
