-- Temporarily disable RLS on services table to test
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- Also check and disable RLS on related tables that might be causing issues
ALTER TABLE public.service_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;