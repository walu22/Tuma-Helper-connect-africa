-- Insert exterior service categories (fixed conflict handling)
INSERT INTO public.service_categories (name, description, icon) VALUES
('Roofing', 'Professional roofing installation, repair, and maintenance services', 'home'),
('Concrete & Masonry', 'Concrete work, brickwork, and stone masonry services', 'building'),
('Fencing', 'Fence installation, repair, and maintenance services', 'fence'),
('Landscaping', 'Garden design, lawn care, and outdoor space transformation', 'tree-pine'),
('Exterior Painting', 'Professional exterior house painting and coating services', 'hammer'),
('Deck & Patio', 'Deck construction, patio installation, and outdoor living spaces', 'wrench')
ON CONFLICT (id) DO NOTHING;

-- Create sample user IDs for providers
DO $$
DECLARE
    roofing_provider_id uuid := gen_random_uuid();
    concrete_provider_id uuid := gen_random_uuid();
    fence_provider_id uuid := gen_random_uuid();
    landscape_provider_id uuid := gen_random_uuid();
    paint_provider_id uuid := gen_random_uuid();
    deck_provider_id uuid := gen_random_uuid();
    roofing_category_id uuid;
    concrete_category_id uuid;
    fence_category_id uuid;
    landscape_category_id uuid;
    paint_category_id uuid;
    deck_category_id uuid;
BEGIN
    -- Get category IDs
    SELECT id INTO roofing_category_id FROM service_categories WHERE name = 'Roofing' LIMIT 1;
    SELECT id INTO concrete_category_id FROM service_categories WHERE name = 'Concrete & Masonry' LIMIT 1;
    SELECT id INTO fence_category_id FROM service_categories WHERE name = 'Fencing' LIMIT 1;
    SELECT id INTO landscape_category_id FROM service_categories WHERE name = 'Landscaping' LIMIT 1;
    SELECT id INTO paint_category_id FROM service_categories WHERE name = 'Exterior Painting' LIMIT 1;
    SELECT id INTO deck_category_id FROM service_categories WHERE name = 'Deck & Patio' LIMIT 1;

    -- Insert provider profiles
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
    (roofing_provider_id, 'Elite Roofing Solutions', 'Professional roofing contractors with 15+ years experience in Windhoek area', 15, 350, 4.9, 127, ARRAY['Windhoek', 'Rehoboth']),
    (concrete_provider_id, 'Concrete Masters Namibia', 'Specialized concrete and masonry work for residential and commercial projects', 12, 280, 4.7, 94, ARRAY['Windhoek', 'Swakopmund']),
    (fence_provider_id, 'Secure Fence Co.', 'Quality fencing solutions for homes and businesses across Namibia', 8, 250, 4.8, 156, ARRAY['Windhoek', 'Oshakati']),
    (landscape_provider_id, 'Desert Landscape Designs', 'Creating beautiful outdoor spaces adapted to Namibian climate', 10, 200, 4.6, 89, ARRAY['Windhoek', 'Swakopmund']),
    (paint_provider_id, 'Pro Paint Exteriors', 'Professional exterior painting services with premium materials', 7, 180, 4.5, 73, ARRAY['Windhoek', 'Walvis Bay']),
    (deck_provider_id, 'Outdoor Living Specialists', 'Custom decks, patios, and outdoor entertainment areas', 9, 320, 4.8, 102, ARRAY['Windhoek', 'Gobabis']);

    -- Insert services
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
    ) VALUES
    -- Roofing Services
    (roofing_provider_id, roofing_category_id, 'Complete Roof Replacement', 'Full roof replacement with premium materials and 10-year warranty', 25000, 85000, 'per project', 'Windhoek', 4.9, 45),
    (roofing_provider_id, roofing_category_id, 'Roof Repair & Maintenance', 'Professional roof repairs, leak fixes, and regular maintenance', 800, 5000, 'per service', 'Windhoek', 4.8, 67),
    -- Concrete & Masonry Services
    (concrete_provider_id, concrete_category_id, 'Driveway Construction', 'Professional concrete driveway installation with decorative options', 8000, 25000, 'per project', 'Windhoek', 4.7, 34),
    (concrete_provider_id, concrete_category_id, 'Foundation Work', 'House foundations, slabs, and structural concrete work', 15000, 50000, 'per project', 'Windhoek', 4.6, 28),
    -- Fencing Services
    (fence_provider_id, fence_category_id, 'Security Fence Installation', 'High-quality security fencing for residential and commercial properties', 350, 800, 'per meter', 'Windhoek', 4.8, 89),
    (fence_provider_id, fence_category_id, 'Garden Fence & Gates', 'Decorative garden fencing with custom gate installations', 280, 600, 'per meter', 'Windhoek', 4.7, 112),
    -- Landscaping Services
    (landscape_provider_id, landscape_category_id, 'Complete Garden Makeover', 'Full landscape design and installation with drought-resistant plants', 12000, 45000, 'per project', 'Windhoek', 4.6, 41),
    (landscape_provider_id, landscape_category_id, 'Lawn Installation & Care', 'Professional lawn installation and ongoing maintenance services', 150, 300, 'per sqm', 'Windhoek', 4.5, 76),
    -- Exterior Painting Services
    (paint_provider_id, paint_category_id, 'House Exterior Painting', 'Complete exterior house painting with premium weather-resistant paint', 8000, 35000, 'per project', 'Windhoek', 4.5, 53),
    (paint_provider_id, paint_category_id, 'Roof Painting & Coating', 'Specialized roof painting and protective coating application', 3000, 12000, 'per project', 'Windhoek', 4.4, 39),
    -- Deck & Patio Services
    (deck_provider_id, deck_category_id, 'Custom Deck Construction', 'Custom wooden and composite deck construction and installation', 18000, 65000, 'per project', 'Windhoek', 4.8, 47),
    (deck_provider_id, deck_category_id, 'Patio & Braai Area', 'Professional patio construction with built-in braai facilities', 12000, 40000, 'per project', 'Windhoek', 4.7, 38);
END $$;