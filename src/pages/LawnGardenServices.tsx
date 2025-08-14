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
    { id: 'all', name: 'All Garden', icon: TreePine, color: 'bg-success/10' },
    { id: 'landscaping', name: 'Landscaping', icon: TreePine, color: 'bg-success/10' },
    { id: 'lawn', name: 'Lawn Care', icon: Scissors, color: 'bg-success/10' },
    { id: 'irrigation', name: 'Irrigation', icon: Droplets, color: 'bg-accent/10' },
    { id: 'tree', name: 'Tree Services', icon: TreePine, color: 'bg-secondary/10' },
    { id: 'garden', name: 'Garden Design', icon: Flower, color: 'bg-primary/10' },
    { id: 'maintenance', name: 'Maintenance', icon: Sun, color: 'bg-warning/10' },
    { id: 'planting', name: 'Planting', icon: Sprout, color: 'bg-success/10' },
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
      <section className="py-20 bg-gradient-to-br from-success via-success-light to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCAyIDQgNC0yIDQtNCA0LTQtMi00LTR6bTAgMTJjMC0yIDItNCA0LTRzNCAyIDQgNC0yIDQtNCA0LTQtMi00LTR6TTEwIDM0YzAtMiAyLTQgNC00czQgMiA0IDQtMiA0LTQgNC00LTItNC00em0yNCAyMmMwLTIgMi00IDQtNHM0IDIgNCA0LTIgNC00IDQtNC0yLTQtNHptMC0xMmMwLTIgMi00IDQtNHM0IDIgNCA0LTIgNC00IDQtNC0yLTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <TreePine className="w-5 h-5" />
              <span className="text-sm font-medium">Namibia's Garden Experts</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
              Lawn & Garden Services
            </h1>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Transform your outdoor spaces with expert Namibian landscapers and gardeners. From desert-adapted plants to lush green lawns.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search lawn & garden services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg border-0 bg-white/95 text-foreground shadow-soft hover:shadow-medium transition-all duration-300"
              />
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{services.length}+</div>
                <div className="text-sm text-white/80">Garden Experts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">50+</div>
                <div className="text-sm text-white/80">Services Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">4.8★</div>
                <div className="text-sm text-white/80">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Browse by Service Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {gardenCategories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex flex-col items-center gap-2 p-4 h-auto transition-all duration-300 ${
                    isSelected 
                      ? 'bg-success text-success-foreground shadow-success hover:shadow-elevated' 
                      : 'hover:bg-success/5 hover:border-success/20 hover:shadow-soft'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
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
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-success/10 rounded-full blur-xl"></div>
                </div>
                <TreePine className="w-16 h-16 mx-auto text-success relative z-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No lawn & garden services found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search filters or explore our other service categories
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 1000]);
                    setMinRating(0);
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
                <Button onClick={() => navigate('/services')} className="btn-success">
                  Browse All Services
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {services.length} Lawn & Garden Services Found
                  </h2>
                  <p className="text-muted-foreground">
                    Professional garden and landscaping services across Namibia
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span>Trusted by 1000+ customers</span>
                </div>
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