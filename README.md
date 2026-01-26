# BharatLinks 🇮🇳

The Smart Link Management Platform Operating at the Speed of Indian Business.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (via Drizzle ORM)
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

### 2. Database Migration

Push the schema to your database:

```bash
npx drizzle-kit push
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Features Implemented

- **Authentication**: Sign Up/In with Clerk.
- **Workspaces**: Create and switch between workspaces.
- **Link Shortening**: Create short links.
- **UTM Templates**: Save UTM parameters as templates for one-click application.
- **Analytics**: Basic click tracking and aggregate dashboard.
- **Redirection**: Fast server-side redirection (ready for Edge).
