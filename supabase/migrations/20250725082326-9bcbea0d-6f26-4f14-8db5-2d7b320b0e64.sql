-- Phase 1: Critical RLS Security Fixes

-- 1. Enable RLS on tables that have it disabled but have policies
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- 2. Add missing RLS policies for tables that have RLS enabled but no policies

-- Error logs - only allow viewing own errors or admin access
CREATE POLICY "Users can view their own error logs" 
ON public.error_logs 
FOR SELECT 
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

CREATE POLICY "Users can insert their own error logs" 
ON public.error_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Performance metrics - admin only
CREATE POLICY "Admins can manage performance metrics" 
ON public.performance_metrics 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Pricing suggestions - providers can view their service suggestions, admins can manage all
CREATE POLICY "Providers can view pricing suggestions for their services" 
ON public.pricing_suggestions 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR 
  EXISTS (
    SELECT 1 FROM services s 
    WHERE s.id = pricing_suggestions.service_id 
    AND s.provider_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage pricing suggestions" 
ON public.pricing_suggestions 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Promotional campaigns - admin only for management, public for viewing active campaigns
CREATE POLICY "Everyone can view active promotional campaigns" 
ON public.promotional_campaigns 
FOR SELECT 
USING (is_active = true AND start_date <= now() AND end_date >= now());

CREATE POLICY "Admins can manage promotional campaigns" 
ON public.promotional_campaigns 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Financial reports - admin only
CREATE POLICY "Admins can manage financial reports" 
ON public.financial_reports 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 3. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO profiles (user_id, email, full_name, display_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    'customer'::user_role
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;