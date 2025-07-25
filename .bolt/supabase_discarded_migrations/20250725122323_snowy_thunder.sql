/*
  # Add Missing Tables and Improve Schema

  This migration adds missing tables that are referenced in the application
  but don't exist in the current schema.

  ## New Tables:
  - users (auth.users reference table)
  - service_bookings (junction table)
  - provider_certifications
  - payment_methods
  - booking_payments
  - system_settings
*/

-- =============================================
-- USERS TABLE (Reference to auth.users)
-- =============================================

-- Create users table that mirrors auth.users for foreign key references
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- =============================================
-- PROVIDER CERTIFICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS provider_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  certification_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(user_id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_provider_certifications_provider ON provider_certifications(provider_id);
CREATE INDEX idx_provider_certifications_verified ON provider_certifications(is_verified);
CREATE INDEX idx_provider_certifications_expiry ON provider_certifications(expiry_date) WHERE expiry_date IS NOT NULL;

-- RLS
ALTER TABLE provider_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certifications_select_all" ON provider_certifications
  FOR SELECT USING (true);

CREATE POLICY "certifications_provider_manage" ON provider_certifications
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "certifications_admin_verify" ON provider_certifications
  FOR UPDATE USING (
    is_admin() AND 
    (verified_by IS NULL OR verified_by = auth.uid())
  );

-- =============================================
-- PAYMENT METHODS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('card', 'bank_account', 'mobile_money', 'crypto')),
  provider TEXT NOT NULL, -- e.g., 'stripe', 'paypal', 'mtc_mobile'
  external_id TEXT NOT NULL, -- ID from payment provider
  last_four TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = true;

-- RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_methods_user_manage" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- BOOKING PAYMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'NAD',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_provider TEXT NOT NULL,
  external_payment_id TEXT,
  payment_intent_id TEXT,
  failure_reason TEXT,
  processed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount NUMERIC(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_booking_payments_booking ON booking_payments(booking_id);
CREATE INDEX idx_booking_payments_status ON booking_payments(payment_status);
CREATE INDEX idx_booking_payments_provider ON booking_payments(payment_provider);

-- RLS
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_payments_customer_select" ON booking_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = booking_id AND b.customer_id = auth.uid()
    )
  );

CREATE POLICY "booking_payments_provider_select" ON booking_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = booking_id AND b.provider_id = auth.uid()
    )
  );

-- =============================================
-- SYSTEM SETTINGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT DEFAULT 'general' CHECK (setting_type IN ('general', 'payment', 'notification', 'security', 'feature_flag')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_type ON system_settings(setting_type);
CREATE INDEX idx_system_settings_public ON system_settings(is_public) WHERE is_public = true;

-- RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_settings_public_select" ON system_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "system_settings_admin_all" ON system_settings
  FOR ALL USING (is_admin());

-- =============================================
-- SERVICE AVAILABILITY TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS service_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  is_available BOOLEAN DEFAULT true,
  max_bookings_per_slot INTEGER DEFAULT 1,
  slot_duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, day_of_week, start_time)
);

-- Indexes
CREATE INDEX idx_service_availability_service ON service_availability(service_id);
CREATE INDEX idx_service_availability_day ON service_availability(day_of_week, is_available);

-- RLS
ALTER TABLE service_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_availability_select_all" ON service_availability
  FOR SELECT USING (true);

CREATE POLICY "service_availability_provider_manage" ON service_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM services s 
      WHERE s.id = service_id AND s.provider_id = auth.uid()
    )
  );

-- =============================================
-- BOOKING TIMELINE TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS booking_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'confirmed', 'started', 'completed', 'cancelled', 'payment_received', 'review_added')),
  event_description TEXT,
  event_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_booking_timeline_booking ON booking_timeline(booking_id, created_at);
CREATE INDEX idx_booking_timeline_type ON booking_timeline(event_type);

-- RLS
ALTER TABLE booking_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_timeline_select_involved" ON booking_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = booking_id 
      AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid())
    )
  );

CREATE POLICY "booking_timeline_insert_involved" ON booking_timeline
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = booking_id 
      AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid())
    )
  );

-- =============================================
-- TRIGGERS FOR NEW TABLES
-- =============================================

-- Updated at triggers
CREATE TRIGGER update_provider_certifications_updated_at
  BEFORE UPDATE ON provider_certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_payments_updated_at
  BEFORE UPDATE ON booking_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_availability_updated_at
  BEFORE UPDATE ON service_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INSERT DEFAULT SYSTEM SETTINGS
-- =============================================

INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
  ('platform_fee_percentage', '15', 'payment', 'Platform fee percentage for transactions', false),
  ('max_booking_advance_days', '90', 'general', 'Maximum days in advance a booking can be made', true),
  ('min_booking_advance_hours', '2', 'general', 'Minimum hours in advance a booking can be made', true),
  ('default_cancellation_window_hours', '24', 'general', 'Default cancellation window in hours', true),
  ('enable_instant_booking', 'true', 'feature_flag', 'Enable instant booking without provider confirmation', true),
  ('enable_chat_messaging', 'true', 'feature_flag', 'Enable chat messaging between users', true),
  ('supported_currencies', '["NAD", "USD", "EUR"]', 'payment', 'List of supported currencies', true),
  ('maintenance_mode', 'false', 'general', 'Enable maintenance mode', false)
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================
-- DATA MIGRATION AND CLEANUP
-- =============================================

-- Migrate any existing auth.users data to users table
INSERT INTO users (id, email, created_at, updated_at)
SELECT 
  id,
  email,
  created_at,
  updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = EXCLUDED.updated_at;

-- Update profiles to reference users table properly
DO $$
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_users_fkey'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_user_id_users_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;