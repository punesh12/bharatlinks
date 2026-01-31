# BharatLinks 🇮🇳

The Smart Link Management Platform Operating at the Speed of Indian Business.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (via Drizzle ORM)
- **Cache**: Redis (Upstash) - for high-performance link redirection
- **Auth**: Clerk
- **Styling**: Tailwind CSS + Shadcn/UI

## Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

- `DATABASE_URL`: Your Supabase/Neon connection string.
- `NEXT_PUBLIC_CLERK_...`: Your Clerk keys.
- `UPSTASH_REDIS_REST_URL`: Your Upstash Redis REST URL (optional, for caching).
- `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis REST token (optional, for caching).

### 2. Install Dependencies

Install required packages:

```bash
npm install
```

**Note**: Redis caching is optional but recommended for production. To enable it:

```bash
npm install @upstash/redis
```

Then set up Upstash Redis and add credentials to your `.env` file (see Redis configuration below).

### 3. Database Migration

Push the schema to your database:

```bash
npx drizzle-kit push
```

### 4. Redis Configuration (Optional)

Redis caching significantly improves redirect performance. To enable:

1. Create an account at [Upstash](https://upstash.com)
2. Create a Redis database (Mumbai region recommended)
3. Copy the REST URL and Token
4. Add to your `.env` file:
   ```env
   UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-token-here"
   ```

The application works without Redis but will use database queries for all redirects.

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Documentation

- [MVP Implementation Plan](./docs/mvp_implementation_plan.md)
- [Redis Caching Guide](./docs/redis_caching.md)
- [Tech Stack](./docs/tech_stack.md)
- [Product Roadmap](./docs/product_roadmap.md)
- [Business Model](./docs/business_model.md)

## Features Implemented

- **Authentication**: Sign Up/In with Clerk.
- **Workspaces**: Create, edit, delete, and switch between workspaces.
- **Link Shortening**: Create short links with custom aliases.
- **UTM Templates**: Save UTM parameters as templates for one-click application.
- **Analytics**: Click tracking with device, browser, location, and referrer data.
- **Redis Caching**: High-performance link redirection with Redis caching (<50ms latency).
- **Team Collaboration**: Invite team members, role-based permissions, activity logs.
- **Plan Management**: Subscription tiers with feature limits and usage tracking.
- **UPI Express Links**: Create payment links that open directly in UPI apps.
- **QR Codes**: Generate QR codes for every link.
- **Link Management**: Edit, delete, and manage links with tags and custom metadata.
