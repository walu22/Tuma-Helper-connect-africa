-- Insert exterior service categories
INSERT INTO public.service_categories (name, description, icon) VALUES
('Roofing', 'Professional roofing installation, repair, and maintenance services', 'home'),
('Concrete & Masonry', 'Concrete work, brickwork, and stone masonry services', 'building'),
('Fencing', 'Fence installation, repair, and maintenance services', 'fence'),
('Landscaping', 'Garden design, lawn care, and outdoor space transformation', 'tree-pine'),
('Exterior Painting', 'Professional exterior house painting and coating services', 'hammer'),
('Deck & Patio', 'Deck construction, patio installation, and outdoor living spaces', 'wrench')
ON CONFLICT (name) DO NOTHING;

-- Insert sample provider profiles for exterior services
INSERT INTO public.provider_profiles (
    user_id, 
    business_name, 
    bio, 
    years_of_experience, 
    hourly_rate, 
    rating, 
    total_jobs_completed,
    service_areas
) VALUES
(gen_random_uuid(), 'Elite Roofing Solutions', 'Professional roofing contractors with 15+ years experience in Windhoek area', 15, 350, 4.9, 127, ARRAY['Windhoek', 'Rehoboth']),
(gen_random_uuid(), 'Concrete Masters Namibia', 'Specialized concrete and masonry work for residential and commercial projects', 12, 280, 4.7, 94, ARRAY['Windhoek', 'Swakopmund']),
(gen_random_uuid(), 'Secure Fence Co.', 'Quality fencing solutions for homes and businesses across Namibia', 8, 250, 4.8, 156, ARRAY['Windhoek', 'Oshakati']),
(gen_random_uuid(), 'Desert Landscape Designs', 'Creating beautiful outdoor spaces adapted to Namibian climate', 10, 200, 4.6, 89, ARRAY['Windhoek', 'Swakopmund']),
(gen_random_uuid(), 'Pro Paint Exteriors', 'Professional exterior painting services with premium materials', 7, 180, 4.5, 73, ARRAY['Windhoek', 'Walvis Bay']),
(gen_random_uuid(), 'Outdoor Living Specialists', 'Custom decks, patios, and outdoor entertainment areas', 9, 320, 4.8, 102, ARRAY['Windhoek', 'Gobabis'])
ON CONFLICT (user_id) DO NOTHING;

-- Get the category and provider IDs for services insertion
WITH category_ids AS (
    SELECT name, id as category_id FROM public.service_categories 
    WHERE name IN ('Roofing', 'Concrete & Masonry', 'Fencing', 'Landscaping', 'Exterior Painting', 'Deck & Patio')
),
provider_ids AS (
    SELECT business_name, user_id as provider_id FROM public.provider_profiles 
    WHERE business_name IN ('Elite Roofing Solutions', 'Concrete Masters Namibia', 'Secure Fence Co.', 'Desert Landscape Designs', 'Pro Paint Exteriors', 'Outdoor Living Specialists')
)
INSERT INTO public.services (
    provider_id,
    category_id,
    title,
    description,
    price_from,
    price_to,
    price_unit,
    location,
    rating,
    total_reviews,
    is_available
) 
SELECT 
    p.provider_id,
    c.category_id,
    service_data.title,
    service_data.description,
    service_data.price_from,
    service_data.price_to,
    service_data.price_unit,
    service_data.location,
    service_data.rating,
    service_data.total_reviews,
    true
FROM (VALUES
    ('Elite Roofing Solutions', 'Roofing', 'Complete Roof Replacement', 'Full roof replacement with premium materials and 10-year warranty', 25000, 85000, 'per project', 'Windhoek', 4.9, 45),
    ('Elite Roofing Solutions', 'Roofing', 'Roof Repair & Maintenance', 'Professional roof repairs, leak fixes, and regular maintenance', 800, 5000, 'per service', 'Windhoek', 4.8, 67),
    ('Concrete Masters Namibia', 'Concrete & Masonry', 'Driveway Construction', 'Professional concrete driveway installation with decorative options', 8000, 25000, 'per project', 'Windhoek', 4.7, 34),
    ('Concrete Masters Namibia', 'Concrete & Masonry', 'Foundation Work', 'House foundations, slabs, and structural concrete work', 15000, 50000, 'per project', 'Windhoek', 4.6, 28),
    ('Secure Fence Co.', 'Fencing', 'Security Fence Installation', 'High-quality security fencing for residential and commercial properties', 350, 800, 'per meter', 'Windhoek', 4.8, 89),
    ('Secure Fence Co.', 'Fencing', 'Garden Fence & Gates', 'Decorative garden fencing with custom gate installations', 280, 600, 'per meter', 'Windhoek', 4.7, 112),
    ('Desert Landscape Designs', 'Landscaping', 'Complete Garden Makeover', 'Full landscape design and installation with drought-resistant plants', 12000, 45000, 'per project', 'Windhoek', 4.6, 41),
    ('Desert Landscape Designs', 'Landscaping', 'Lawn Installation & Care', 'Professional lawn installation and ongoing maintenance services', 150, 300, 'per sqm', 'Windhoek', 4.5, 76),
    ('Pro Paint Exteriors', 'Exterior Painting', 'House Exterior Painting', 'Complete exterior house painting with premium weather-resistant paint', 8000, 35000, 'per project', 'Windhoek', 4.5, 53),
    ('Pro Paint Exteriors', 'Exterior Painting', 'Roof Painting & Coating', 'Specialized roof painting and protective coating application', 3000, 12000, 'per project', 'Windhoek', 4.4, 39),
    ('Outdoor Living Specialists', 'Deck & Patio', 'Custom Deck Construction', 'Custom wooden and composite deck construction and installation', 18000, 65000, 'per project', 'Windhoek', 4.8, 47),
    ('Outdoor Living Specialists', 'Deck & Patio', 'Patio & Braai Area', 'Professional patio construction with built-in braai facilities', 12000, 40000, 'per project', 'Windhoek', 4.7, 38)
) AS service_data(business_name, category_name, title, description, price_from, price_to, price_unit, location, rating, total_reviews)
JOIN provider_ids p ON p.business_name = service_data.business_name
JOIN category_ids c ON c.name = service_data.category_name;