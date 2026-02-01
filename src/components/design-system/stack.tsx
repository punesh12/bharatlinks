"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stackVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
      "row-reverse": "flex-row-reverse",
      "column-reverse": "flex-col-reverse",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    gap: {
      0: "gap-0",
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
      6: "gap-6",
      8: "gap-8",
      10: "gap-10",
      12: "gap-12",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "column",
    align: "start",
    justify: "start",
    gap: 4,
    wrap: false,
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

/**
 * Stack Component
 * Flexible layout component for arranging children with consistent spacing
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, align, justify, gap, wrap, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(stackVariants({ direction, align, justify, gap, wrap }), className)}
        {...props}
      />
    );
  }
);

Stack.displayName = "Stack";

/**
 * HStack - Horizontal Stack
 * Convenience component for horizontal layouts
 */
export const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  ({ className, ...props }, ref) => {
    return <Stack ref={ref} direction="row" className={className} {...props} />;
  }
);

HStack.displayName = "HStack";

/**
 * VStack - Vertical Stack
 * Convenience component for vertical layouts
 */
export const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  ({ className, ...props }, ref) => {
    return <Stack ref={ref} direction="column" className={className} {...props} />;
  }
);

VStack.displayName = "VStack";
