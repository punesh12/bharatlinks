# MVP Implementation Plan (Phase 1)

This plan covers the development of the "Essentials" features using the defined Tech Stack.

## 1. Project Initialization

- [ ] **Repo Setup**: Initialize Next.js 14 App Router project with TypeScript.
- [ ] **UI Library**: Install Tailwind CSS, Shadcn/UI, and Lucide Icons.
- [ ] **Linting/Formatting**: Setup ESLint and Prettier.

## 2. Infrastructure & Database Setup

- [x] **PostgreSQL**: Provision a Supabase project (Region: Mumbai).
- [x] **Redis**: Provision Upstash Redis (Region: Mumbai).
- [x] **Schema Design**: Drizzle ORM setup.
  - `users`: id, email, plan_tier, plan_start_date, plan_end_date.
  - `workspaces`: id, name, owner_id, created_at.
  - `workspace_members`: workspace_id, user_id, role, joined_at.
  - `workspace_invitations`: id, workspace_id, email, role, token, status, expires_at.
  - `utm_templates`: id, workspace_id, name, source, medium, campaign, term, content.
  - `links`: id, short_code, long_url, workspace_id, click_count, title, description, image_url, tags, type, upi_vpa, upi_name, upi_amount, upi_note, created_at.
  - `analytics`: id, link_id, ip, country, city, region, continent, device, os, browser, referrer, user_agent, timestamp.
  - `activity_logs`: id, workspace_id, user_id, action, entity_type, entity_id, metadata, created_at.

## 3. Authentication (Clerk)

- [x] **Integration**: Wrap app with ClerkProvider.
- [x] **Sign In/Up Pages**: Custom branding with email pre-fill support.
- [x] **Middleware**: Protect dashboard routes (`/app/*`).

## 4. Core Feature: Link Shortening & UTMs

- [x] **Workspace UI**: Sidebar/Dropdown to switch active workspace. Create/Edit/Delete workspaces.
- [x] **UTM Template UI**: Manage UTM templates (Scoped to Workspace) with modal interface.
- [x] **Server Actions**: Link creation, update, deletion with validation and permission checks.
- [x] **Dashboard UI**: Display links belonging to the _current_ workspace with filters, search, and sorting.
- [x] **Link Management**: Edit links, delete links, view QR codes, copy links.
- [x] **Tags System**: Add tags to links for organization and filtering.
- [x] **UPI Express Links**: Create UPI payment links that open directly in UPI apps.

## 5. Core Feature: Redirection Engine (The "Speed" Layer)

- [x] **Redis Caching**: Implemented Redis caching layer for link redirection.
- [x] **Logic**:
  1.  Extract `shortCode` from path.
  2.  Check Redis cache for link data.
  3.  If cache hit -> Redirect immediately (<50ms latency).
  4.  If cache miss -> Check PostgreSQL database.
  5.  Cache result in Redis (24h TTL for links, 1h for metadata).
  6.  Redirect to destination URL.
  7.  Async: Track click event and increment click count (non-blocking).
- [x] **Cache Management**: Automatic cache invalidation on link create/update/delete.
- [x] **Metadata Caching**: Separate cache for link metadata (title, description, images) for faster metadata generation.
- [ ] **Edge Middleware**: Future enhancement - Move redirect logic to Vercel Edge Middleware for even faster redirects.

## 6. Core Feature: Basic Analytics

- [x] **Tracking**: Capture User-Agent, Referrer, IP (anonymized), device, browser, OS, location on redirect.
- [x] **Dashboard Charts**: 
  - Line chart of clicks over time (Recharts).
  - Pie charts for browsers, operating systems, devices, countries, cities, continents.
  - Top referrers list.
  - Geographic breakdown (countries, cities, continents).
- [x] **Analytics Page**: Comprehensive analytics dashboard with filters and date ranges.

## 7. MVP Deployment

- [ ] **Vercel Project**: Connect repo.
- [x] **Environment Vars**: Documented in `.env.example`:
  - `DATABASE_URL`: PostgreSQL connection string.
  - `UPSTASH_REDIS_REST_URL`: Upstash Redis REST URL (optional).
  - `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis REST token (optional).
  - `NEXT_PUBLIC_CLERK_...`: Clerk authentication keys.
  - `NEXT_PUBLIC_APP_RESEND_API_KEY`: Resend API key for emails.
  - `NEXT_PUBLIC_APP_RESEND_FROM_EMAIL`: Email sender address.
- [ ] **Domain**: Connect custom domain (if any).

## 8. Additional Features Implemented

- [x] **Team Collaboration**: 
  - Invite team members via email.
  - Role-based permissions (owner/member).
  - Team activity logs.
  - Leave workspace functionality.
- [x] **Workspace Management**:
  - Edit workspace name (owners only).
  - Delete workspace with cascade deletion (owners only).
- [x] **Plan Management**:
  - Subscription tiers (Free, Starter, Pro, Organization).
  - Feature limits and usage tracking.
  - Plan usage display in sidebar.
  - Billing page with plan comparison.
- [x] **Email Notifications**: Resend integration for team invitations.
- [x] **Error Handling**: Comprehensive error handling with user-friendly messages.
