# Design System Quick Reference

Quick reference guide for common design system patterns.

## Import Statement

```tsx
import {
  // Typography
  Typography, Heading, Text, Muted, Lead, Small, Caption, Code,
  // Layout
  Container, Section, Stack, HStack, VStack, Grid,
  // Utilities
  Spacer, Divider,
} from "@/components/design-system";
```

## Common Patterns

### Page Layout

```tsx
<Section spacing="lg">
  <Container>
    <Stack gap={8}>
      <Heading level={1}>Page Title</Heading>
      <Text>Page description</Text>
      {/* Content */}
    </Stack>
  </Container>
</Section>
```

### Card Header

```tsx
<Stack gap={2}>
  <Heading level={3}>Card Title</Heading>
  <Muted>Card description</Muted>
</Stack>
```

### Button Row

```tsx
<HStack justify="end" gap={2}>
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</HStack>
```

### Form Layout

```tsx
<Stack gap={6}>
  <Stack gap={4}>
    <Label>Field Label</Label>
    <Input />
  </Stack>
  <Divider />
  <HStack justify="end" gap={2}>
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </HStack>
</Stack>
```

### Grid Layout

```tsx
<Grid cols={3} gap={4}>
  {items.map((item) => (
    <Card key={item.id}>{/* content */}</Card>
  ))}
</Grid>
```

### Section with Background

```tsx
<Section spacing="md" background="muted">
  <Text>Content in muted section</Text>
</Section>
```

### Spacing Between Elements

```tsx
<div>
  <Text>First element</Text>
  <Spacer size={8} />
  <Text>Second element</Text>
</div>
```

## Typography Variants

| Variant | Use Case | Example |
|---------|----------|---------|
| `display-lg` | Hero headings | Landing page titles |
| `h1` - `h6` | Page/section headings | `<Heading level={1}>` |
| `body` | Regular text | `<Text>` |
| `body-sm` | Smaller text | Fine print |
| `muted` | Secondary text | `<Muted>` |
| `lead` | Introductory text | Page descriptions |
| `caption` | Small labels | Form hints |
| `code` | Code snippets | `<Code>` |

## Spacing Scale

| Value | Size | Use Case |
|-------|------|----------|
| `0` | 0px | No spacing |
| `1` | 4px | Tight spacing |
| `2` | 8px | Small spacing |
| `4` | 16px | Default spacing |
| `6` | 24px | Medium spacing |
| `8` | 32px | Large spacing |
| `12` | 48px | Extra large spacing |

## Container Sizes

| Size | Max Width | Use Case |
|------|-----------|----------|
| `sm` | 640px | Forms, narrow content |
| `md` | 768px | Medium content |
| `lg` | 1024px | Wide content |
| `xl` | 1280px | **Default** - Most pages |
| `2xl` | 1536px | Very wide content |
| `full` | 100% | Full width |

## Grid Columns

| Cols | Mobile | Tablet | Desktop | Use Case |
|------|--------|--------|---------|----------|
| `1` | 1 | 1 | 1 | Single column |
| `2` | 1 | 2 | 2 | Two columns |
| `3` | 1 | 2 | 3 | Three columns |
| `4` | 1 | 2 | 4 | Four columns |
| `6` | 1 | 2 | 3 | Six columns |

## Section Spacing

| Spacing | Mobile | Desktop | Use Case |
|---------|--------|---------|----------|
| `none` | 0 | 0 | No spacing |
| `sm` | 32px | 48px | Small sections |
| `md` | 48px | 64px | **Default** |
| `lg` | 64px | 96px | Large sections |
| `xl` | 96px | 128px | Hero sections |

## Color Variants

| Variant | Use Case |
|---------|----------|
| `default` | Regular text |
| `muted` | Secondary text |
| `primary` | Brand color |
| `secondary` | Accent color |
| `destructive` | Errors, warnings |
| `success` | Success messages |
| `warning` | Warning messages |

## Cheat Sheet

```tsx
// Page structure
<Section spacing="lg">
  <Container>
    <Stack gap={8}>
      {/* Header */}
      <Stack gap={2}>
        <Heading level={1}>Title</Heading>
        <Muted>Description</Muted>
      </Stack>
      
      {/* Content */}
      <Grid cols={3} gap={4}>
        {/* Items */}
      </Grid>
      
      {/* Actions */}
      <HStack justify="end" gap={2}>
        <Button>Action</Button>
      </HStack>
    </Stack>
  </Container>
</Section>
```
