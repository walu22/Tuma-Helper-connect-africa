-- Create additional tables for Provider Ecosystem Phase 3

-- Create provider skills assessment table
CREATE TABLE public.provider_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  certification_url TEXT,
  verified_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create provider availability table
CREATE TABLE public.provider_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, day_of_week, start_time, end_time)
);

-- Create provider earnings table
CREATE TABLE public.provider_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  gross_amount DECIMAL NOT NULL,
  platform_fee DECIMAL NOT NULL DEFAULT 0,
  net_amount DECIMAL NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
  payout_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create provider reviews table  
CREATE TABLE public.provider_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id) -- One review per booking
);

-- Create provider training modules table
CREATE TABLE public.training_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_url TEXT,
  duration_minutes INTEGER,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create provider training progress table
CREATE TABLE public.provider_training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, module_id)
);

-- Create provider disputes table
CREATE TABLE public.provider_disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  initiated_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('payment', 'quality', 'cancellation', 'behavior', 'other')),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  admin_notes TEXT,
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.provider_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_skills
CREATE POLICY "Providers can manage their own skills" ON public.provider_skills
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "Skills are viewable by everyone" ON public.provider_skills
  FOR SELECT USING (true);

-- RLS Policies for provider_availability
CREATE POLICY "Providers can manage their own availability" ON public.provider_availability
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "Availability is viewable by everyone" ON public.provider_availability
  FOR SELECT USING (true);

-- RLS Policies for provider_earnings
CREATE POLICY "Providers can view their own earnings" ON public.provider_earnings
  FOR SELECT USING (auth.uid() = provider_id);

-- RLS Policies for provider_reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.provider_reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their bookings" ON public.provider_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND 
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND customer_id = auth.uid())
  );

-- RLS Policies for training_modules
CREATE POLICY "Training modules are viewable by everyone" ON public.training_modules
  FOR SELECT USING (true);

-- RLS Policies for provider_training_progress
CREATE POLICY "Providers can view their own training progress" ON public.provider_training_progress
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Providers can update their own training progress" ON public.provider_training_progress
  FOR ALL USING (auth.uid() = provider_id);

-- RLS Policies for provider_disputes
CREATE POLICY "Users can view disputes they're involved in" ON public.provider_disputes
  FOR SELECT USING (
    auth.uid() = initiated_by OR 
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id AND (customer_id = auth.uid() OR provider_id = auth.uid())
    )
  );

CREATE POLICY "Users can create disputes for their bookings" ON public.provider_disputes
  FOR INSERT WITH CHECK (
    auth.uid() = initiated_by AND
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id AND (customer_id = auth.uid() OR provider_id = auth.uid())
    )
  );

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_provider_skills_updated_at
  BEFORE UPDATE ON public.provider_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_availability_updated_at
  BEFORE UPDATE ON public.provider_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_earnings_updated_at
  BEFORE UPDATE ON public.provider_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_reviews_updated_at
  BEFORE UPDATE ON public.provider_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_modules_updated_at
  BEFORE UPDATE ON public.training_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_training_progress_updated_at
  BEFORE UPDATE ON public.provider_training_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_disputes_updated_at
  BEFORE UPDATE ON public.provider_disputes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();