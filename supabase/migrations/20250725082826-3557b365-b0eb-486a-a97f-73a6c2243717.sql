-- Fix remaining critical RLS security issues

-- Query to identify tables that still need RLS enabled
DO $$
DECLARE
    tables_without_rls TEXT[] := ARRAY[
        'service_categories',
        'services', 
        'user_achievements'
    ];
    table_name TEXT;
BEGIN
    -- Enable RLS on remaining tables that are missing it
    FOREACH table_name IN ARRAY tables_without_rls
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = table_name) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        END IF;
    END LOOP;
END $$;

-- Add RLS policies for service_categories (if the table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' AND table_name = 'service_categories') THEN
        
        -- Service categories should be viewable by everyone when active
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_categories' AND policyname = 'Service categories are viewable by everyone') THEN
            CREATE POLICY "Service categories are viewable by everyone" 
            ON public.service_categories 
            FOR SELECT 
            USING (true);
        END IF;

        -- Only admins can manage service categories
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_categories' AND policyname = 'Admins can manage service categories') THEN
            CREATE POLICY "Admins can manage service categories" 
            ON public.service_categories 
            FOR ALL 
            USING (get_current_user_role() = 'admin');
        END IF;
    END IF;
END $$;

-- Add RLS policies for services (if the table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' AND table_name = 'services') THEN
        
        -- Services should be viewable by everyone when active
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Active services are viewable by everyone') THEN
            CREATE POLICY "Active services are viewable by everyone" 
            ON public.services 
            FOR SELECT 
            USING (is_active = true);
        END IF;

        -- Providers can manage their own services
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Providers can manage their own services') THEN
            CREATE POLICY "Providers can manage their own services" 
            ON public.services 
            FOR ALL 
            USING (auth.uid() = provider_id);
        END IF;

        -- Admins can manage all services
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Admins can manage all services') THEN
            CREATE POLICY "Admins can manage all services" 
            ON public.services 
            FOR ALL 
            USING (get_current_user_role() = 'admin');
        END IF;
    END IF;
END $$;

-- Add RLS policies for user_achievements (if the table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' AND table_name = 'user_achievements') THEN
        
        -- Users can view their own achievements
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can view their own achievements') THEN
            CREATE POLICY "Users can view their own achievements" 
            ON public.user_achievements 
            FOR SELECT 
            USING (auth.uid() = user_id);
        END IF;

        -- System can award achievements (admin only for manual awards)
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'System can award achievements') THEN
            CREATE POLICY "System can award achievements" 
            ON public.user_achievements 
            FOR INSERT 
            WITH CHECK (get_current_user_role() = 'admin');
        END IF;
    END IF;
END $$;