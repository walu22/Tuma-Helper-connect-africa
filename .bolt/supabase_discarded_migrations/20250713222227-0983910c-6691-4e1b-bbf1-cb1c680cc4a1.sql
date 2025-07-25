-- Re-add stock images to services
INSERT INTO service_images (service_id, image_url, is_primary) 
SELECT s.id, 
  CASE 
    WHEN s.title LIKE '%House Cleaning%' THEN 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80'
    WHEN s.title LIKE '%Plumbing%' THEN 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80'
    WHEN s.title LIKE '%Computer Repair%' THEN 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80'
    WHEN s.title LIKE '%WiFi%' THEN 'https://images.unsplash.com/photo-1606868306217-dbf5046868d2?w=600&q=80'
    WHEN s.title LIKE '%Mathematics%' THEN 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80'
    WHEN s.title LIKE '%English%' THEN 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80'
  END as image_url,
  true as is_primary
FROM services s 
WHERE s.title IN ('Deep House Cleaning', 'Plumbing Repairs', 'Computer Repair & Setup', 'WiFi Network Setup', 'Mathematics Tutoring', 'English Language Tutoring')
AND NOT EXISTS (
  SELECT 1 FROM service_images si 
  WHERE si.service_id = s.id
);