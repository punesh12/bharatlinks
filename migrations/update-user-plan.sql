-- SQL Script to Update User Plan for Testing
-- Run this in your Supabase SQL Editor

-- Step 1: Find your user ID (replace 'your-email@example.com' with your actual email)
-- This will show your Clerk User ID which is stored in the users table
SELECT id, email, plan_tier, plan_start_date, plan_end_date 
FROM users 
WHERE email = 'your-email@example.com';

-- Step 2: Update your plan to a specific tier
-- Replace 'YOUR_CLERK_USER_ID' with your actual Clerk User ID from Step 1
-- Valid plan tiers: 'free', 'starter', 'pro', 'organization'

-- Example: Update to Starter plan
UPDATE users 
SET 
  plan_tier = 'starter',
  plan_start_date = NOW(),
  plan_end_date = NOW() + INTERVAL '1 month'
WHERE id = 'YOUR_CLERK_USER_ID';

-- Example: Update to Pro plan
-- UPDATE users 
-- SET 
--   plan_tier = 'pro',
--   plan_start_date = NOW(),
--   plan_end_date = NOW() + INTERVAL '1 month'
-- WHERE id = 'YOUR_CLERK_USER_ID';

-- Example: Update to Organization plan (unlimited)
-- UPDATE users 
-- SET 
--   plan_tier = 'organization',
--   plan_start_date = NOW(),
--   plan_end_date = NULL  -- No expiry for organization
-- WHERE id = 'YOUR_CLERK_USER_ID';

-- Example: Reset back to Free plan
-- UPDATE users 
-- SET 
--   plan_tier = 'free',
--   plan_start_date = NULL,
--   plan_end_date = NULL
-- WHERE id = 'YOUR_CLERK_USER_ID';

-- Step 3: Verify the update
SELECT id, email, plan_tier, plan_start_date, plan_end_date 
FROM users 
WHERE id = 'YOUR_CLERK_USER_ID';
