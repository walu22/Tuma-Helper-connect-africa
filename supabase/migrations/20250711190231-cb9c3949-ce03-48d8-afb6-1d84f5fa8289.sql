-- AI-powered service matching tables
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preference_type TEXT NOT NULL,
  preference_value JSONB NOT NULL DEFAULT '{}',
  weight NUMERIC DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  recommendation_score NUMERIC NOT NULL,
  reasoning JSONB DEFAULT '{}',
  interaction_type TEXT DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_behavior_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IoT integration tables
CREATE TABLE public.iot_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_model TEXT,
  manufacturer TEXT,
  status TEXT DEFAULT 'active',
  capabilities JSONB DEFAULT '{}',
  last_seen TIMESTAMP WITH TIME ZONE,
  device_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.smart_service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  automated BOOLEAN DEFAULT true,
  device_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blockchain tables
CREATE TABLE public.crypto_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL UNIQUE,
  wallet_type TEXT NOT NULL,
  blockchain_network TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.blockchain_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID,
  transaction_hash TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  network TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  block_number BIGINT,
  gas_fee NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Social features tables
CREATE TABLE public.provider_community (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  privacy_level TEXT DEFAULT 'public',
  created_by UUID NOT NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'discussion',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.post_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- Gamification tables
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  points_reward INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '{}',
  rarity TEXT DEFAULT 'common',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE public.leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  period TEXT DEFAULT 'monthly',
  city_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.leaderboard_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leaderboard_id UUID NOT NULL,
  user_id UUID NOT NULL,
  score NUMERIC NOT NULL,
  rank INTEGER,
  metadata JSONB DEFAULT '{}',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(leaderboard_id, user_id, period_start)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_community ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI features
CREATE POLICY "Users can manage their preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their recommendations" ON public.ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their behavior data" ON public.user_behavior_tracking
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for IoT features
CREATE POLICY "Users can manage their IoT devices" ON public.iot_devices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view service requests for their devices" ON public.smart_service_requests
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.iot_devices 
    WHERE iot_devices.id = smart_service_requests.device_id 
    AND iot_devices.user_id = auth.uid()
  ));

-- RLS Policies for Blockchain features
CREATE POLICY "Users can manage their crypto wallets" ON public.crypto_wallets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their blockchain transactions" ON public.blockchain_transactions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = blockchain_transactions.booking_id 
    AND (bookings.customer_id = auth.uid() OR bookings.provider_id = auth.uid())
  ));

-- RLS Policies for Social features
CREATE POLICY "Communities are viewable by members" ON public.provider_community
  FOR SELECT USING (
    privacy_level = 'public' OR 
    EXISTS (SELECT 1 FROM public.community_members WHERE community_id = provider_community.id AND user_id = auth.uid())
  );

CREATE POLICY "Community creators can manage their communities" ON public.provider_community
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can view community memberships" ON public.community_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_members.community_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "Users can manage their community memberships" ON public.community_members
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Community members can view posts" ON public.community_posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.community_members WHERE community_id = community_posts.community_id AND user_id = auth.uid())
  );

CREATE POLICY "Community members can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM public.community_members WHERE community_id = community_posts.community_id AND user_id = auth.uid())
  );

CREATE POLICY "Authors can update their posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can manage their post interactions" ON public.post_interactions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Gamification features
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Leaderboards are viewable by everyone" ON public.leaderboards
  FOR SELECT USING (true);

CREATE POLICY "Leaderboard entries are viewable by everyone" ON public.leaderboard_entries
  FOR SELECT USING (true);

-- Create triggers for timestamps
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iot_devices_updated_at
  BEFORE UPDATE ON public.iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_community_updated_at
  BEFORE UPDATE ON public.provider_community
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at
  BEFORE UPDATE ON public.leaderboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample achievements
INSERT INTO public.achievements (name, description, category, icon, points_reward, requirements, rarity) VALUES
('First Booking', 'Complete your first service booking', 'customer', '🎯', 50, '{"bookings_completed": 1}', 'common'),
('Service Pro', 'Complete 10 services as a provider', 'provider', '⭐', 200, '{"services_completed": 10}', 'uncommon'),
('Top Rated', 'Maintain 5-star rating with 20+ reviews', 'provider', '🏆', 500, '{"rating": 5.0, "review_count": 20}', 'rare'),
('Community Builder', 'Create a community with 50+ members', 'social', '👥', 300, '{"community_members": 50}', 'uncommon'),
('IoT Pioneer', 'Connect your first smart device', 'iot', '🔌', 100, '{"connected_devices": 1}', 'common'),
('Crypto Champion', 'Complete a payment using cryptocurrency', 'blockchain', '₿', 250, '{"crypto_payments": 1}', 'uncommon');

-- Insert sample leaderboards
INSERT INTO public.leaderboards (name, category, period) VALUES
('Top Providers', 'provider_performance', 'monthly'),
('Most Active Community Members', 'social_engagement', 'weekly'),
('Customer Champions', 'customer_satisfaction', 'monthly'),
('IoT Innovators', 'iot_usage', 'monthly');