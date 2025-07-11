-- Create service categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- lucide icon name
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_from DECIMAL(10,2) NOT NULL,
  price_to DECIMAL(10,2),
  price_unit TEXT DEFAULT 'per service', -- 'per hour', 'per day', 'per service'
  location TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service images table
CREATE TABLE public.service_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;

-- Service categories policies (public read)
CREATE POLICY "Service categories are viewable by everyone" 
ON public.service_categories 
FOR SELECT 
USING (true);

-- Services policies
CREATE POLICY "Services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (true);

CREATE POLICY "Providers can create their own services" 
ON public.services 
FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their own services" 
ON public.services 
FOR UPDATE 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete their own services" 
ON public.services 
FOR DELETE 
USING (auth.uid() = provider_id);

-- Service images policies
CREATE POLICY "Service images are viewable by everyone" 
ON public.service_images 
FOR SELECT 
USING (true);

CREATE POLICY "Providers can manage their service images" 
ON public.service_images 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.services 
  WHERE services.id = service_images.service_id 
  AND services.provider_id = auth.uid()
));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_service_categories_updated_at
BEFORE UPDATE ON public.service_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample service categories for Windhoek market
INSERT INTO public.service_categories (name, description, icon) VALUES
('Home Services', 'Cleaning, maintenance, and home improvement', 'home'),
('Beauty & Wellness', 'Hair, nails, spa, and personal care services', 'sparkles'),
('Automotive', 'Car wash, repairs, and maintenance services', 'car'),
('Delivery & Moving', 'Package delivery, moving, and transportation', 'truck'),
('Tech Support', 'Computer repair, phone services, and IT support', 'laptop'),
('Gardening', 'Landscaping, lawn care, and garden maintenance', 'flower'),
('Tutoring', 'Academic support and skill development', 'book-open'),
('Events', 'Photography, catering, and event planning', 'camera'),
('Pet Services', 'Pet care, grooming, and veterinary services', 'heart'),
('Handyman', 'General repairs, installations, and maintenance', 'wrench');