# MVP Implementation Plan (Phase 1)

This plan covers the development of the "Essentials" features using the defined Tech Stack.

## 1. Project Initialization

- [ ] **Repo Setup**: Initialize Next.js 14 App Router project with TypeScript.
- [ ] **UI Library**: Install Tailwind CSS, Shadcn/UI, and Lucide Icons.
- [ ] **Linting/Formatting**: Setup ESLint and Prettier.

## 2. Infrastructure & Database Setup

- [ ] **PostgreSQL**: Provision a Supabase project (Region: Mumbai).
- [ ] **Redis**: Provision Upstash Redis (Region: Mumbai).
- [ ] **Schema Design**: Drizzle ORM or Prisma setup.
  - `users`: id, email, plan_tier.
  - `workspaces`: id, name, owner_id, created_at.
  - `utm_templates`: id, workspace_id, name, source, medium, campaign.
  - `links`: id, short_code, long_url, workspace_id, click_count, created_at.
  - `analytics`: id, link_id, ip, country, device, os, timestamp.

## 3. Authentication (Clerk)

- [ ] **Integration**: Wrap app with ClerkProvider.
- [ ] **Sign In/Up Pages**: Custom branding.
- [ ] **Middleware**: Protect dashboard routes (`/app/*`).

## 4. Core Feature: Link Shortening & UTMs

- **Workspace UI**: Sidebar/Dropdown to switch active workspace. Create/Edit workspaces.
- **UTM Template UI**: Manage UTM templates (Scoped to Workspace).
- **API**: `POST /api/links` (Validate URL, Check Workspace Access, Generate slug).
- **Dashboard UI**: Display links belonging to the _current_ workspace.

## 5. Core Feature: Redirection Engine (The "Speed" Layer)

- [ ] **Middleware**: Create Vercel Edge Middleware.
- [ ] **Logic**:
  1.  Extract `slug` from path.
  2.  Check Redis for `slug`.
  3.  If hit -> Redirect (307).
  4.  If miss -> Check DB -> Cache in Redis -> Redirect.
  5.  Async: Push click event to Analytics Queue (Tinybird/Postgres).

## 6. Core Feature: Basic Analytics

- [ ] **Tracking**: Capture User-Agent, Referrer, IP (anonymized) on redirect.
- [ ] **Dashboard Charts**: Show line chart of clicks over last 7 days (Recharts).

## 7. MVP Deployment

- [ ] **Vercel Project**: Connect repo.
- [ ] **Environment Vars**: Set DB_URL, REDIS_URL, CLERK_KEYS.
- [ ] **Domain**: Connect custom domain (if any).
