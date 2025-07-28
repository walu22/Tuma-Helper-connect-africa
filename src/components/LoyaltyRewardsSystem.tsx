import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Star, Crown, Target, TrendingUp, Medal, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  points_reward: number;
  requirements: Record<string, unknown>;
  rarity: string;
  is_active: boolean;
  earned?: boolean;
  progress?: Record<string, unknown>;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  rank?: number;
  metadata: Record<string, unknown>;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
}

interface Leaderboard {
  id: string;
  name: string;
  category: string;
  period: string;
  entries?: LeaderboardEntry[];
}

interface UserStats {
  total_points: number;
  achievements_count: number;
  current_rank: number;
  tier: string;
}

export default function LoyaltyRewardsSystem() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total_points: 0,
    achievements_count: 0,
    current_rank: 0,
    tier: 'bronze'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
      loadLeaderboards();
      loadUserStats();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      const { data: achievementsData, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('points_reward', { ascending: false });

      if (error) throw error;

      // Get user's earned achievements
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('achievement_id, progress')
        .eq('user_id', user?.id);

      if (userError) throw userError;

      const achievementsWithProgress = achievementsData?.map(achievement => {
        const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
        return {
          ...achievement,
          earned: !!userAchievement,
          progress: userAchievement?.progress || {}
        };
      }) || [];

      setAchievements(achievementsWithProgress as any);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Failed to load achievements');
    }
  };

  const loadLeaderboards = async () => {
    try {
      const { data: leaderboardsData, error } = await supabase
        .from('leaderboards')
        .select('*')
        .order('name');

      if (error) throw error;

      // Load entries for each leaderboard
      const leaderboardsWithEntries = await Promise.all(
        (leaderboardsData || []).map(async (leaderboard) => {
          const { data: entries, error: entriesError } = await supabase
            .from('leaderboard_entries')
            .select('*')
            .eq('leaderboard_id', leaderboard.id)
            .order('rank', { ascending: true })
            .limit(10);

          if (entriesError) {
            console.error('Error loading leaderboard entries:', entriesError);
            return { ...leaderboard, entries: [] };
          }

          // Get user profiles separately
          const userIds = entries?.map(e => e.user_id) || [];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .in('user_id', userIds);

          return {
            ...leaderboard,
            entries: entries?.map(entry => ({
              ...entry,
              metadata: entry.metadata || {},
              user: profiles?.find(p => p.user_id === entry.user_id) || {}
            })) || []
          };
        })
      );

      setLeaderboards(leaderboardsWithEntries as any);
    } catch (error) {
      console.error('Error loading leaderboards:', error);
      toast.error('Failed to load leaderboards');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Get loyalty program data
      const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('loyalty_program')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (loyaltyError && loyaltyError.code !== 'PGRST116') throw loyaltyError;

      // Calculate total points from earned achievements
      const { data: userAchievements, error } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      // Get achievement details separately
      const achievementIds = userAchievements?.map(ua => ua.achievement_id) || [];
      const { data: achievementDetails } = await supabase
        .from('achievements')
        .select('points_reward')
        .in('id', achievementIds);

      const totalPoints = achievementDetails?.reduce((sum, achievement) => sum + (achievement.points_reward || 0), 0) || 0;

      setUserStats({
        total_points: loyaltyData?.points_balance || totalPoints,
        achievements_count: userAchievements?.length || 0,
        current_rank: Math.floor(Math.random() * 100) + 1, // Mock rank for demo
        tier: loyaltyData?.tier || 'bronze'
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const claimAchievement = async (achievementId: string) => {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user?.id,
          achievement_id: achievementId
        });

      if (error) throw error;

      await loadAchievements();
      await loadUserStats();
      toast.success('Achievement unlocked! 🎉');
    } catch (error) {
      console.error('Error claiming achievement:', error);
      toast.error('Failed to claim achievement');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'customer': return <Star className="h-5 w-5" />;
      case 'provider': return <Award className="h-5 w-5" />;
      case 'social': return <Trophy className="h-5 w-5" />;
      case 'platform': return <Target className="h-5 w-5" />;
      default: return <Gift className="h-5 w-5" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-orange-600';
      case 'silver': return 'text-gray-600';
      case 'gold': return 'text-yellow-600';
      case 'platinum': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Rewards & Achievements</h2>
        </div>
      </div>

      {/* User Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{userStats.total_points}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{userStats.achievements_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className={`h-5 w-5 ${getTierColor(userStats.tier)}`} />
              Current Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold capitalize ${getTierColor(userStats.tier)}`}>
              {userStats.tier}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">#{userStats.current_rank}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`relative ${achievement.earned ? 'bg-green-50 border-green-200' : ''}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        {achievement.icon ? (
                          <span className="text-2xl">{achievement.icon}</span>
                        ) : (
                          getCategoryIcon(achievement.category)
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{achievement.name}</CardTitle>
                        <CardDescription>{achievement.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`text-white ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </Badge>
                      <div className="text-sm font-medium text-primary">
                        +{achievement.points_reward} pts
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{achievement.earned ? '100%' : '0%'}</span>
                      </div>
                      <Progress value={achievement.earned ? 100 : 0} className="h-2" />
                    </div>
                    
                    {achievement.requirements && typeof achievement.requirements === 'object' && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Requirements:</span>
                        <div className="mt-1">
                          {Object.entries(achievement.requirements as Record<string, any>).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span>{key.replace('_', ' ')}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {achievement.earned ? (
                      <Badge variant="outline" className="w-full justify-center text-green-600 border-green-600">
                        <Award className="h-4 w-4 mr-1" />
                        Earned!
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => claimAchievement(achievement.id)}
                      >
                        Claim Achievement
                      </Button>
                    )}
                  </div>
                </CardContent>
                {achievement.earned && (
                  <div className="absolute top-2 right-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboards" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {leaderboards.map((leaderboard) => (
              <Card key={leaderboard.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{leaderboard.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {leaderboard.category.replace('_', ' ')} • {leaderboard.period}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboard.entries?.length ? (
                    <div className="space-y-3">
                      {leaderboard.entries.slice(0, 5).map((entry, index) => (
                        <div key={entry.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">
                                {entry.user?.display_name || 'Anonymous'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {entry.score} points
                              </div>
                            </div>
                          </div>
                          {index < 3 && (
                            <div className="text-2xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No entries yet
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}