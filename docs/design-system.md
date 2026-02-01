# Design System Documentation

This document outlines the design system used throughout BharatLinks, providing consistent styling, typography, and reusable components.

## Table of Contents

1. [Typography](#typography)
2. [Theme & Tokens](#theme--tokens)
3. [Layout Components](#layout-components)
4. [Usage Examples](#usage-examples)

---

## Typography

The typography system provides consistent text styling across the application.

### Basic Usage

```tsx
import { Typography, Heading, Text, Muted } from "@/components/design-system";

// Using Typography component with variants
<Typography variant="h1">Main Heading</Typography>
<Typography variant="body" color="muted">Body text</Typography>

// Using pre-configured components
<Heading level={1}>Page Title</Heading>
<Text>Regular paragraph text</Text>
<Muted>Secondary information</Muted>
```

### Available Variants

#### Display Styles
- `display-2xl` - Large display text (60px)
- `display-xl` - Extra large display (48px)
- `display-lg` - Large display (36px)
- `display-md` - Medium display (30px)
- `display-sm` - Small display (24px)

#### Heading Styles
- `h1` - Heading 1 (36px/48px on large screens)
- `h2` - Heading 2 (30px)
- `h3` - Heading 3 (24px)
- `h4` - Heading 4 (20px)
- `h5` - Heading 5 (18px)
- `h6` - Heading 6 (16px)

#### Body Styles
- `body` - Base body text (16px)
- `body-lg` - Large body (18px)
- `body-sm` - Small body (14px)
- `body-xs` - Extra small body (12px)

#### Specialized Styles
- `lead` - Lead paragraph (20px, muted)
- `large` - Large text (18px, semibold)
- `small` - Small text (14px, medium)
- `muted` - Muted text (14px, muted color)
- `caption` - Caption text (12px, muted)
- `code` - Code snippet styling
- `link` - Link styling

### Typography Props

```tsx
interface TypographyProps {
  variant?: TypographyVariant;
  align?: "left" | "center" | "right" | "justify";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "default" | "muted" | "primary" | "secondary" | "destructive" | "success" | "warning";
  as?: React.ElementType; // Override default HTML element
  className?: string;
  children: React.ReactNode;
}
```

### Examples

```tsx
// Custom element
<Typography variant="h1" as="div">Custom Heading</Typography>

// Alignment
<Typography variant="body" align="center">Centered text</Typography>

// Color variants
<Typography variant="body" color="primary">Primary colored text</Typography>
<Typography variant="body" color="destructive">Error message</Typography>
```

---

## Theme & Tokens

Design tokens provide consistent values for spacing, colors, typography, and more.

### Accessing Tokens

```tsx
import { tokens, theme } from "@/lib/design-system/tokens";

// Typography tokens
const fontSize = tokens.typography.fontSize.lg;

// Spacing tokens
const spacing = tokens.spacing[8]; // 2rem

// Colors (from CSS variables)
const primaryColor = theme.colors.primary;
```

### Available Tokens

- **Typography**: Font families, sizes, weights
- **Spacing**: Consistent spacing scale (4px grid)
- **Radius**: Border radius values
- **Shadows**: Elevation shadows
- **Z-Index**: Layering scale
- **Breakpoints**: Responsive breakpoints
- **Duration**: Animation durations
- **Easing**: Animation easing functions

---

## Layout Components

### Container

Provides consistent max-width and padding for page content.

```tsx
import { Container } from "@/components/design-system";

<Container size="xl" padding="md">
  {/* Content */}
</Container>
```

**Props:**
- `size`: `"sm" | "md" | "lg" | "xl" | "2xl" | "full"` (default: `"xl"`)
- `padding`: `"none" | "sm" | "md" | "lg" | "xl"` (default: `"md"`)

### Section

Provides consistent spacing and background for page sections.

```tsx
import { Section } from "@/components/design-system";

<Section spacing="lg" background="muted" containerSize="xl">
  {/* Content */}
</Section>
```

**Props:**
- `spacing`: `"none" | "sm" | "md" | "lg" | "xl"` (default: `"md"`)
- `background`: `"default" | "muted" | "primary" | "secondary"` (default: `"default"`)
- `container`: `boolean` - Wrap content in Container (default: `true`)
- `containerSize`: Container size prop
- `containerPadding`: Container padding prop
- `as`: HTML element type (default: `"section"`)

### Stack

Flexible layout component for arranging children with consistent spacing.

```tsx
import { Stack, HStack, VStack } from "@/components/design-system";

// Vertical stack (default)
<Stack gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

// Horizontal stack
<HStack align="center" justify="between" gap={6}>
  <div>Left</div>
  <div>Right</div>
</HStack>

// Vertical stack (explicit)
<VStack gap={8}>
  <div>Top</div>
  <div>Bottom</div>
</VStack>
```

**Props:**
- `direction`: `"row" | "column" | "row-reverse" | "column-reverse"` (default: `"column"`)
- `align`: `"start" | "center" | "end" | "stretch" | "baseline"` (default: `"start"`)
- `justify`: `"start" | "center" | "end" | "between" | "around" | "evenly"` (default: `"start"`)
- `gap`: `0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12` (default: `4`)
- `wrap`: `boolean` (default: `false`)

---

## Usage Examples

### Complete Page Layout

```tsx
import { Section, Container, Heading, Text, Stack } from "@/components/design-system";

export default function Page() {
  return (
    <Section spacing="lg">
      <Container>
        <Stack gap={8}>
          <Heading level={1}>Page Title</Heading>
          <Text>Page description goes here.</Text>
          
          <Section spacing="md" background="muted" container={false}>
            <Container>
              <Text>Content in a muted section</Text>
            </Container>
          </Section>
        </Stack>
      </Container>
    </Section>
  );
}
```

### Card Layout

```tsx
import { Stack, Typography, HStack } from "@/components/design-system";
import { Card } from "@/components/ui/card";

<Card>
  <Stack gap={4}>
    <Typography variant="h3">Card Title</Typography>
    <Typography variant="body" color="muted">
      Card description
    </Typography>
    <HStack justify="end" gap={2}>
      <Button>Action</Button>
    </HStack>
  </Stack>
</Card>
```

### Responsive Typography

```tsx
import { Typography } from "@/components/design-system";

// Responsive heading
<Typography variant="h1" className="text-2xl md:text-4xl lg:text-5xl">
  Responsive Heading
</Typography>
```

---

## Best Practices

1. **Use Typography components** instead of raw HTML elements for consistent styling
2. **Use Container** for page-level content to ensure consistent max-widths
3. **Use Section** for major page sections with consistent spacing
4. **Use Stack** for component-level layouts instead of custom flex classes
5. **Leverage design tokens** for spacing, colors, and other values
6. **Combine components** - Stack, Container, and Section work well together

---

## Migration Guide

When migrating existing components:

1. Replace `<h1>`, `<h2>`, etc. with `<Heading level={1}>`, `<Heading level={2}>`
2. Replace `<p>` with `<Text>` or `<Typography variant="body">`
3. Replace custom spacing divs with `<Stack>` or `<HStack>`/`<VStack>`
4. Wrap page content in `<Container>` and sections in `<Section>`
5. Use design tokens instead of hardcoded values

---

### Grid

Responsive grid layout with consistent spacing.

```tsx
import { Grid } from "@/components/design-system";

<Grid cols={3} gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

**Props:**
- `cols`: `1 | 2 | 3 | 4 | 5 | 6 | 12` - Number of columns (responsive)
- `gap`: `0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12` (default: `4`)
- `align`: `"start" | "center" | "end" | "stretch" | "baseline"` (default: `"stretch"`)
- `justify`: `"start" | "center" | "end" | "between" | "around" | "evenly"` (default: `"start"`)

### Spacer

Flexible spacing component for consistent vertical or horizontal spacing.

```tsx
import { Spacer } from "@/components/design-system";

<div>
  <Text>Content above</Text>
  <Spacer size={8} />
  <Text>Content below</Text>
</div>
```

**Props:**
- `size`: `0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24` (default: `4`)
- `axis`: `"vertical" | "horizontal"` (default: `"vertical"`)

### Divider

Visual separator with optional label.

```tsx
import { Divider } from "@/components/design-system";

<Divider spacing="lg" />
<Divider label="Or" spacing="md" variant="muted" />
```

**Props:**
- `orientation`: `"horizontal" | "vertical"` (default: `"horizontal"`)
- `spacing`: `"none" | "sm" | "md" | "lg" | "xl"` (default: `"md"`)
- `variant`: `"default" | "muted" | "primary" | "secondary"` (default: `"default"`)
- `label`: `string` - Optional label text (horizontal only)

---

## Future Enhancements

- [ ] Add AspectRatio component for media
- [ ] Add more semantic color variants
- [ ] Add animation utilities
- [ ] Add responsive utilities
- [ ] Add skeleton loading components
