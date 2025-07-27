-- Enhance services table and add bulk operations support
DO $$ 
BEGIN
    -- Check if services table exists, if not create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'services') THEN
        CREATE TABLE public.services (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            provider_id UUID NOT NULL REFERENCES auth.users(id),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            price_from NUMERIC NOT NULL,
            price_to NUMERIC,
            price_unit TEXT NOT NULL DEFAULT 'hour',
            location TEXT NOT NULL,
            category_id UUID,
            is_available BOOLEAN DEFAULT true,
            rating NUMERIC DEFAULT 0,
            total_reviews INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            tags TEXT[] DEFAULT ARRAY[]::TEXT[],
            service_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
            duration_estimate TEXT,
            requirements TEXT,
            booking_lead_time INTEGER DEFAULT 24 -- hours
        );

        -- Enable RLS
        ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Services are viewable by everyone" 
        ON public.services FOR SELECT 
        USING (is_available = true);

        CREATE POLICY "Providers can manage their own services" 
        ON public.services FOR ALL 
        USING (auth.uid() = provider_id);

        -- Create trigger for updated_at
        CREATE TRIGGER update_services_updated_at
        BEFORE UPDATE ON public.services
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Check if service_categories table exists, if not create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'service_categories') THEN
        CREATE TABLE public.service_categories (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            icon TEXT,
            color TEXT DEFAULT '#6366f1',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Enable RLS
        ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

        -- Create policy
        CREATE POLICY "Service categories are viewable by everyone" 
        ON public.service_categories FOR SELECT 
        USING (is_active = true);

        -- Insert default categories
        INSERT INTO public.service_categories (name, description, icon) VALUES
        ('Home Services', 'Cleaning, maintenance, and home improvement', 'home'),
        ('Beauty & Wellness', 'Personal care and wellness services', 'sparkles'),
        ('Automotive', 'Car repair and maintenance services', 'car'),
        ('Technology', 'IT support and tech services', 'laptop'),
        ('Events', 'Event planning and catering', 'calendar'),
        ('Education', 'Tutoring and educational services', 'book'),
        ('Health', 'Healthcare and medical services', 'heart'),
        ('Legal', 'Legal consultation and services', 'scale');
    END IF;
END $$;

-- Create bulk operations table for tracking batch updates
CREATE TABLE IF NOT EXISTS public.bulk_operations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    operation_type TEXT NOT NULL, -- 'update', 'availability_sync', 'price_update'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    total_items INTEGER NOT NULL,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    operation_data JSONB NOT NULL,
    error_log TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own bulk operations" 
ON public.bulk_operations FOR ALL 
USING (auth.uid() = user_id);

-- Create pricing optimization table for AI suggestions
CREATE TABLE IF NOT EXISTS public.service_pricing_optimization (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL,
    provider_id UUID NOT NULL REFERENCES auth.users(id),
    current_price_from NUMERIC NOT NULL,
    current_price_to NUMERIC,
    suggested_price_from NUMERIC NOT NULL,
    suggested_price_to NUMERIC,
    optimization_factors JSONB NOT NULL,
    confidence_score NUMERIC NOT NULL DEFAULT 0,
    market_analysis JSONB,
    competitor_data JSONB,
    demand_score NUMERIC,
    seasonality_factor NUMERIC,
    is_applied BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.service_pricing_optimization ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Providers can view their pricing optimizations" 
ON public.service_pricing_optimization FOR ALL 
USING (auth.uid() = provider_id);

-- Create availability sync table
CREATE TABLE IF NOT EXISTS public.service_availability_sync (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES auth.users(id),
    sync_type TEXT NOT NULL, -- 'manual', 'calendar', 'bulk'
    sync_status TEXT NOT NULL DEFAULT 'pending',
    services_affected UUID[] NOT NULL,
    availability_changes JSONB NOT NULL,
    sync_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    sync_completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Enable RLS
ALTER TABLE public.service_availability_sync ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Providers can manage their availability sync" 
ON public.service_availability_sync FOR ALL 
USING (auth.uid() = provider_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_location ON public.services(location);
CREATE INDEX IF NOT EXISTS idx_services_price_range ON public.services(price_from, price_to);
CREATE INDEX IF NOT EXISTS idx_services_available ON public.services(is_available);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_user_id ON public.bulk_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_optimization_provider_id ON public.service_pricing_optimization(provider_id);
CREATE INDEX IF NOT EXISTS idx_availability_sync_provider_id ON public.service_availability_sync(provider_id);