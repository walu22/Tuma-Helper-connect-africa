-- Create a sample corporate account
INSERT INTO public.corporate_accounts (
  id,
  company_name,
  industry,
  employee_count,
  payment_terms,
  credit_limit,
  is_active,
  primary_contact_id
) VALUES (
  gen_random_uuid(),
  'Tech Solutions Namibia',
  'Technology',
  50,
  'net_30',
  100000.00,
  true,
  '386bf0c4-0390-4b33-b895-c67d5c922071'
);

-- Update the user's profile to link to the corporate account
UPDATE public.profiles 
SET corporate_account_id = (
  SELECT id FROM public.corporate_accounts 
  WHERE company_name = 'Tech Solutions Namibia'
)
WHERE user_id = '386bf0c4-0390-4b33-b895-c67d5c922071';

-- Create a sample enterprise package for the corporate account
INSERT INTO public.enterprise_packages (
  id,
  corporate_account_id,
  package_name,
  service_types,
  monthly_credit,
  discount_rate,
  contract_duration,
  is_active
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.corporate_accounts WHERE company_name = 'Tech Solutions Namibia'),
  'Premium Business Package',
  ARRAY['cleaning', 'maintenance', 'catering', 'security'],
  25000.00,
  15.0,
  12,
  true
);