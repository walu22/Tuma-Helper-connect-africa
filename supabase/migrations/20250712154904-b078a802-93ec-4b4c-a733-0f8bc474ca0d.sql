-- Add sample service images for existing services
INSERT INTO service_images (service_id, image_url, is_primary) VALUES
-- Car Wash & Detailing
('9b0a56a7-055f-4985-88f0-33b9bee7834e', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true),
('9b0a56a7-055f-4985-88f0-33b9bee7834e', 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&q=80', false),

-- Mobile Hair Styling  
('c5fcb191-9f63-442f-b658-7d9c527cbf33', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80', true),
('c5fcb191-9f63-442f-b658-7d9c527cbf33', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80', false),

-- Furniture Moving Service
('50249bd1-df1e-4b44-8008-7d6c0aee8401', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80', true),
('50249bd1-df1e-4b44-8008-7d6c0aee8401', 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80', false),

-- Event Photography
('25d83712-c14a-4af4-a9c5-f376cdd79c86', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80', true),
('25d83712-c14a-4af4-a9c5-f376cdd79c86', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80', false),

-- Garden Maintenance
('89a7f876-bdf0-4ce1-96fe-dd0b5b133ec2', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', true),
('89a7f876-bdf0-4ce1-96fe-dd0b5b133ec2', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', false);

-- Add more complete provider profile data
UPDATE provider_profiles 
SET 
  business_name = 'Walker Services',
  bio = 'Professional multi-service provider with over 5 years of experience in Windhoek. Specializing in automotive, beauty, moving, events, and garden services.',
  years_of_experience = 5,
  rating = 4.6,
  total_jobs_completed = 142,
  is_available = true,
  service_areas = ARRAY['Windhoek Central', 'Klein Windhoek', 'Ludwigsdorf', 'Olympia', 'Pioneers Park'],
  service_cities = ARRAY['c4e891c8-14b5-4c12-8b5a-d89e5f8a9b7c']
WHERE user_id = '6967cfd4-c459-4a20-a312-afdabb44389f';

-- Add more diverse services to demonstrate the platform
INSERT INTO services (provider_id, category_id, title, description, price_from, price_to, price_unit, location, rating, total_reviews, is_available) VALUES
-- Home Services
('6967cfd4-c459-4a20-a312-afdabb44389f', 'c38fc7e7-04dc-4f34-aafb-136a8b97c5d7', 'Deep House Cleaning', 'Complete house cleaning service including bathrooms, kitchen, bedrooms, and living areas. Using eco-friendly products.', 300, 600, 'per visit', 'Windhoek', 4.7, 45, true),
('6967cfd4-c459-4a20-a312-afdabb44389f', 'c38fc7e7-04dc-4f34-aafb-136a8b97c5d7', 'Plumbing Repairs', 'Professional plumbing services for leaks, installations, and maintenance. Licensed and insured plumber.', 200, 500, 'per job', 'Windhoek', 4.8, 32, true),

-- Tech Support
('6967cfd4-c459-4a20-a312-afdabb44389f', 'a56a1269-3330-46c8-9462-331499bcf1b1', 'Computer Repair & Setup', 'Hardware and software troubleshooting, virus removal, data recovery, and new computer setup services.', 150, 400, 'per service', 'Windhoek', 4.5, 28, true),
('6967cfd4-c459-4a20-a312-afdabb44389f', 'a56a1269-3330-46c8-9462-331499bcf1b1', 'WiFi Network Setup', 'Professional WiFi network installation and optimization for homes and small businesses.', 250, 350, 'per setup', 'Windhoek', 4.6, 15, true),

-- Tutoring
('6967cfd4-c459-4a20-a312-afdabb44389f', 'bb25603b-4722-44d4-9c1d-83dbcca4515e', 'Mathematics Tutoring', 'High school and university level mathematics tutoring. Personalized learning approach with proven results.', 120, 180, 'per hour', 'Windhoek', 4.9, 67, true),
('6967cfd4-c459-4a20-a312-afdabb44389f', 'bb25603b-4722-44d4-9c1d-83dbcca4515e', 'English Language Tutoring', 'English language instruction for all levels. Grammar, conversation, and exam preparation.', 100, 150, 'per hour', 'Windhoek', 4.7, 43, true);

-- Add images for new services
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
WHERE s.title IN ('Deep House Cleaning', 'Plumbing Repairs', 'Computer Repair & Setup', 'WiFi Network Setup', 'Mathematics Tutoring', 'English Language Tutoring');