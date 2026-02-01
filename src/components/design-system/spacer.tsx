"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spacerVariants = cva("", {
  variants: {
    size: {
      0: "h-0",
      1: "h-1",
      2: "h-2",
      3: "h-3",
      4: "h-4",
      5: "h-5",
      6: "h-6",
      8: "h-8",
      10: "h-10",
      12: "h-12",
      16: "h-16",
      20: "h-20",
      24: "h-24",
    },
    axis: {
      vertical: "w-full",
      horizontal: "h-full w-0",
    },
  },
  defaultVariants: {
    size: 4,
    axis: "vertical",
  },
});

export interface SpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spacerVariants> {}

/**
 * Spacer Component
 * Flexible spacing component for consistent vertical or horizontal spacing
 */
export const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size, axis, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spacerVariants({ size, axis }), className)}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Spacer.displayName = "Spacer";
