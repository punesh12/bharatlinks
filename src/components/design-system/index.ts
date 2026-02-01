/**
 * Design System Components
 * Centralized exports for all design system components
 */

// Typography
export {
  Typography,
  Display,
  Heading,
  Text,
  Lead,
  Small,
  Muted,
  Caption,
  Code,
  type TypographyProps,
} from "./typography";

// Layout
export { Container, type ContainerProps } from "./container";
export { Section, type SectionProps } from "./section";
export { Stack, HStack, VStack, type StackProps } from "./stack";
export { Grid, type GridProps } from "./grid";
export { Spacer, type SpacerProps } from "./spacer";
export { Divider, type DividerProps } from "./divider";

// Re-export design tokens and theme
export { tokens } from "@/lib/design-system/tokens";
export { theme } from "@/lib/design-system/theme";
