import { integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk User ID
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id)
      .notNull(),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),
    role: text("role").$type<"owner" | "member">().default("member").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.workspaceId, t.userId] }),
  })
);

export const links = pgTable("links", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  shortCode: text("short_code").unique().notNull(),
  longUrl: text("long_url").notNull(),
  clickCount: integer("click_count").default(0).notNull(),
  title: text("title"),
  description: text("description"),
  imageUrl: text("image_url"),
  // Tags column - uncomment after running migration: ALTER TABLE "links" ADD COLUMN IF NOT EXISTS "tags" TEXT;
  tags: text("tags"), // Comma-separated tags
  // UPI Fields
  type: text("type").$type<"standard" | "upi">().default("standard").notNull(),
  upiVpa: text("upi_vpa"),
  upiName: text("upi_name"),
  upiAmount: text("upi_amount"),
  upiNote: text("upi_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const geoRules = pgTable("geo_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkId: uuid("link_id")
    .references(() => links.id, { onDelete: "cascade" })
    .notNull(),
  stateName: text("state_name").notNull(), // e.g. "Maharashtra"
  targetUrl: text("target_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const utmTemplates = pgTable("utm_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  name: text("name").notNull(), // e.g., "Instagram Bio"
  source: text("source"),
  medium: text("medium"),
  campaign: text("campaign"),
  term: text("term"),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Basic Analytics Table (Partitioning strategy would be needed for scale but MVP starts here)
export const analytics = pgTable("analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkId: uuid("link_id")
    .references(() => links.id)
    .notNull(),
  ip: text("ip"),
  country: text("country"),
  city: text("city"),
  region: text("region"), // State Name
  continent: text("continent"),
  device: text("device"), // mobile, desktop
  os: text("os"),
  browser: text("browser"),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
