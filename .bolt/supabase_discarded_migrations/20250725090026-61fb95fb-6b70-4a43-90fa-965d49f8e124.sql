-- Fix the remaining function search path issue
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$function$;