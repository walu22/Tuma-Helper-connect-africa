/*
  # AI Recommendations and Loyalty System

  1. New Tables
    - `user_behavior_tracking` - Track user interactions for AI learning
    - `ai_recommendations` - Store AI-generated service recommendations
    - `user_preferences` - Store user preferences for personalization
    - `loyalty_program` - Customer loyalty points and tiers
    - `user_achievements` - Gamification achievements
    - `smart_recommendations` - Advanced recommendation engine results

  2. Security
    - Enable RLS on all new tables
    - Add policies for user data access
    - Admin policies for system management

  3. Functions
    - AI recommendation generation
    - Loyalty point calculation
    - User behavior analysis
*/

-- User Behavior Tracking for AI Learning
CREATE TABLE IF NOT EXISTS user_behavior_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_id uuid,
  target_type text,
  metadata jsonb DEFAULT '{}',
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  recommendation_score numeric NOT NULL,
  reasoning jsonb DEFAULT '{}',
  interaction_type text DEFAULT 'view',
  created_at timestamptz DEFAULT now()
);

-- User Preferences for Personalization
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  preference_type text NOT NULL,
  preference_value jsonb NOT NULL DEFAULT '{}',
  weight numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Smart Recommendations (Advanced)
CREATE TABLE IF NOT EXISTS smart_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  recommendation_type text NOT NULL,
  content jsonb NOT NULL,
  score numeric NOT NULL,
  is_shown boolean DEFAULT false,
  is_clicked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Loyalty Program
