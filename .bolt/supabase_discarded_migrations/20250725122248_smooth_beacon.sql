/*
  # Fix Row Level Security Policies

  This migration fixes and optimizes RLS policies for better security and performance.
  It addresses issues with duplicate policies and ensures proper access control.

  ## Security Improvements:
  - Consolidate duplicate RLS policies
  - Add missing security checks
  - Optimize policy performance
  - Fix policy conflicts
*/

-- =============================================
-- SERVICES TABLE RLS FIXES
-- =============================================

-- Drop all existing conflicting policies for services
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
DROP POLICY IF EXISTS "Providers can create their own services" ON services;
DROP POLICY IF EXISTS "Providers can create their services" ON services;
DROP POLICY IF EXISTS "Providers can update their own services" ON services;
DROP POLICY IF EXISTS "Providers can update their services" ON services;
DROP POLICY IF EXISTS "Providers can delete their own services" ON services;
DROP POLICY IF EXISTS "Providers can delete their services" ON services;

-- Create optimized policies for services
CREATE POLICY "services_select_available" ON services
  FOR SELECT USING (is_available = true);

CREATE POLICY "services_provider_all" ON services
  FOR ALL USING (auth.uid() = provider_id);

-- =============================================
-- BOOKINGS TABLE RLS FIXES
-- =============================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Providers can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update their pending bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update pending bookings" ON bookings;
DROP POLICY IF EXISTS "Providers can update booking status" ON bookings;
DROP POLICY IF EXISTS "Providers can update bookings" ON bookings;

-- Create consolidated booking policies
CREATE POLICY "bookings_customer_select" ON bookings
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "bookings_provider_select" ON bookings
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "bookings_customer_insert" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "bookings_customer_update" ON bookings
  FOR UPDATE USING (
    auth.uid() = customer_id AND 
    status IN ('pending', 'confirmed')
  );

CREATE POLICY "bookings_provider_update" ON bookings
  FOR UPDATE USING (auth.uid() = provider_id);

-- =============================================
-- PROFILES TABLE RLS FIXES
-- =============================================

-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create optimized profile policies
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "profiles_admin_update" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- =============================================
-- PROVIDER PROFILES RLS FIXES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Provider profiles are viewable by everyone" ON provider_profiles;
DROP POLICY IF EXISTS "Providers can insert their own provider profile" ON provider_profiles;
DROP POLICY IF EXISTS "Providers can update their own provider profile" ON provider_profiles;

-- Create optimized provider profile policies
CREATE POLICY "provider_profiles_select_all" ON provider_profiles
  FOR SELECT USING (true);

CREATE POLICY "provider_profiles_manage_own" ON provider_profiles
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- REVIEWS TABLE RLS FIXES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON provider_reviews;
DROP POLICY IF EXISTS "Customers can create reviews for their bookings" ON provider_reviews;

-- Create optimized review policies
CREATE POLICY "reviews_select_all" ON provider_reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_customer_insert" ON provider_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = booking_id 
      AND b.customer_id = auth.uid()
      AND b.status = 'completed'
    )
  );

-- =============================================
-- MESSAGES TABLE RLS FIXES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages they're involved in" ON messages;
DROP POLICY IF EXISTS "Users can send messages for their bookings" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Create optimized message policies
CREATE POLICY "messages_select_involved" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "messages_insert_booking_participant" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = booking_id 
      AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid())
    )
  );

CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- =============================================
-- FAVORITES TABLE RLS FIXES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own favorites" ON customer_favorites;
DROP POLICY IF EXISTS "Favorites are viewable by customer and provider" ON customer_favorites;

-- Create optimized favorites policies
CREATE POLICY "favorites_select_involved" ON customer_favorites
  FOR SELECT USING (
    auth.uid() = customer_id OR auth.uid() = provider_id
  );

CREATE POLICY "favorites_manage_own" ON customer_favorites
  FOR ALL USING (auth.uid() = customer_id);

-- =============================================
-- ADMIN-ONLY TABLE POLICIES
-- =============================================

-- Function to check if user is admin (reusable)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply admin-only policies to sensitive tables
DO $$
DECLARE
  admin_tables TEXT[] := ARRAY[
    'admin_analytics',
    'performance_metrics', 
    'promotional_campaigns',
    'financial_reports',
    'api_integrations',
    'white_label_configs'
  ];
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY admin_tables
  LOOP
    -- Drop existing policies
    EXECUTE format('DROP POLICY IF EXISTS "%s_admin_all" ON %I', table_name, table_name);
    
    -- Create admin-only policy
    EXECUTE format(
      'CREATE POLICY "%s_admin_all" ON %I FOR ALL USING (is_admin())',
      table_name, table_name
    );
  END LOOP;
END $$;

-- =============================================
-- CORPORATE AND FRANCHISE POLICIES
-- =============================================

-- Corporate accounts policies
DROP POLICY IF EXISTS "Admins can manage corporate accounts" ON corporate_accounts;
DROP POLICY IF EXISTS "Corporate members can view their account" ON corporate_accounts;

CREATE POLICY "corporate_accounts_admin_manage" ON corporate_accounts
  FOR ALL USING (is_admin());

CREATE POLICY "corporate_accounts_member_select" ON corporate_accounts
  FOR SELECT USING (
    id = (
      SELECT corporate_account_id 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Franchise policies
DROP POLICY IF EXISTS "Admins can manage franchises" ON franchises;
DROP POLICY IF EXISTS "Franchisees can view their franchise" ON franchises;

CREATE POLICY "franchises_admin_manage" ON franchises
  FOR ALL USING (is_admin());

CREATE POLICY "franchises_franchisee_select" ON franchises
  FOR SELECT USING (auth.uid() = franchisee_id);

-- =============================================
-- PERFORMANCE OPTIMIZATIONS
-- =============================================

-- Add partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_pending_provider ON bookings(provider_id, created_at) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_services_available_category ON services(category_id, rating DESC) 
  WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_provider_profiles_active ON provider_profiles(rating DESC, total_jobs_completed DESC) 
  WHERE is_available = true;

-- =============================================
-- SECURITY AUDIT FUNCTION
-- =============================================

-- Function to audit RLS policy coverage
CREATE OR REPLACE FUNCTION audit_rls_coverage()
RETURNS TABLE(
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT,
  has_select_policy BOOLEAN,
  has_insert_policy BOOLEAN,
  has_update_policy BOOLEAN,
  has_delete_policy BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    t.rowsecurity,
    COUNT(p.policyname),
    COUNT(p.policyname) FILTER (WHERE p.cmd = 'r') > 0,
    COUNT(p.policyname) FILTER (WHERE p.cmd = 'a') > 0,
    COUNT(p.policyname) FILTER (WHERE p.cmd = 'w') > 0,
    COUNT(p.policyname) FILTER (WHERE p.cmd = 'd') > 0
  FROM pg_tables t
  LEFT JOIN pg_policies p ON p.tablename = t.tablename
  WHERE t.schemaname = 'public'
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FINAL CLEANUP AND VALIDATION
-- =============================================

-- Update table statistics for better query planning
ANALYZE;

-- Refresh materialized views if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'provider_performance_summary') THEN
    REFRESH MATERIALIZED VIEW provider_performance_summary;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'category_performance_summary') THEN
    REFRESH MATERIALIZED VIEW category_performance_summary;
  END IF;
END $$;