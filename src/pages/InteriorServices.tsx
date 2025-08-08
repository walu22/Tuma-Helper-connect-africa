import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Heart, ArrowRight, Clock, MapPin, Palette, Home, Wrench, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import BookingForm from '@/components/BookingForm';

interface InteriorService {
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

const InteriorServices = () => {
  const [services, setServices] = useState<InteriorService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<InteriorService | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const interiorCategories = [
    { id: 'all', name: 'All Interior', icon: Home, color: 'bg-primary/10' },
    { id: 'design', name: 'Interior Design', icon: Palette, color: 'bg-primary/10' },
    { id: 'painting', name: 'Painting', icon: Palette, color: 'bg-blue/10' },
    { id: 'flooring', name: 'Flooring', icon: Home, color: 'bg-green/10' },
    { id: 'plumbing', name: 'Plumbing', icon: Wrench, color: 'bg-blue/10' },
    { id: 'electrical', name: 'Electrical', icon: Lightbulb, color: 'bg-yellow/10' },
    { id: 'cleaning', name: 'Cleaning', icon: Sparkles, color: 'bg-purple/10' },
    { id: 'renovation', name: 'Renovation', icon: Wrench, color: 'bg-orange/10' },
  ];

  useEffect(() => {
    fetchInteriorServices();
  }, [selectedCategory, searchQuery]);

  // SEO tags
  useEffect(() => {
    document.title = 'Interior Services | HomeHero Namibia';
    const desc = 'Find and book trusted interior services in Namibia.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, []);

  const fetchInteriorServices = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('services')
        .select(`
          *,
          service_categories (name, icon),
          profiles (display_name, avatar_url, user_id),
          service_images (id, image_url, is_primary)
        `)
        .eq('is_available', true);

      // Filter for interior services using keywords
      const interiorKeywords = [
        'interior', 'painting', 'flooring', 'plumbing', 'electrical', 
        'remodeling', 'cleaning', 'hvac', 'windows', 'design', 'renovation',
        'kitchen', 'bathroom', 'bedroom', 'living room'
      ];

      if (selectedCategory !== 'all') {
        // Add category-specific filtering
        query = query.ilike('title', `%${selectedCategory}%`);
      }

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.order('rating', { ascending: false }).limit(20);

      if (error) throw error;

      // Filter for interior services on the client side for more control
      const interiorServices = data?.filter(service => {
        const title = service.title.toLowerCase();
        const description = service.description.toLowerCase();
        const categoryName = service.service_categories?.name?.toLowerCase() || '';
        
        return interiorKeywords.some(keyword => 
          title.includes(keyword) || 
          description.includes(keyword) || 
          categoryName.includes(keyword)
        );
      }) || [];

      setServices(interiorServices);
    } catch (error: any) {
      console.error('Error fetching interior services:', error);
      toast({
        title: "Error",
        description: "Failed to load interior services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceFrom: number, priceTo: number | null, unit: string) => {
    if (priceTo && priceTo !== priceFrom) {
      return `N$${priceFrom} - N$${priceTo} ${unit}`;
    }
    return `N$${priceFrom} ${unit}`;
  };

  const handleBookService = (service: InteriorService) => {
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
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
              Interior Services
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Transform your indoor spaces with trusted Namibian professionals
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search interior services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg border-0 bg-white/95 text-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {interiorCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          ) : services.length === 0 ? (
            <div className="text-center py-16">
              <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No interior services found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or browse all services
              </p>
              <Button onClick={() => navigate('/services')}>
                Browse All Services
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">
                  {services.length} Interior Services Found
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => {
                  const primaryImage = service.service_images?.find(img => img.is_primary) || service.service_images?.[0];
                  
                  return (
                    <Card 
                      key={service.id}
                      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
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
                            <Home className="w-16 h-16 text-primary/40" />
                          </div>
                        )}
                        
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-white/90">
                            <Clock className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {service.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {service.description}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">
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
                        <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={service.profiles.avatar_url || ''} />
                            <AvatarFallback>
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
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookService(service);
                            }}
                          >
                            Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Book {selectedService?.title}</DialogTitle>
            <DialogDescription>Secure your booking and pay online.</DialogDescription>
          </DialogHeader>
          {selectedService && (
            <BookingForm
              service={{
                id: selectedService.id,
                title: selectedService.title,
                price_from: selectedService.price_from,
                price_to: selectedService.price_to,
                price_unit: selectedService.price_unit,
                profiles: {
                  display_name: selectedService.profiles.display_name,
                  user_id: selectedService.profiles.user_id || selectedService.provider_id,
                },
              }}
              onClose={() => setBookingOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default InteriorServices;