CREATE TABLE IF NOT EXISTS loyalty_program (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  points_balance integer DEFAULT 0,
  tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  total_earned_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Achievements System
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  icon text,
  points_reward integer DEFAULT 0,
  requirements jsonb DEFAULT '{}',
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  progress jsonb DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  period text DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
  city_id uuid REFERENCES cities(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leaderboard Entries
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id uuid NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  score numeric NOT NULL,
  rank integer,
  metadata jsonb DEFAULT '{}',
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(leaderboard_id, user_id, period_start)
);

-- Enable RLS
ALTER TABLE user_behavior_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their behavior data"
  ON user_behavior_tracking FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their recommendations"
  ON ai_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their recommendations"
  ON smart_recommendations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their loyalty data"
  ON loyalty_program FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can view their achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Leaderboards are viewable by everyone"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Leaderboard entries are viewable by everyone"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for Performance
CREATE INDEX idx_user_behavior_user_id ON user_behavior_tracking(user_id);
CREATE INDEX idx_user_behavior_action_type ON user_behavior_tracking(action_type);
CREATE INDEX idx_user_behavior_created_at ON user_behavior_tracking(created_at);

CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_score ON ai_recommendations(recommendation_score DESC);

CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_type ON user_preferences(preference_type);

CREATE INDEX idx_smart_recommendations_user ON smart_recommendations(user_id);

CREATE INDEX idx_loyalty_program_tier ON loyalty_program(tier);
CREATE INDEX idx_loyalty_program_points ON loyalty_program(points_balance DESC);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

CREATE INDEX idx_leaderboard_entries_leaderboard ON leaderboard_entries(leaderboard_id);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(rank);

-- Triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_program_updated_at
  BEFORE UPDATE ON loyalty_program
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at
  BEFORE UPDATE ON leaderboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- AI Recommendation Function
CREATE OR REPLACE FUNCTION generate_ai_recommendations(target_user_id uuid)
RETURNS void AS $$
DECLARE
  user_behavior record;
  service_record record;
  recommendation_score numeric;
BEGIN
  -- Clear old recommendations
  DELETE FROM ai_recommendations 
  WHERE user_id = target_user_id 
  AND created_at < now() - interval '7 days';
  
  -- Generate new recommendations based on user behavior
  FOR user_behavior IN 
    SELECT action_type, target_type, COUNT(*) as frequency
    FROM user_behavior_tracking 
    WHERE user_id = target_user_id 
    AND created_at > now() - interval '30 days'
    GROUP BY action_type, target_type
  LOOP
    -- Find similar services based on behavior patterns
    FOR service_record IN
      SELECT s.*, AVG(pr.rating) as avg_rating
      FROM services s
      LEFT JOIN provider_reviews pr ON pr.provider_id = s.provider_id
      WHERE s.is_available = true
      GROUP BY s.id
      ORDER BY avg_rating DESC NULLS LAST
      LIMIT 10
    LOOP
      -- Calculate recommendation score (simplified algorithm)
      recommendation_score := (
        COALESCE(service_record.avg_rating, 0) * 20 +
        user_behavior.frequency * 10 +
        RANDOM() * 50
      );
      
      -- Insert recommendation if score is high enough
      IF recommendation_score > 50 THEN
        INSERT INTO ai_recommendations (
          user_id,
          service_id,
          recommendation_score,
          reasoning
        ) VALUES (
          target_user_id,
          service_record.id,
          recommendation_score,
          jsonb_build_object(
            'factors', ARRAY['rating_match', 'behavior_pattern'],
            'score_breakdown', jsonb_build_object(
              'rating_score', COALESCE(service_record.avg_rating, 0) * 20,
              'behavior_score', user_behavior.frequency * 10
            )
          )
        ) ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Loyalty Points Function
CREATE OR REPLACE FUNCTION award_loyalty_points(target_user_id uuid, points integer, reason text)
RETURNS void AS $$
DECLARE
  current_points integer;
  new_tier text;
BEGIN
  -- Get current points
  SELECT points_balance INTO current_points
  FROM loyalty_program
  WHERE user_id = target_user_id;
  
  -- Create loyalty record if doesn't exist
  IF current_points IS NULL THEN
    INSERT INTO loyalty_program (user_id, points_balance, total_earned_points)
    VALUES (target_user_id, points, points);
    current_points := 0;
  ELSE
    -- Update points
    UPDATE loyalty_program
    SET 
      points_balance = points_balance + points,
      total_earned_points = total_earned_points + points,
      updated_at = now()
    WHERE user_id = target_user_id;
  END IF;
  
  -- Calculate new tier
  current_points := current_points + points;
  
  IF current_points >= 10000 THEN
    new_tier := 'platinum';
  ELSIF current_points >= 5000 THEN
    new_tier := 'gold';
  ELSIF current_points >= 1000 THEN
    new_tier := 'silver';
  ELSE
    new_tier := 'bronze';
  END IF;
  
  -- Update tier if changed
  UPDATE loyalty_program
  SET tier = new_tier
  WHERE user_id = target_user_id AND tier != new_tier;
  
  -- Track the points award
  INSERT INTO user_behavior_tracking (
    user_id,
    action_type,
    metadata
  ) VALUES (
    target_user_id,
    'points_awarded',
    jsonb_build_object(
      'points', points,
      'reason', reason,
      'new_balance', current_points
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert Sample Achievements
INSERT INTO achievements (name, description, category, icon, points_reward, requirements, rarity) VALUES
('First Booking', 'Complete your first service booking', 'customer', '🎯', 100, '{"bookings_count": 1}', 'common'),
('Loyal Customer', 'Book 10 services', 'customer', '❤️', 500, '{"bookings_count": 10}', 'uncommon'),
('Review Master', 'Leave 25 helpful reviews', 'customer', '⭐', 300, '{"reviews_count": 25}', 'uncommon'),
('Service Champion', 'Complete 50 services as provider', 'provider', '🏆', 1000, '{"completed_jobs": 50}', 'rare'),
('Five Star Provider', 'Maintain 5.0 rating with 20+ reviews', 'provider', '🌟', 750, '{"rating": 5.0, "reviews": 20}', 'rare'),
('Speed Demon', 'Respond to 100 bookings within 15 minutes', 'provider', '⚡', 400, '{"fast_responses": 100}', 'uncommon'),
('Community Helper', 'Help 5 new providers get started', 'social', '🤝', 600, '{"referrals": 5}', 'rare'),
('Early Adopter', 'One of the first 1000 users', 'platform', '🚀', 200, '{"user_number": 1000}', 'epic'),
('Perfectionist', 'Complete 20 jobs with zero complaints', 'provider', '💎', 800, '{"perfect_jobs": 20}', 'epic'),
('Platform Ambassador', 'Refer 10 new users who complete bookings', 'social', '👑', 1500, '{"successful_referrals": 10}', 'legendary')
ON CONFLICT DO NOTHING;

-- Insert Sample Leaderboards
INSERT INTO leaderboards (name, category, period) VALUES
('Top Earners', 'provider_earnings', 'monthly'),
('Customer Champions', 'customer_bookings', 'monthly'),
('Review Leaders', 'review_count', 'monthly'),
('Response Speed', 'provider_response', 'weekly'),
('Service Quality', 'provider_rating', 'monthly')
ON CONFLICT DO NOTHING;