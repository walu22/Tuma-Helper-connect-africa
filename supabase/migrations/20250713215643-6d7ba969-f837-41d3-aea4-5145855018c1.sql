-- Check current RLS policies on services table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'services';

-- Create a security definer function to safely check user roles (if needed)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies on services if they exist
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Providers can manage their services" ON public.services;
DROP POLICY IF EXISTS "Providers can create services" ON public.services;
DROP POLICY IF EXISTS "Providers can update their services" ON public.services;
DROP POLICY IF EXISTS "Providers can delete their services" ON public.services;

-- Create simple, non-recursive RLS policies for services
CREATE POLICY "Services are publicly viewable" 
ON public.services 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Providers can create their services" 
ON public.services 
FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their services" 
ON public.services 
FOR UPDATE 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete their services" 
ON public.services 
FOR DELETE 
USING (auth.uid() = provider_id);