import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  Star, 
  Calendar, 
  MapPin, 
  Clock,
  Target,
  Award,
  Zap,
  Eye,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AIServiceMatcher from './AIServiceMatcher';
import LoyaltyRewardsSystem from './LoyaltyRewardsSystem';

interface PersonalizedWidget {
  id: string;
  type: 'recommendations' | 'favorites' | 'recent_bookings' | 'achievements' | 'trending';
  title: string;
  data: Record<string, unknown>[];
  priority: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

export default function PersonalizedDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState<PersonalizedWidget[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalBookings: 0,
    favoriteProviders: 0,
    totalSpent: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (user) {
      loadPersonalizedContent();
    }
  }, [user]);

  const loadPersonalizedContent = async () => {
    try {
      setLoading(true);
      
      // Load user's data for personalization
      const [
        { data: bookings },
        { data: favorites },
        { data: recommendations },
        { data: achievements },
        { data: loyaltyData }
      ] = await Promise.all([
        supabase
          .from('bookings')
          .select('*, services(title, price_from)')
          .eq('customer_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('customer_favorites')
          .select('*, profiles(display_name, avatar_url)')
          .eq('customer_id', user?.id)
          .limit(5),
        supabase
          .from('ai_recommendations')
          .select('*, services(title, price_from, rating)')
          .eq('user_id', user?.id)
          .order('recommendation_score', { ascending: false })
          .limit(5),
        supabase
          .from('user_achievements')
          .select('*, achievements(name, icon, points_reward)')
          .eq('user_id', user?.id)
          .order('earned_at', { ascending: false })
          .limit(3),
        supabase
          .from('loyalty_program')
          .select('*')
          .eq('user_id', user?.id)
          .single()
      ]);

      // Calculate user stats
      const totalBookings = bookings?.length || 0;
      const favoriteProviders = favorites?.length || 0;
      const totalSpent = bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
      
      setUserStats({
        totalBookings,
        favoriteProviders,
        totalSpent,
        averageRating: 4.5 // Mock average rating
      });

      // Create personalized widgets based on user data
      const personalizedWidgets: PersonalizedWidget[] = [];

      // AI Recommendations Widget
      if (recommendations?.length) {
        personalizedWidgets.push({
          id: 'recommendations',
          type: 'recommendations',
          title: 'Recommended for You',
          data: recommendations,
          priority: 1
        });
      }

      // Recent Bookings Widget
      if (bookings?.length) {
        personalizedWidgets.push({
          id: 'recent_bookings',
          type: 'recent_bookings',
          title: 'Recent Bookings',
          data: bookings,
          priority: 2
        });
      }

      // Favorites Widget
      if (favorites?.length) {
        personalizedWidgets.push({
          id: 'favorites',
          type: 'favorites',
          title: 'Your Favorite Providers',
          data: favorites,
          priority: 3
        });
      }

      // Achievements Widget
      if (achievements?.length) {
        personalizedWidgets.push({
          id: 'achievements',
          type: 'achievements',
          title: 'Recent Achievements',
          data: achievements,
          priority: 4
        });
      }

      setWidgets(personalizedWidgets.sort((a, b) => a.priority - b.priority));

      // Create quick actions based on user behavior
      const actions: QuickAction[] = [
        {
          id: 'book_service',
          title: 'Book a Service',
          description: 'Find and book your next service',
          icon: <Calendar className="h-5 w-5" />,
          action: () => navigate('/services'),
          color: 'bg-blue-500'
        },
        {
          id: 'view_bookings',
          title: 'My Bookings',
          description: `${totalBookings} total bookings`,
          icon: <Eye className="h-5 w-5" />,
          action: () => navigate('/bookings'),
          color: 'bg-green-500'
        },
        {
          id: 'favorites',
          title: 'Favorites',
          description: `${favoriteProviders} saved providers`,
          icon: <Heart className="h-5 w-5" />,
          action: () => navigate('/favorites'),
          color: 'bg-red-500'
        },
        {
          id: 'messages',
          title: 'Messages',
          description: 'Chat with providers',
          icon: <MessageSquare className="h-5 w-5" />,
          action: () => navigate('/messages'),
          color: 'bg-purple-500'
        }
      ];

      // Add loyalty-specific actions if user has loyalty data
      if (loyaltyData) {
        actions.push({
          id: 'rewards',
          title: 'Rewards',
          description: `${loyaltyData.points_balance} points available`,
          icon: <Award className="h-5 w-5" />,
          action: () => {}, // Open rewards modal
          color: 'bg-yellow-500'
        });
      }

      setQuickActions(actions);

    } catch (error) {
      console.error('Error loading personalized content:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderWidget = (widget: PersonalizedWidget) => {
    switch (widget.type) {
      case 'recommendations':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.data.slice(0, 3).map((rec: any) => (
                  <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div>
                      <p className="font-medium">{rec.services?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(rec.recommendation_score)}% match
                      </p>
                    </div>
                    <Badge variant="outline">NAD {rec.services?.price_from}</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3" onClick={() => navigate('/services')}>
                View All Recommendations
              </Button>
            </CardContent>
          </Card>
        );

      case 'recent_bookings':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.data.slice(0, 3).map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.services?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3" onClick={() => navigate('/bookings')}>
                View All Bookings
              </Button>
            </CardContent>
          </Card>
        );

      case 'favorites':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.data.slice(0, 3).map((favorite: any) => (
                  <div key={favorite.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {favorite.profiles?.display_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-medium">{favorite.profiles?.display_name}</p>
                      <p className="text-sm text-muted-foreground">Favorite Provider</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3" onClick={() => navigate('/favorites')}>
                View All Favorites
              </Button>
            </CardContent>
          </Card>
        );

      case 'achievements':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.data.map((achievement: any) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="text-2xl">{achievement.achievements?.icon || '🏆'}</div>
                    <div>
                      <p className="font-medium">{achievement.achievements?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        +{achievement.achievements?.points_reward} points
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
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
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.display_name || 'there'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your services
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userStats.totalBookings}</div>
            <p className="text-sm text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userStats.favoriteProviders}</div>
            <p className="text-sm text-muted-foreground">Favorites</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">NAD {userStats.totalSpent}</div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userStats.averageRating}</div>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-20 flex-col gap-2 hover:scale-105 transition-transform"
                onClick={action.action}
              >
                <div className={`p-2 rounded-full ${action.color} text-white`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {widgets.map((widget) => (
              <div key={widget.id}>
                {renderWidget(widget)}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-recommendations">
          <AIServiceMatcher />
        </TabsContent>

        <TabsContent value="rewards">
          <LoyaltyRewardsSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
}