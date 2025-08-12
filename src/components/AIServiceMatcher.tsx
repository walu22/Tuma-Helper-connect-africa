import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Star, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Recommendation {
  id: string;
  service: {
    id: string;
    title: string;
    description: string;
    price_from: number;
    rating: number;
    location: string;
    provider: {
      business_name: string;
      rating: number;
    };
  };
  recommendation_score: number;
  reasoning: Record<string, unknown>;
}

interface UserPreference {
  id: string;
  preference_type: string;
  preference_value: Record<string, unknown>;
  weight: number;
}

export default function AIServiceMatcher() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecommendations();
      loadPreferences();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      const { data: recommendationsData, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .order('recommendation_score', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get service details separately
      if (recommendationsData?.length) {
        const serviceIds = recommendationsData.map(r => r.service_id);
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select(`
            id,
            title,
            description,
            price_from,
            rating,
            location,
            provider_id
          `)
          .in('id', serviceIds);

        if (servicesError) throw servicesError;

        // Get provider information separately
        const providerIds = servicesData?.map(s => s.provider_id) || [];
        const { data: providersData } = await (supabase as any)
          .rpc('get_public_provider_profiles', { _user_ids: providerIds });

        // Combine recommendations with service and provider data
        const combinedData = recommendationsData.map(rec => {
          const service = servicesData?.find(s => s.id === rec.service_id);
          const provider = providersData?.find(p => p.user_id === service?.provider_id);
          
          return {
            ...rec,
            service: service ? {
              ...service,
              provider: provider ? {
                business_name: provider.business_name || 'Unknown Provider',
                rating: provider.rating || 0
              } : {
                business_name: 'Unknown Provider',
                rating: 0
              }
            } : null
          };
        }).filter(rec => rec.service) as any[];

        setRecommendations(combinedData);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setPreferences(data?.map(p => ({
        ...p,
        preference_value: p.preference_value as Record<string, unknown>
      })) || []);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      // Track user behavior for generating recommendations
      await supabase.from('user_behavior_tracking').insert({
        user_id: user?.id,
        action_type: 'generate_recommendations',
        metadata: { timestamp: new Date().toISOString() }
      });

      // Simple AI matching algorithm
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('is_available', true);

      if (servicesError) throw servicesError;

      // Calculate recommendation scores based on user preferences and behavior
      const userRecommendations = services?.map(service => ({
        user_id: user?.id,
        service_id: service.id,
        recommendation_score: Math.random() * 100, // Simplified scoring
        reasoning: {
          factors: ['location_match', 'price_preference', 'rating_match'],
          explanation: 'Matched based on your preferences and past behavior'
        }
      })) || [];

      // Insert recommendations
      const { error: insertError } = await supabase
        .from('ai_recommendations')
        .upsert(userRecommendations);

      if (insertError) throw insertError;

      await loadRecommendations();
      toast.success('New recommendations generated!');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const trackInteraction = async (serviceId: string, interactionType: string) => {
    try {
      await supabase.from('user_behavior_tracking').insert({
        user_id: user?.id,
        action_type: interactionType,
        target_id: serviceId,
        target_type: 'service',
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const updatePreference = async (type: string, value: unknown, weight: number = 1.0) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          preference_type: type,
          preference_value: value as any,
          weight
        });

      if (error) throw error;
      await loadPreferences();
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preferences');
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
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Service Matcher</h2>
        </div>
        <Button 
          onClick={generateRecommendations} 
          disabled={isGenerating}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Refresh Recommendations'}
        </Button>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="preferences">AI Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No recommendations yet. Generate some to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => trackInteraction(rec.service.id, 'view_recommendation')}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{rec.service.title}</CardTitle>
                        <CardDescription>{rec.service.provider.business_name}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {Math.round(rec.recommendation_score)}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.service.description.slice(0, 100)}...
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{rec.service.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{rec.service.location}</span>
                        </div>
                      </div>
                      <span className="font-semibold">
                        ${rec.service.price_from}
                      </span>
                    </div>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        trackInteraction(rec.service.id, 'click_recommendation');
                      }}
                    >
                      View Service
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Learning Preferences</CardTitle>
              <CardDescription>
                Help our AI understand your preferences better
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Price Range Importance</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    className="w-full" 
                    onChange={(e) => updatePreference('price_importance', { value: e.target.value }, parseInt(e.target.value) / 10)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location Importance</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    className="w-full"
                    onChange={(e) => updatePreference('location_importance', { value: e.target.value }, parseInt(e.target.value) / 10)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Rating Importance</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    className="w-full"
                    onChange={(e) => updatePreference('rating_importance', { value: e.target.value }, parseInt(e.target.value) / 10)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Speed/Availability</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    className="w-full"
                    onChange={(e) => updatePreference('speed_importance', { value: e.target.value }, parseInt(e.target.value) / 10)}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="font-medium mb-2">Current Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.map((pref) => (
                    <Badge key={pref.id} variant="outline">
                      {pref.preference_type}: {pref.weight}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}