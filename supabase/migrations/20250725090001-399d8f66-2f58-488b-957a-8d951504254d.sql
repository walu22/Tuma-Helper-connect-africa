-- Enable RLS on remaining tables with disabled RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;