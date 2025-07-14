-- Fix RLS policy for services table to allow authenticated users to view available services
DROP POLICY IF EXISTS "Services are publicly viewable" ON public.services;

-- Create a policy that allows both authenticated and unauthenticated users to view available services
CREATE POLICY "Services are viewable by everyone" ON public.services
FOR SELECT 
USING (is_available = true);