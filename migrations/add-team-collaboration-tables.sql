-- Migration: Add team collaboration tables (invitations and activity logs)
-- Run this in your Supabase SQL editor or via psql

-- Create workspace_invitations table
CREATE TABLE IF NOT EXISTS "workspace_invitations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member' CHECK ("role" IN ('owner', 'member')),
  "invited_by" TEXT NOT NULL REFERENCES "users"("id"),
  "token" TEXT UNIQUE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'accepted', 'rejected', 'expired')),
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on token for fast lookups
CREATE INDEX IF NOT EXISTS "workspace_invitations_token_idx" ON "workspace_invitations"("token");

-- Create index on workspace_id and status for filtering pending invitations
CREATE INDEX IF NOT EXISTS "workspace_invitations_workspace_status_idx" ON "workspace_invitations"("workspace_id", "status");

-- Create index on email for user invitation lookups
CREATE INDEX IF NOT EXISTS "workspace_invitations_email_idx" ON "workspace_invitations"("email");

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "users"("id"),
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT,
  "metadata" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on workspace_id for filtering logs by workspace
CREATE INDEX IF NOT EXISTS "activity_logs_workspace_id_idx" ON "activity_logs"("workspace_id");

-- Create index on created_at for sorting and time-based queries
CREATE INDEX IF NOT EXISTS "activity_logs_created_at_idx" ON "activity_logs"("created_at" DESC);

-- Create composite index for common query pattern (workspace + user + time)
CREATE INDEX IF NOT EXISTS "activity_logs_workspace_user_created_idx" ON "activity_logs"("workspace_id", "user_id", "created_at" DESC);
