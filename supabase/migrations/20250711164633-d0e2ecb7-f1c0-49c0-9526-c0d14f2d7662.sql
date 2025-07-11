-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('customer', 'provider', 'admin');

-- Add new columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Windhoek',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Namibia',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'));

-- Update existing user_type column to use enum (migrate existing data)
UPDATE public.profiles SET role = 'customer'::user_role WHERE user_type = 'customer' OR user_type IS NULL;
UPDATE public.profiles SET role = 'provider'::user_role WHERE user_type = 'provider';
UPDATE public.profiles SET role = 'admin'::user_role WHERE user_type = 'admin';

-- Create provider_profiles table for additional provider information
CREATE TABLE public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT,
  business_registration_number TEXT,
  tax_number TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  id_document_url TEXT,
  business_license_url TEXT,
  insurance_certificate_url TEXT,
  years_of_experience INTEGER,
  service_areas TEXT[], -- Array of areas they serve
  bio TEXT,
  portfolio_urls TEXT[], -- Array of portfolio image URLs
  hourly_rate DECIMAL(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on provider_profiles
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for provider_profiles table
CREATE POLICY "Provider profiles are viewable by everyone" 
ON public.provider_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Providers can insert their own provider profile" 
ON public.provider_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can update their own provider profile" 
ON public.provider_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create admin policy for profiles (admins can update any profile)
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update the existing handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, display_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer')::user_role
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
  RETURN NEW;
END;
$$;

-- Create trigger for provider_profiles updated_at
CREATE TRIGGER update_provider_profiles_updated_at
  BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();