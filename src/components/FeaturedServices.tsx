import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ArrowRight, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FeaturedService {
  id: string;
  title: string;
  description: string;
  price_from: number;
  price_to: number | null;
  price_unit: string;
  location: string;
  rating: number;
  total_reviews: number;
  provider_id: string;
  service_categories: {
    name: string;
    icon: string;
  };
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
  service_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
}

const FeaturedServices = () => {
  const [services, setServices] = useState<FeaturedService[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedServices();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFeaturedServices = async () => {
    try {
      // Add retry logic for network issues
      let retries = 3;
      let data, error;
      
      while (retries > 0) {
        try {
          const result = await supabase
            .from('services')
            .select(`
              *,
              service_categories (name, icon),
              profiles (display_name, avatar_url),
              service_images (id, image_url, is_primary)
            `)
            .eq('is_available', true)
            .order('rating', { ascending: false })
            .limit(6);
          
          data = result.data;
          error = result.error;
          break;
        } catch (networkError) {
          retries--;
          if (retries === 0) {
            throw networkError;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Error fetching featured services:', error);
      // Don't show error toast on initial load to avoid spamming user
      if (services.length === 0) {
        console.log('Failed to load featured services, but not showing error to user on initial load');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('customer_favorites')
        .select('provider_id')
        .eq('customer_id', user.id);
      
      if (error) throw error;
      setFavorites(new Set(data.map(fav => fav.provider_id)));
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (providerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      const isFavorited = favorites.has(providerId);
      
      if (isFavorited) {
        await supabase
          .from('customer_favorites')
          .delete()
          .eq('customer_id', user.id)
          .eq('provider_id', providerId);
        
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(providerId);
          return newFavorites;
        });
      } else {
        await supabase
          .from('customer_favorites')
          .insert({ customer_id: user.id, provider_id: providerId });
        
        setFavorites(prev => new Set([...prev, providerId]));
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (priceFrom: number, priceTo: number | null, unit: string) => {
    if (priceTo && priceTo !== priceFrom) {
      return `N$${priceFrom} - N$${priceTo} ${unit}`;
    }
    return `N$${priceFrom} ${unit}`;
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Services</h2>
            <p className="text-muted-foreground">Discover top-rated services in your area</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-muted/30 via-background to-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
            Featured Services
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Top-rated professionals ready to serve you with excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-16">
          {services.map((service, index) => {
            const primaryImage = service.service_images?.find(img => img.is_primary) || service.service_images?.[0];
            const isFavorited = favorites.has(service.provider_id);
            
            return (
              <Card 
                key={service.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-lg"
                onClick={() => navigate(`/services/${service.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  {primaryImage ? (
                    <img 
                      src={primaryImage.image_url} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <div className="text-6xl opacity-30">🛠️</div>
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => toggleFavorite(service.provider_id, e)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                      isFavorited 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>

                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Available
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1 text-sm">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className="text-xs">
                      {service.service_categories.name}
                    </Badge>
                    {service.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-current text-yellow-400" />
                        <span className="font-medium">{service.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({service.total_reviews})</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 mb-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={service.profiles.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {service.profiles.display_name?.charAt(0) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {service.profiles.display_name || 'Service Provider'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{service.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-primary">
                        {formatPrice(service.price_from, service.price_to, service.price_unit)}
                      </div>
                      <p className="text-xs text-muted-foreground">Starting price</p>
                    </div>
                    <Button size="sm" className="shrink-0">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/services')}
            className="btn-hero"
          >
            View All Services
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;