-- Phase 8.1: Multi-City Expansion Database Schema

-- Create cities table for multi-city support
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Namibia',
  region TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  timezone TEXT DEFAULT 'Africa/Windhoek',
  currency TEXT DEFAULT 'NAD',
  language_codes TEXT[] DEFAULT ARRAY['en', 'af'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create local payment methods table
CREATE TABLE public.local_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  method_name TEXT NOT NULL,
  method_type TEXT NOT NULL, -- 'mobile_money', 'bank_transfer', 'cash', 'card'
  provider TEXT,
  is_active BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create regional marketing campaigns table
CREATE TABLE public.regional_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL, -- 'local_promotion', 'partnership', 'event'
  target_audience JSONB,
  budget_amount DECIMAL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create local partnerships table
CREATE TABLE public.local_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL, -- 'business', 'government', 'ngo', 'community'
  contact_info JSONB,
  partnership_terms JSONB,
  revenue_share DECIMAL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 8.2: Advanced Business Models Database Schema

-- Create corporate accounts table
CREATE TABLE public.corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_registration TEXT,
  industry TEXT,
  employee_count INTEGER,
  primary_contact_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  billing_address JSONB,
  payment_terms TEXT DEFAULT 'net_30',
  credit_limit DECIMAL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create enterprise service packages table
CREATE TABLE public.enterprise_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  service_types TEXT[] NOT NULL,
  monthly_credit DECIMAL,
  discount_rate DECIMAL DEFAULT 0,
  contract_duration INTEGER, -- in months
  auto_renewal BOOLEAN DEFAULT false,
  terms_conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create franchise management table
CREATE TABLE public.franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_name TEXT NOT NULL,
  franchisee_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  territory_bounds JSONB, -- geographic boundaries
  franchise_fee DECIMAL,
  royalty_rate DECIMAL,
  marketing_fee_rate DECIMAL,
  contract_start TIMESTAMPTZ,
  contract_end TIMESTAMPTZ,
  performance_metrics JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create API integrations table for third-party access
CREATE TABLE public.api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT NOT NULL,
  partner_company TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  permissions JSONB NOT NULL, -- what endpoints they can access
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create white-label configurations table
CREATE TABLE public.white_label_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  domain TEXT UNIQUE,
  branding JSONB NOT NULL, -- colors, logos, etc.
  features_enabled JSONB DEFAULT '{}',
  custom_terms JSONB,
  billing_model TEXT DEFAULT 'revenue_share',
  revenue_share_rate DECIMAL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add city_id to existing tables for multi-city support
ALTER TABLE public.services ADD COLUMN city_id UUID REFERENCES public.cities(id);
ALTER TABLE public.provider_profiles ADD COLUMN service_cities UUID[] DEFAULT ARRAY[]::UUID[];
ALTER TABLE public.bookings ADD COLUMN city_id UUID REFERENCES public.cities(id);

-- Add corporate account support to profiles
ALTER TABLE public.profiles ADD COLUMN corporate_account_id UUID REFERENCES public.corporate_accounts(id);
ALTER TABLE public.profiles ADD COLUMN account_type TEXT DEFAULT 'individual' CHECK (account_type IN ('individual', 'corporate', 'franchise'));

-- Create RLS policies
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_configs ENABLE ROW LEVEL SECURITY;

-- Cities are viewable by everyone
CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING (is_active = true);

-- Payment methods are viewable by everyone
CREATE POLICY "Payment methods are viewable by everyone" ON public.local_payment_methods FOR SELECT USING (is_active = true);

-- Corporate accounts - members can view their account
CREATE POLICY "Corporate members can view their account" ON public.corporate_accounts 
FOR SELECT USING (id = (SELECT corporate_account_id FROM public.profiles WHERE user_id = auth.uid()));

-- Enterprise packages - corporate members can view their packages
CREATE POLICY "Corporate members can view their packages" ON public.enterprise_packages 
FOR SELECT USING (corporate_account_id = (SELECT corporate_account_id FROM public.profiles WHERE user_id = auth.uid()));

-- Franchises - franchisees can view their franchise
CREATE POLICY "Franchisees can view their franchise" ON public.franchises 
FOR SELECT USING (franchisee_id = auth.uid());

-- Admin policies for management
CREATE POLICY "Admins can manage all cities" ON public.cities 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage payment methods" ON public.local_payment_methods 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage regional campaigns" ON public.regional_campaigns 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage partnerships" ON public.local_partnerships 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage corporate accounts" ON public.corporate_accounts 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage enterprise packages" ON public.enterprise_packages 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage franchises" ON public.franchises 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage API integrations" ON public.api_integrations 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage white-label configs" ON public.white_label_configs 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Insert default cities
INSERT INTO public.cities (name, country, region, timezone, currency, language_codes) VALUES
('Windhoek', 'Namibia', 'Khomas', 'Africa/Windhoek', 'NAD', ARRAY['en', 'af', 'de']),
('Walvis Bay', 'Namibia', 'Erongo', 'Africa/Windhoek', 'NAD', ARRAY['en', 'af']),
('Swakopmund', 'Namibia', 'Erongo', 'Africa/Windhoek', 'NAD', ARRAY['en', 'af', 'de']),
('Oshakati', 'Namibia', 'Oshana', 'Africa/Windhoek', 'NAD', ARRAY['en', 'oshiwambo']),
('Rundu', 'Namibia', 'Kavango East', 'Africa/Windhoek', 'NAD', ARRAY['en', 'rukwangali']),
('Katima Mulilo', 'Namibia', 'Zambezi', 'Africa/Windhoek', 'NAD', ARRAY['en', 'silozi']);

-- Insert default payment methods
INSERT INTO public.local_payment_methods (city_id, method_name, method_type, provider) 
SELECT id, 'Mobile Money', 'mobile_money', 'MTC Mobile Money' FROM public.cities WHERE name = 'Windhoek';

INSERT INTO public.local_payment_methods (city_id, method_name, method_type, provider) 
SELECT id, 'Bank Transfer', 'bank_transfer', 'Bank Windhoek' FROM public.cities WHERE name = 'Windhoek';

-- Create triggers for updated_at
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_corporate_accounts_updated_at BEFORE UPDATE ON public.corporate_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();