-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('customer', 'provider', 'admin');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT DEFAULT 'Windhoek',
  country TEXT DEFAULT 'Namibia',
  is_verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

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

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer')::user_role
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at
  BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();