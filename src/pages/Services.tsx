import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Heart, Clock, CheckCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdvancedSearchFilters from '@/components/AdvancedSearchFilters';
import MobileOptimizedBooking from '@/components/MobileOptimizedBooking';
import RealTimeChatSystem from '@/components/RealTimeChatSystem';
import { useIsMobile } from '@/hooks/use-mobile';

interface Service {
  id: string;
  title: string;
  description: string;
  price_from: number;
  price_to: number | null;
  price_unit: string;
  location: string;
  rating: number;
  total_reviews: number;
  is_available: boolean;
  category_id: string;
  provider_id: string;
  service_categories: {
    name: string;
    icon: string;
  };
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
    user_id: string;
  };
  service_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
  is_favorited?: boolean;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Fetch favorites for logged-in users
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

  // Toggle favorite
  const toggleFavorite = async (serviceId: string, providerId: string, e: React.MouseEvent) => {
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

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching services data...');

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      console.log('Categories response:', { categoriesData, categoriesError });
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // First try the simplest possible query to test RLS
      console.log('Testing basic services query...');
      const { data: basicTest, error: basicError } = await supabase
        .from('services')
        .select('id, title, description')
        .eq('is_available', true)
        .limit(3);
      
      console.log('Basic test result:', { basicTest, basicError });

      if (basicError) {
        console.error('Basic services query failed:', basicError);
        throw basicError;
      }

      // Build services query - simplified to avoid RLS issues
      console.log('Building services query...');
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          service_categories (
            name,
            icon
          ),
          profiles (
            display_name,
            avatar_url,
            user_id
          ),
          service_images (
            id,
            image_url,
            is_primary
          )
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(20);
      console.log('Services response:', { servicesData, servicesError, queryLength: servicesData?.length });
      if (servicesError) throw servicesError;

      // Transform services data to ensure all properties have fallback values
      const transformedServices = (servicesData || []).map(service => ({
        ...service,
        title: service.title || 'Untitled Service',
        description: service.description || 'No description available',
        location: service.location || 'Location not specified',
        price_unit: service.price_unit || 'per service',
        rating: service.rating || 0,
        total_reviews: service.total_reviews || 0,
        service_categories: service.service_categories || { name: 'Uncategorized', icon: '' },
        profiles: service.profiles || { display_name: 'Service Provider', avatar_url: null, user_id: service.provider_id },
        service_images: service.service_images || []
      }));
      
      // Remove duplicates based on title and provider_id to handle any database duplicates
      const uniqueServices = transformedServices.reduce((acc: Service[], current) => {
        const isDuplicate = acc.some(service => 
          service.title === current.title && service.provider_id === current.provider_id
        );
        if (!isDuplicate) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setServices(uniqueServices);
      console.log('Services set to state:', servicesData?.length || 0, 'services');
      
      // Fetch favorites for logged-in users
      if (user) {
        fetchFavorites();
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast({
        title: "Error loading services",
        description: error.message || 'Failed to load services',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load only
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    const initialFilters = {
      query: searchParam || '',
      category: categoryParam || '',
    };
    setSearchFilters(initialFilters);
    
    fetchData();
  }, []); // Only run once on mount

  // Refetch when filters change
  useEffect(() => {
    if (categories.length > 0 && Object.keys(searchFilters).length > 0) {
      fetchData();
    }
  }, [searchFilters]);

  const handleSearch = (filters: Record<string, unknown>) => {
    setSearchFilters(filters);
    // Update URL params
    const params = new URLSearchParams();
    if (filters.query) params.set('search', filters.query);
    if (filters.category) params.set('category', filters.category);
    navigate(`/services?${params.toString()}`, { replace: true });
  };

  const handleFiltersChange = (filters: Record<string, unknown>) => {
    setSearchFilters(filters);
  };

  const handleBookService = (service: Service) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to book services",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleContactProvider = (service: Service) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to contact providers",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setSelectedService(service);
    setShowChatModal(true);
  };

  // Apply filters to services
  const filteredServices = services.filter(service => {
    // Text search
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      const matchesText = 
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.location.toLowerCase().includes(query);
      if (!matchesText) return false;
    }

    // Category filter
    if (searchFilters.category && searchFilters.category !== 'all') {
      if (service.category_id !== searchFilters.category) return false;
    }

    // Price range filter
    if (searchFilters.priceRange) {
      const [minPrice, maxPrice] = searchFilters.priceRange;
      if (service.price_from < minPrice || service.price_from > maxPrice) return false;
    }

    // Rating filter
    if (searchFilters.rating > 0) {
      if (service.rating < searchFilters.rating) return false;
    }

    // Verified filter
    if (searchFilters.verified) {
      // Assume all services are verified for now
    }

    return true;
  });

  // Sort filtered services
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (searchFilters.sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price_low':
        return a.price_from - b.price_from;
      case 'price_high':
        return b.price_from - a.price_from;
      case 'newest':
        // Since created_at doesn't exist, use id as a proxy for creation order
        return b.id.localeCompare(a.id);
      case 'popular':
        return b.total_reviews - a.total_reviews;
      default:
        return 0; // relevance - would need more complex scoring
    }
  });

  const formatPrice = (priceFrom: number, priceTo: number | null, unit: string) => {
    if (priceTo && priceTo !== priceFrom) {
      return `N$${priceFrom} - N$${priceTo} ${unit}`;
    }
    return `N$${priceFrom} ${unit}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Services in Windhoek</h1>
          <p className="text-muted-foreground">Find trusted service providers near you</p>
        </div>

        {/* Advanced Search Filters */}
        <AdvancedSearchFilters
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
          initialFilters={searchFilters}
          className="mb-8"
        />

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''} found
          </p>
          {user && (
            <p className="text-sm text-muted-foreground">
              {favorites.size} favorite{favorites.size !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Services Grid */}
        {sortedServices.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or browse all categories
            </p>
            <Button onClick={() => {
              setSearchFilters({ query: '', category: '' });
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedServices.map((service) => {
              const primaryImage = service.service_images?.find(img => img.is_primary) || service.service_images?.[0];
              const isFavorited = favorites.has(service.provider_id);
              
              return (
                <Card 
                  key={service.id} 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-lg"
                >
                  {/* Service Image with Favorite Button */}
                  <div className="relative h-48 overflow-hidden">
                    {primaryImage ? (
                      <img 
                        src={primaryImage.image_url || ''} 
                        alt={service.title || ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <div className="text-6xl opacity-30">🛠️</div>
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(service.id, service.provider_id, e)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                        isFavorited 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>

                    {/* Verified Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-green-500 text-white border-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>

                    {/* Availability Indicator */}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Available Today
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                          {service.title || 'Untitled Service'}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1 text-sm">
                          {service.description || 'No description available'}
                        </CardDescription>
                      </div>
                    </div>
                    
                    {/* Rating and Category */}
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">
                        {service.service_categories?.name || 'Uncategorized'}
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
                    {/* Provider Info */}
                    <div className="flex items-center gap-3 mb-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={service.profiles?.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {service.profiles?.display_name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {service.profiles?.display_name || 'Service Provider'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{service.location || 'Location not specified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
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
        )}
      </div>

      {/* Mobile Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className={`${isMobile ? 'w-full h-full max-w-none m-0 rounded-none' : 'max-w-4xl'}`}>
          {selectedService && (
            <MobileOptimizedBooking
              service={selectedService}
              onClose={() => setShowBookingModal(false)}
              onSuccess={() => {
                setShowBookingModal(false);
                navigate('/bookings');
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chat with Provider</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <RealTimeChatSystem
              receiverId={selectedService.profiles.user_id}
              onClose={() => setShowChatModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Services;