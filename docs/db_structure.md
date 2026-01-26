# Database Structure

The project uses **PostgreSQL** with **Drizzle ORM**.

## Tables

### 1. `users`

Synced from Clerk.

- `id` (text, PK): Clerk User ID.
- `email` (text): User email.
- `created_at` (timestamp).

### 2. `workspaces`

Groups links.

- `id` (uuid, PK).
- `name` (text).
- `owner_id` (text, FK -> users.id).
- `created_at` (timestamp).

### 3. `workspace_members`

Many-to-many relationship for team access (MVP: Owner only).

- `workspace_id` (uuid, FK -> workspaces.id).
- `user_id` (text, FK -> users.id).
- `role` (text): 'owner' | 'member'.
- `joined_at` (timestamp).
- PK: (workspace_id, user_id).

### 4. `links`

The core short URLs.

- `id` (uuid, PK).
- `workspace_id` (uuid, FK -> workspaces.id).
- `short_code` (text, Unique): The slug (e.g., `xyz`).
- `long_url` (text): Destination.
- `click_count` (integer): Total clicks.
- `created_at` (timestamp).

### 5. `utm_templates`

Saved UTM presets.

- `id` (uuid, PK).
- `workspace_id` (uuid, FK -> workspaces.id).
- `name` (text): Template highlight.
- `source`, `medium`, `campaign`, `term`, `content` (text).

### 6. `analytics`

Click events (Raw).

- `id` (uuid, PK).
- `link_id` (uuid, FK -> links.id).
- `ip`, `country`, `city`, `device`, `os`, `referrer` (text).
- `timestamp` (timestamp).

## Relationships

- **User** -> has many -> **Workspaces** (via `workspace_members`).
- **Workspace** -> has many -> **Links**.
- **Link** -> has many -> **Analytics** events.
