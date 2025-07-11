-- Create bookings table for managing service bookings
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_hours INTEGER DEFAULT 1,
  total_amount DECIMAL NOT NULL,
  status booking_status DEFAULT 'pending',
  customer_notes TEXT,
  provider_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booking status enum
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- Create booking status history table for tracking changes
CREATE TABLE public.booking_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status booking_status,
  new_status booking_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.bookings ADD CONSTRAINT fk_bookings_service 
  FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD CONSTRAINT fk_bookings_provider 
  FOREIGN KEY (provider_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookings
CREATE POLICY "Customers can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Providers can view their bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Customers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their pending bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = customer_id AND status = 'pending');

CREATE POLICY "Providers can update booking status" ON public.bookings
  FOR UPDATE USING (auth.uid() = provider_id);

-- Enable RLS on booking_status_history
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for booking_status_history
CREATE POLICY "Users can view booking history for their bookings" ON public.booking_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id 
      AND (customer_id = auth.uid() OR provider_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert booking status changes" ON public.booking_status_history
  FOR INSERT WITH CHECK (auth.uid() = changed_by);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at
  BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to log booking status changes
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.booking_status_history (
      booking_id, 
      old_status, 
      new_status, 
      changed_by
    ) VALUES (
      NEW.id, 
      OLD.status, 
      NEW.status, 
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_booking_status_change_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_booking_status_change();