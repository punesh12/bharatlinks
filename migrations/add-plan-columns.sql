-- Migration: Add plan-related columns to users table
-- Run this in your Supabase SQL editor or via psql

-- Add plan_tier column with default value 'free'
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "plan_tier" TEXT DEFAULT 'free' NOT NULL;

-- Add plan_start_date column (nullable)
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "plan_start_date" TIMESTAMP;

-- Add plan_end_date column (nullable)
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "plan_end_date" TIMESTAMP;

-- Update existing users to have 'free' plan if not set
UPDATE "users" 
SET "plan_tier" = 'free' 
WHERE "plan_tier" IS NULL;

-- Add constraint to ensure plan_tier is one of the valid values
ALTER TABLE "users" 
ADD CONSTRAINT IF NOT EXISTS "users_plan_tier_check" 
CHECK ("plan_tier" IN ('free', 'starter', 'pro', 'organization'));
