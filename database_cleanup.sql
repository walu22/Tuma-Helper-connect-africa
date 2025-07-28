-- Database Cleanup Script for Duplicate Services
-- Run this script in your Supabase SQL editor to remove duplicate services

-- Step 1: Check for duplicates before cleanup
SELECT 
  title, 
  provider_id, 
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as service_ids
FROM services 
WHERE title IN ('Deep House Cleaning', 'Plumbing Repairs', 'Computer Repair & Setup', 'WiFi Network Setup', 'Mathematics Tutoring', 'English Language Tutoring')
GROUP BY title, provider_id
HAVING COUNT(*) > 1
ORDER BY title;

-- Step 2: Remove duplicate service images for services we're about to delete
DELETE FROM service_images 
WHERE service_id IN (
  SELECT s2.id 
  FROM services s1
  JOIN services s2 ON (s1.title = s2.title AND s1.provider_id = s2.provider_id)
  WHERE s1.created_at < s2.created_at
    AND s1.title IN ('Deep House Cleaning', 'Plumbing Repairs', 'Computer Repair & Setup', 'WiFi Network Setup', 'Mathematics Tutoring', 'English Language Tutoring')
);

-- Step 3: Remove duplicate services, keeping only the earliest created one for each title
DELETE FROM services 
WHERE id IN (
  SELECT s2.id 
  FROM services s1
  JOIN services s2 ON (s1.title = s2.title AND s1.provider_id = s2.provider_id)
  WHERE s1.created_at < s2.created_at
    AND s1.title IN ('Deep House Cleaning', 'Plumbing Repairs', 'Computer Repair & Setup', 'WiFi Network Setup', 'Mathematics Tutoring', 'English Language Tutoring')
);

-- Step 4: Verify cleanup - this should return 0 rows if successful
SELECT 
  title, 
  provider_id, 
  COUNT(*) as remaining_count
FROM services 
WHERE title IN ('Deep House Cleaning', 'Plumbing Repairs', 'Computer Repair & Setup', 'WiFi Network Setup', 'Mathematics Tutoring', 'English Language Tutoring')
GROUP BY title, provider_id
HAVING COUNT(*) > 1;

-- Step 5: Display final count of each service
SELECT 
  title,
  COUNT(*) as total_count
FROM services 
WHERE title IN ('Deep House Cleaning', 'Plumbing Repairs', 'Computer Repair & Setup', 'WiFi Network Setup', 'Mathematics Tutoring', 'English Language Tutoring')
GROUP BY title
ORDER BY title;