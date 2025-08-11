import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Heart, ArrowRight, Clock, MapPin, TreePine, Flower, Scissors, Droplets, Sun, Sprout } from 'lucide-react';
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
import ServiceCard from '@/components/ServiceCard';
import FiltersBar from '@/components/FiltersBar';

interface GardenService {
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
    user_id?: string | null;
  };
  service_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
}

const LawnGardenServices = () => {
  const [services, setServices] = useState<GardenService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<GardenService | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState<number>(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const gardenCategories = [
    { id: 'all', name: 'All Garden', icon: TreePine, color: 'bg-green/10' },
    { id: 'landscaping', name: 'Landscaping', icon: TreePine, color: 'bg-green/10' },
    { id: 'lawn', name: 'Lawn Care', icon: Scissors, color: 'bg-green/10' },
    { id: 'irrigation', name: 'Irrigation', icon: Droplets, color: 'bg-blue/10' },
    { id: 'tree', name: 'Tree Services', icon: TreePine, color: 'bg-brown/10' },
    { id: 'garden', name: 'Garden Design', icon: Flower, color: 'bg-pink/10' },
    { id: 'maintenance', name: 'Maintenance', icon: Sun, color: 'bg-yellow/10' },
    { id: 'planting', name: 'Planting', icon: Sprout, color: 'bg-green/10' },
  ];

  useEffect(() => {
    fetchGardenServices();
  }, [selectedCategory, searchQuery, priceRange, minRating]);

  // SEO tags
  useEffect(() => {
    document.title = 'Lawn & Garden Services | HomeHero Namibia';
    const desc = 'Discover and book lawn & garden services across Namibia.';
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

  const fetchGardenServices = async () => {
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
        .eq('is_available', true)
        .gte('price_from', priceRange[0])
        .lte('price_from', priceRange[1]);

      // Filter for lawn and garden services using keywords
      const gardenKeywords = [
        'garden', 'landscaping', 'lawn', 'tree', 'plant', 'irrigation',
        'outdoor', 'yard', 'maintenance', 'grass', 'flower', 'shrub',
        'hedge', 'pruning', 'trimming', 'mulch', 'fertilizer', 'soil'
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

      if (minRating > 0) {
        query = query.gte('rating', minRating);
      }

      const { data, error } = await query.order('rating', { ascending: false }).limit(20);

      if (error) throw error;

      // Filter for garden services on the client side for more control
      const gardenServices = data?.filter(service => {
        const title = service.title.toLowerCase();
        const description = service.description.toLowerCase();
        const categoryName = service.service_categories?.name?.toLowerCase() || '';
        
        return gardenKeywords.some(keyword => 
          title.includes(keyword) || 
          description.includes(keyword) || 
          categoryName.includes(keyword)
        );
      }) || [];

      setServices(gardenServices);
    } catch (error: any) {
      console.error('Error fetching garden services:', error);
      toast({
        title: "Error",
        description: "Failed to load lawn & garden services",
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

  const handleBookService = (service: GardenService) => {
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
      <section className="py-20 bg-gradient-accent text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
              Lawn & Garden Services
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Transform your outdoor spaces with expert Namibian landscapers and gardeners
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search lawn & garden services..."
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
            {gardenCategories.map((category) => {
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

      {/* Quick Filters */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <FiltersBar
            value={{ priceRange, rating: minRating }}
            onChange={(v) => {
              setPriceRange(v.priceRange);
              setMinRating(v.rating);
            }}
            maxPrice={1000}
          />
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
              <TreePine className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No lawn & garden services found</h3>
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
                  {services.length} Lawn & Garden Services Found
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBook={(svc) => handleBookService(svc as unknown as GardenService)}
                    onOpen={(id) => navigate(`/services/${id}`)}
                  />
                ))}
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

export default LawnGardenServices;