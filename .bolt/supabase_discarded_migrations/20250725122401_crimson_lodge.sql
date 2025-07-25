/*
  # Query Optimization and Performance Improvements

  This migration focuses on optimizing common queries and improving
  database performance through better indexing and query patterns.

  ## Optimizations:
  - Add composite indexes for common query patterns
  - Create partial indexes for filtered queries
  - Add covering indexes to avoid table lookups
  - Optimize full-text search
  - Create database functions for complex queries
*/

-- =============================================
-- FULL-TEXT SEARCH OPTIMIZATION
-- =============================================

-- Add full-text search columns
ALTER TABLE services ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vectors
CREATE OR REPLACE FUNCTION update_services_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_provider_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.business_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for search vector updates
DROP TRIGGER IF EXISTS services_search_vector_trigger ON services;
CREATE TRIGGER services_search_vector_trigger
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_services_search_vector();

DROP TRIGGER IF EXISTS provider_search_vector_trigger ON provider_profiles;
CREATE TRIGGER provider_search_vector_trigger
  BEFORE INSERT OR UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_provider_search_vector();

-- Update existing records
UPDATE services SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(location, '')), 'C');

UPDATE provider_profiles SET search_vector = 
  setweight(to_tsvector('english', COALESCE(business_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(bio, '')), 'B');

-- Create GIN indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_services_search_vector ON services USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_search_vector ON provider_profiles USING GIN(search_vector);

-- =============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- =============================================

-- Services search and filtering
CREATE INDEX IF NOT EXISTS idx_services_category_location_rating ON services(category_id, location, rating DESC) 
  WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_services_provider_category ON services(provider_id, category_id, is_available);

CREATE INDEX IF NOT EXISTS idx_services_price_rating ON services(price_from, rating DESC) 
  WHERE is_available = true;

-- Bookings dashboard queries
CREATE INDEX IF NOT EXISTS idx_bookings_provider_date_status ON bookings(provider_id, booking_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_date_status ON bookings(customer_id, booking_date DESC, status);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON bookings(status, created_at DESC);

-- Provider performance queries
CREATE INDEX IF NOT EXISTS idx_provider_reviews_provider_rating ON provider_reviews(provider_id, rating, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provider_earnings_provider_date ON provider_earnings(provider_id, created_at DESC);

-- Message queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(booking_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_user_unread ON messages(receiver_id, is_read, created_at DESC) 
  WHERE is_read = false;

-- Search history for recommendations
CREATE INDEX IF NOT EXISTS idx_search_history_user_query ON search_history(user_id, search_query, created_at DESC);

-- =============================================
-- COVERING INDEXES TO AVOID TABLE LOOKUPS
-- =============================================

-- Services list with essential info
CREATE INDEX IF NOT EXISTS idx_services_list_covering ON services(category_id, is_available, rating DESC) 
  INCLUDE (id, title, price_from, location, provider_id, total_reviews);

-- Provider profiles with key metrics
CREATE INDEX IF NOT EXISTS idx_provider_profiles_covering ON provider_profiles(is_available, rating DESC) 
  INCLUDE (user_id, business_name, hourly_rate, total_jobs_completed);

-- Bookings with service info
CREATE INDEX IF NOT EXISTS idx_bookings_provider_covering ON bookings(provider_id, status, booking_date) 
  INCLUDE (id, customer_name, total_amount, booking_time, service_id);

-- =============================================
-- OPTIMIZED DATABASE FUNCTIONS
-- =============================================

-- Function to get nearby services (simplified distance calculation)
CREATE OR REPLACE FUNCTION get_nearby_services(
  search_location TEXT DEFAULT NULL,
  category_filter UUID DEFAULT NULL,
  price_min NUMERIC DEFAULT NULL,
  price_max NUMERIC DEFAULT NULL,
  rating_min NUMERIC DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  price_from NUMERIC,
  price_to NUMERIC,
  price_unit TEXT,
  location TEXT,
  rating NUMERIC,
  total_reviews INTEGER,
  provider_id UUID,
  provider_name TEXT,
  provider_rating NUMERIC,
  category_name TEXT,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.description,
    s.price_from,
    s.price_to,
    s.price_unit,
    s.location,
    s.rating,
    s.total_reviews,
    s.provider_id,
    COALESCE(pp.business_name, p.display_name, p.full_name) as provider_name,
    pp.rating as provider_rating,
    sc.name as category_name,
    s.is_available
  FROM services s
  JOIN service_categories sc ON sc.id = s.category_id
  JOIN profiles p ON p.user_id = s.provider_id
  LEFT JOIN provider_profiles pp ON pp.user_id = s.provider_id
  WHERE 
    s.is_available = true
    AND (category_filter IS NULL OR s.category_id = category_filter)
    AND (price_min IS NULL OR s.price_from >= price_min)
    AND (price_max IS NULL OR s.price_from <= price_max)
    AND (rating_min IS NULL OR s.rating >= rating_min)
    AND (search_location IS NULL OR s.location ILIKE '%' || search_location || '%')
  ORDER BY 
    s.rating DESC NULLS LAST,
    s.total_reviews DESC,
    s.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get provider dashboard stats
CREATE OR REPLACE FUNCTION get_provider_dashboard_stats(provider_user_id UUID)
RETURNS TABLE(
  total_earnings NUMERIC,
  monthly_earnings NUMERIC,
  total_bookings BIGINT,
  completed_bookings BIGINT,
  pending_bookings BIGINT,
  average_rating NUMERIC,
  total_reviews BIGINT,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(pe.net_amount), 0) as total_earnings,
    COALESCE(SUM(CASE 
      WHEN EXTRACT(MONTH FROM pe.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM pe.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      THEN pe.net_amount ELSE 0 END), 0) as monthly_earnings,
    COUNT(b.id) as total_bookings,
    COUNT(b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
    COUNT(b.id) FILTER (WHERE b.status = 'pending') as pending_bookings,
    COALESCE(AVG(pr.rating), 0) as average_rating,
    COUNT(pr.id) as total_reviews,
    CASE 
      WHEN COUNT(b.id) > 0 
      THEN (COUNT(b.id) FILTER (WHERE b.status = 'completed')::NUMERIC / COUNT(b.id)) * 100
      ELSE 0 
    END as completion_rate
  FROM profiles p
  LEFT JOIN bookings b ON b.provider_id = p.user_id
  LEFT JOIN provider_earnings pe ON pe.provider_id = p.user_id
  LEFT JOIN provider_reviews pr ON pr.provider_id = p.user_id
  WHERE p.user_id = provider_user_id
  GROUP BY p.user_id;
END;
$$ LANGUAGE plpgsql;

-- Function for advanced service search with full-text
CREATE OR REPLACE FUNCTION search_services(
  search_query TEXT DEFAULT NULL,
  category_filter UUID DEFAULT NULL,
  location_filter TEXT DEFAULT NULL,
  price_min NUMERIC DEFAULT NULL,
  price_max NUMERIC DEFAULT NULL,
  rating_min NUMERIC DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  price_from NUMERIC,
  location TEXT,
  rating NUMERIC,
  total_reviews INTEGER,
  provider_name TEXT,
  category_name TEXT,
  relevance_score REAL
) AS $$
DECLARE
  query_tsquery tsquery;
BEGIN
  -- Prepare search query
  IF search_query IS NOT NULL AND search_query != '' THEN
    query_tsquery := plainto_tsquery('english', search_query);
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.description,
    s.price_from,
    s.location,
    s.rating,
    s.total_reviews,
    COALESCE(pp.business_name, p.display_name) as provider_name,
    sc.name as category_name,
    CASE 
      WHEN query_tsquery IS NOT NULL 
      THEN ts_rank(s.search_vector, query_tsquery)
      ELSE 0
    END as relevance_score
  FROM services s
  JOIN service_categories sc ON sc.id = s.category_id
  JOIN profiles p ON p.user_id = s.provider_id
  LEFT JOIN provider_profiles pp ON pp.user_id = s.provider_id
  WHERE 
    s.is_available = true
    AND (category_filter IS NULL OR s.category_id = category_filter)
    AND (location_filter IS NULL OR s.location ILIKE '%' || location_filter || '%')
    AND (price_min IS NULL OR s.price_from >= price_min)
    AND (price_max IS NULL OR s.price_from <= price_max)
    AND (rating_min IS NULL OR s.rating >= rating_min)
    AND (query_tsquery IS NULL OR s.search_vector @@ query_tsquery)
  ORDER BY 
    CASE 
      WHEN sort_by = 'relevance' AND query_tsquery IS NOT NULL 
      THEN ts_rank(s.search_vector, query_tsquery)
      ELSE 0 
    END DESC,
    CASE WHEN sort_by = 'rating' THEN s.rating END DESC NULLS LAST,
    CASE WHEN sort_by = 'price_low' THEN s.price_from END ASC,
    CASE WHEN sort_by = 'price_high' THEN s.price_from END DESC,
    CASE WHEN sort_by = 'newest' THEN s.created_at END DESC,
    s.rating DESC NULLS LAST,
    s.total_reviews DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ANALYTICS OPTIMIZATION
-- =============================================

-- Function to get business analytics
CREATE OR REPLACE FUNCTION get_business_analytics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_revenue NUMERIC,
  total_bookings BIGINT,
  completed_bookings BIGINT,
  new_customers BIGINT,
  new_providers BIGINT,
  average_order_value NUMERIC,
  top_category TEXT,
  top_provider TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH analytics_data AS (
    SELECT 
      COALESCE(SUM(b.total_amount), 0) as revenue,
      COUNT(b.id) as bookings,
      COUNT(b.id) FILTER (WHERE b.status = 'completed') as completed,
      COUNT(DISTINCT p_customer.user_id) FILTER (WHERE p_customer.created_at::DATE BETWEEN start_date AND end_date) as new_customers,
      COUNT(DISTINCT p_provider.user_id) FILTER (WHERE p_provider.created_at::DATE BETWEEN start_date AND end_date) as new_providers,
      CASE 
        WHEN COUNT(b.id) FILTER (WHERE b.status = 'completed') > 0
        THEN SUM(b.total_amount) FILTER (WHERE b.status = 'completed') / COUNT(b.id) FILTER (WHERE b.status = 'completed')
        ELSE 0 
      END as avg_order_val
    FROM bookings b
    LEFT JOIN profiles p_customer ON p_customer.user_id = b.customer_id
    LEFT JOIN profiles p_provider ON p_provider.user_id = b.provider_id
    WHERE b.created_at::DATE BETWEEN start_date AND end_date
  ),
  top_category_data AS (
    SELECT sc.name as category_name
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    JOIN service_categories sc ON sc.id = s.category_id
    WHERE b.created_at::DATE BETWEEN start_date AND end_date
    GROUP BY sc.name
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ),
  top_provider_data AS (
    SELECT COALESCE(pp.business_name, p.display_name) as provider_name
    FROM bookings b
    JOIN profiles p ON p.user_id = b.provider_id
    LEFT JOIN provider_profiles pp ON pp.user_id = b.provider_id
    WHERE b.created_at::DATE BETWEEN start_date AND end_date
    GROUP BY COALESCE(pp.business_name, p.display_name)
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  SELECT 
    ad.revenue,
    ad.bookings,
    ad.completed,
    ad.new_customers,
    ad.new_providers,
    ad.avg_order_val,
    tcd.category_name,
    tpd.provider_name
  FROM analytics_data ad
  CROSS JOIN top_category_data tcd
  CROSS JOIN top_provider_data tpd;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PERFORMANCE MONITORING
-- =============================================

-- Create function to monitor query performance
CREATE OR REPLACE FUNCTION log_query_performance(
  query_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS VOID AS $$
DECLARE
  execution_time_ms INTEGER;
BEGIN
  execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  INSERT INTO query_performance_log (query_name, execution_time_ms)
  VALUES (query_name, execution_time_ms);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VACUUM AND ANALYZE OPTIMIZATION
-- =============================================

-- Function to optimize database maintenance
CREATE OR REPLACE FUNCTION optimize_database()
RETURNS TEXT AS $$
DECLARE
  result TEXT := '';
BEGIN
  -- Update statistics
  ANALYZE;
  result := result || 'Statistics updated. ';
  
  -- Reindex if needed (be careful in production)
  -- REINDEX DATABASE CONCURRENTLY;
  
  -- Refresh materialized views
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'provider_performance_summary') THEN
    REFRESH MATERIALIZED VIEW provider_performance_summary;
    result := result || 'Provider performance view refreshed. ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'category_performance_summary') THEN
    REFRESH MATERIALIZED VIEW category_performance_summary;
    result := result || 'Category performance view refreshed. ';
  END IF;
  
  RETURN result || 'Database optimization completed.';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FINAL OPTIMIZATIONS
-- =============================================

-- Update all table statistics
ANALYZE;

-- Log completion
INSERT INTO query_performance_log (query_name, execution_time_ms)
VALUES ('database_optimization_migration', 0);