# Design System Migration Example

This document shows a practical example of migrating an existing component to use the new design system.

## Before: Original Component

```tsx
// src/app/app/[workspaceId]/links/page.tsx (Before)
import { Suspense } from "react";
import { LinkCard } from "@/components/links/link-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { getLinks, getAllTags } from "@/lib/actions/links";
import { getUtmTemplates } from "@/lib/actions/utms";
import { LinksFilters } from "@/components/links/links-filters";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import dynamic from "next/dynamic";

const CreateLinkModal = dynamic(() =>
  import("@/components/create-link-modal").then((m) => m.CreateLinkModal)
);

const LinksPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    tags?: string;
  }>;
}) => {
  const { workspaceId } = await params;
  const { page: pageParam, search, sortBy, sortOrder, tags: tagsParam } = await searchParams;

  const page = parseInt(pageParam || "1", 10);
  const tags = tagsParam?.split(",").filter(Boolean) || [];

  const [linksData, tagsData, templatesData] = await Promise.all([
    getLinks(workspaceId, { page, search, sortBy, sortOrder, tags }),
    getAllTags(workspaceId),
    getUtmTemplates(workspaceId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Links</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your shortened links
          </p>
        </div>
        <CreateLinkModal
          workspaceId={workspaceId}
          templates={templatesData}
        />
      </div>

      <ErrorBoundary>
        <Suspense fallback={<div>Loading filters...</div>}>
          <LinksFilters tags={tagsData} />
        </Suspense>
      </ErrorBoundary>

      {linksData.links.length === 0 ? (
        <EmptyState
          title="No links found"
          description="Create your first short link to get started"
        />
      ) : (
        <>
          <div className="grid gap-4">
            {linksData.links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={linksData.totalPages}
            baseUrl={`/app/${workspaceId}/links`}
          />
        </>
      )}
    </div>
  );
};

export default LinksPage;
```

## After: Using Design System

```tsx
// src/app/app/[workspaceId]/links/page.tsx (After)
import { Suspense } from "react";
import { LinkCard } from "@/components/links/link-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { getLinks, getAllTags } from "@/lib/actions/links";
import { getUtmTemplates } from "@/lib/actions/utms";
import { LinksFilters } from "@/components/links/links-filters";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import {
  Section,
  Container,
  Stack,
  HStack,
  Grid,
  Heading,
  Text,
  Muted,
} from "@/components/design-system";
import dynamic from "next/dynamic";

const CreateLinkModal = dynamic(() =>
  import("@/components/create-link-modal").then((m) => m.CreateLinkModal)
);

const LinksPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    tags?: string;
  }>;
}) => {
  const { workspaceId } = await params;
  const { page: pageParam, search, sortBy, sortOrder, tags: tagsParam } = await searchParams;

  const page = parseInt(pageParam || "1", 10);
  const tags = tagsParam?.split(",").filter(Boolean) || [];

  const [linksData, tagsData, templatesData] = await Promise.all([
    getLinks(workspaceId, { page, search, sortBy, sortOrder, tags }),
    getAllTags(workspaceId),
    getUtmTemplates(workspaceId),
  ]);

  return (
    <Section spacing="lg">
      <Container>
        <Stack gap={6}>
          {/* Header Section */}
          <HStack align="center" justify="between" gap={4}>
            <Stack gap={2}>
              <Heading level={1}>Links</Heading>
              <Muted>Manage and track your shortened links</Muted>
            </Stack>
            <CreateLinkModal
              workspaceId={workspaceId}
              templates={templatesData}
            />
          </HStack>

          {/* Filters */}
          <ErrorBoundary>
            <Suspense fallback={<div>Loading filters...</div>}>
              <LinksFilters tags={tagsData} />
            </Suspense>
          </ErrorBoundary>

          {/* Content */}
          {linksData.links.length === 0 ? (
            <EmptyState
              title="No links found"
              description="Create your first short link to get started"
            />
          ) : (
            <Stack gap={6}>
              <Grid cols={1} gap={4}>
                {linksData.links.map((link) => (
                  <LinkCard key={link.id} link={link} />
                ))}
              </Grid>
              <Pagination
                currentPage={page}
                totalPages={linksData.totalPages}
                baseUrl={`/app/${workspaceId}/links`}
              />
            </Stack>
          )}
        </Stack>
      </Container>
    </Section>
  );
};

export default LinksPage;
```

## Key Changes

### 1. **Replaced Custom Layout with Design System Components**

**Before:**
```tsx
<div className="space-y-6">
  {/* content */}
</div>
```

**After:**
```tsx
<Section spacing="lg">
  <Container>
    <Stack gap={6}>
      {/* content */}
    </Stack>
  </Container>
</Section>
```

### 2. **Replaced Typography with Design System**

**Before:**
```tsx
<h1 className="text-3xl font-bold tracking-tight">Links</h1>
<p className="text-muted-foreground mt-2">
  Manage and track your shortened links
</p>
```

**After:**
```tsx
<Heading level={1}>Links</Heading>
<Muted>Manage and track your shortened links</Muted>
```

### 3. **Replaced Flex Layout with HStack**

**Before:**
```tsx
<div className="flex items-center justify-between">
  <div>
    {/* content */}
  </div>
  <CreateLinkModal />
</div>
```

**After:**
```tsx
<HStack align="center" justify="between" gap={4}>
  <Stack gap={2}>
    {/* content */}
  </Stack>
  <CreateLinkModal />
</HStack>
```

### 4. **Replaced Grid with Design System Grid**

**Before:**
```tsx
<div className="grid gap-4">
  {linksData.links.map((link) => (
    <LinkCard key={link.id} link={link} />
  ))}
</div>
```

**After:**
```tsx
<Grid cols={1} gap={4}>
  {linksData.links.map((link) => (
    <LinkCard key={link.id} link={link} />
  ))}
</Grid>
```

## Benefits

1. **Consistency**: All spacing uses the design system's gap scale
2. **Maintainability**: Changes to spacing/typography happen in one place
3. **Type Safety**: TypeScript ensures correct prop usage
4. **Responsive**: Grid and Stack components handle responsive behavior automatically
5. **Semantic**: Better HTML structure with proper semantic elements

## Migration Checklist

When migrating a component:

- [ ] Replace custom spacing divs with `<Stack>` or `<HStack>`/`<VStack>`
- [ ] Replace headings (`<h1>`, `<h2>`, etc.) with `<Heading level={n}>`
- [ ] Replace paragraphs with `<Text>` or `<Muted>` for secondary text
- [ ] Wrap page content in `<Section>` and `<Container>`
- [ ] Replace custom grid layouts with `<Grid>`
- [ ] Use design system gap values instead of custom spacing classes
- [ ] Remove redundant Tailwind classes that are now handled by design system

## Additional Components Available

- `<Spacer>` - For flexible spacing between elements
- `<Divider>` - For visual separation with optional labels
- `<Grid>` - Responsive grid layouts
- Typography variants for all text needs

See `docs/design-system.md` for complete API documentation.
