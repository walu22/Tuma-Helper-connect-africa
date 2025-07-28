# Fix for Duplicate Services Issue

## Problem
"Plumbing Repairs" and "Mathematics Tutoring" (and other services) were appearing twice on the landing page due to duplicate entries in the database.

## Root Cause
Multiple Supabase migration files contained identical INSERT statements for the same services:
- `20250712154904-b078a802-93ec-4b4c-a733-0f8bc474ca0d.sql`
- `20250712155433-e266f143-55f1-4ce0-a2b3-af47a5aecd13.sql`

This caused the same services to be inserted multiple times into the database.

## Solution Applied

### 1. Fixed Migration Files
✅ **Removed duplicate INSERT statements** from `supabase/migrations/20250712155433-e266f143-55f1-4ce0-a2b3-af47a5aecd13.sql`

### 2. Added Frontend Duplicate Filtering
✅ **Enhanced FeaturedServices component** (`src/components/FeaturedServices.tsx`) with duplicate removal logic
✅ **Enhanced Services page** (`src/pages/Services.tsx`) with duplicate removal logic

The frontend now filters out duplicates based on `title` and `provider_id` before displaying services.

### 3. Created Database Cleanup Script
✅ **Created `database_cleanup.sql`** - A comprehensive SQL script to remove existing duplicates from the database

## How to Complete the Fix

### Step 1: Run Database Cleanup (Required)
1. Open your Supabase SQL Editor
2. Copy and paste the contents of `database_cleanup.sql`
3. Execute the script step by step
4. Verify that duplicates are removed

### Step 2: Deploy Frontend Changes (Already Done)
The frontend changes are already implemented and will prevent duplicates from being displayed even if they exist in the database.

## Verification
After running the database cleanup script:
1. Check the landing page - duplicates should be gone
2. Browse the services page - no duplicate entries should appear
3. The database should have only one instance of each service per provider

## Prevention
- Future migration files should check for existing data before inserting
- Consider adding unique constraints to prevent database-level duplicates:
  ```sql
  ALTER TABLE services ADD CONSTRAINT unique_service_per_provider 
  UNIQUE (title, provider_id);
  ```

## Files Modified
- `supabase/migrations/20250712155433-e266f143-55f1-4ce0-a2b3-af47a5aecd13.sql`
- `src/components/FeaturedServices.tsx`
- `src/pages/Services.tsx`
- `database_cleanup.sql` (new file)
- `supabase/migrations/20250128000000_remove_duplicate_services.sql` (new migration, requires Docker to apply)