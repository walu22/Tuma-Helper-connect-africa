-- Update existing user to be a provider and create sample services
DO $$
DECLARE
    sample_user_id UUID := '6967cfd4-c459-4a20-a312-afdabb44389f';
    automotive_category_id UUID;
    beauty_category_id UUID;
    delivery_category_id UUID;
    events_category_id UUID;
    gardening_category_id UUID;
BEGIN
    -- Update existing user to be a provider
    UPDATE public.profiles 
    SET 
      role = 'provider',
      email = 'provider1@example.com',
      full_name = 'John Doe',
      display_name = 'John Doe',
      phone = '+264 81 123 4567'
    WHERE user_id = sample_user_id;
    
    -- Get category IDs
    SELECT id INTO automotive_category_id FROM service_categories WHERE name = 'Automotive';
    SELECT id INTO beauty_category_id FROM service_categories WHERE name = 'Beauty & Wellness';
    SELECT id INTO delivery_category_id FROM service_categories WHERE name = 'Delivery & Moving';
    SELECT id INTO events_category_id FROM service_categories WHERE name = 'Events';
    SELECT id INTO gardening_category_id FROM service_categories WHERE name = 'Gardening';
    
    -- Create provider profile
    INSERT INTO public.provider_profiles (
      user_id,
      bio,
      hourly_rate,
      years_of_experience,
      is_available,
      service_areas
    ) VALUES (
      sample_user_id,
      'Experienced service provider in Windhoek',
      150,
      5,
      true,
      ARRAY['Windhoek', 'Klein Windhoek', 'Olympia']
    );
    
    -- Create sample services
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
    (
      sample_user_id,
      automotive_category_id,
      'Car Wash & Detailing',
      'Professional car washing and detailing service. Interior and exterior cleaning with premium products.',
      200,
      500,
      'per service',
      'Windhoek',
      4.5,
      12,
      true
    ),
    (
      sample_user_id,
      beauty_category_id,
      'Mobile Hair Styling',
      'Professional hair styling services at your location. Cuts, colors, and special occasion styling.',
      150,
      400,
      'per service',
      'Windhoek',
      4.8,
      25,
      true
    ),
    (
      sample_user_id,
      delivery_category_id,
      'Furniture Moving Service',
      'Safe and reliable furniture moving and delivery service. Experienced team with proper equipment.',
      300,
      800,
      'per job',
      'Windhoek',
      4.3,
      18,
      true
    ),
    (
      sample_user_id,
      events_category_id,
      'Event Photography',
      'Professional event photography for weddings, parties, and corporate events. High-quality photos delivered digitally.',
      800,
      2000,
      'per event',
      'Windhoek',
      4.9,
      35,
      true
    ),
    (
      sample_user_id,
      gardening_category_id,
      'Garden Maintenance',
      'Complete garden maintenance including lawn mowing, pruning, planting, and seasonal cleanup.',
      250,
      600,
      'per visit',
      'Windhoek',
      4.6,
      22,
      true
    );
END $$;