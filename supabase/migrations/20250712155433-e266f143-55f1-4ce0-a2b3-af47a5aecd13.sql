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
  service_areas = ARRAY['Windhoek Central', 'Klein Windhoek', 'Ludwigsdorf', 'Olympia', 'Pioneers Park']
WHERE user_id = '6967cfd4-c459-4a20-a312-afdabb44389f';

-- Note: Services already inserted in previous migration (20250712154904-b078a802-93ec-4b4c-a733-0f8bc474ca0d.sql)
-- Removed duplicate INSERT statements to prevent duplicate services