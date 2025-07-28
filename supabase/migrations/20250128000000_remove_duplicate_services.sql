-- Remove duplicate services that were created by multiple migration files
-- This will keep only the first occurrence of each service based on created_at timestamp

-- First, identify and remove duplicate service images for services we're about to delete
DELETE FROM service_images 
WHERE service_id IN (
  SELECT s2.id 
  FROM services s1, services s2 
  WHERE s1.title = s2.title 
    AND s1.provider_id = s2.provider_id 
    AND s1.created_at < s2.created_at
    AND s1.title IN ('Deep House Cleaning', 'Plumbing Repairs', 'Computer Repair & Setup', 'WiFi Network Setup', 'Mathematics Tutoring', 'English Language Tutoring')
);

-- Remove duplicate services, keeping only the earliest created one for each title
DELETE FROM services 
WHERE id IN (
  SELECT s2.id 
  FROM services s1, services s2 
  WHERE s1.title = s2.title 
    AND s1.provider_id = s2.provider_id 
    AND s1.created_at < s2.created_at
    AND s1.title IN ('Deep House Cleaning', 'Plumbing Repairs', 'Computer Repair & Setup', 'WiFi Network Setup', 'Mathematics Tutoring', 'English Language Tutoring')
);

-- Verify the cleanup by checking that each service title appears only once per provider
-- This query should return 0 rows if the cleanup was successful
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT title, provider_id, COUNT(*) as cnt
    FROM services 
    WHERE title IN ('Deep House Cleaning', 'Plumbing Repairs', 'Computer Repair & Setup', 'WiFi Network Setup', 'Mathematics Tutoring', 'English Language Tutoring')
    GROUP BY title, provider_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Warning: % duplicate service entries still exist', duplicate_count;
  ELSE
    RAISE NOTICE 'Success: All duplicate services have been removed';
  END IF;
END $$;