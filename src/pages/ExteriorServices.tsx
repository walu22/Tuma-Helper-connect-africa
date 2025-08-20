import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, 
  Star, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Calendar,
  Search,
  Filter,
  X,
  Hammer,
  Building,
  TreePine,
  Fence,
  Wrench
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileOptimizedBooking from "@/components/MobileOptimizedBooking";
import RealTimeChatSystem from "@/components/RealTimeChatSystem";

interface ExteriorService {
  id: string;
  title: string;
  description: string;
  price_from: number;
  price_to?: number;
  price_unit: string;
  location: string;
  rating: number;
  total_reviews: number;
  provider_id: string;
  is_available: boolean;
  profiles?: {
    business_name?: string;
    bio?: string;
    years_of_experience?: number;
  } | null;
  service_categories?: {
    name: string;
    icon?: string;
  };
}

const exteriorCategories = [
  { name: "All Exterior", value: "all", icon: Home },
  { name: "Roofing", value: "roofing", icon: Home },
  { name: "Concrete & Masonry", value: "concrete", icon: Building },
  { name: "Fencing", value: "fencing", icon: Fence },
  { name: "Landscaping", value: "landscaping", icon: TreePine },
  { name: "Exterior Painting", value: "exterior_painting", icon: Hammer },
  { name: "Deck & Patio", value: "deck_patio", icon: Wrench }
];

const ExteriorServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<ExteriorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedService, setSelectedService] = useState<ExteriorService | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatProvider, setChatProvider] = useState<string | null>(null);

  useEffect(() => {
    fetchExteriorServices();
  }, []);

  const fetchExteriorServices = async () => {
    try {
      setLoading(true);
      
      const { data: servicesData, error } = await supabase
        .from('services')
        .select(`
          *,
          service_categories(name, icon),
          provider_profiles!services_provider_id_fkey(business_name, bio, years_of_experience)
        `)
        .eq('is_available', true);

      if (error) throw error;

      // For now, show all services as exterior services with sample data
      const mockServices = [
        {
          id: '1',
          title: 'Complete Roof Replacement',
          description: 'Full roof replacement with premium materials and 10-year warranty',
          price_from: 25000,
          price_to: 85000,
          price_unit: 'per project',
          location: 'Windhoek',
          rating: 4.9,
          total_reviews: 45,
          provider_id: 'mock-1',
          is_available: true,
          service_categories: { name: 'Roofing', icon: 'home' },
          profiles: { business_name: 'Elite Roofing Solutions', bio: 'Professional roofing contractors with 15+ years experience', years_of_experience: 15 }
        },
        {
          id: '2',
          title: 'Roof Repair & Maintenance',
          description: 'Professional roof repairs, leak fixes, and regular maintenance',
          price_from: 800,
          price_to: 5000,
          price_unit: 'per service',
          location: 'Windhoek',
          rating: 4.8,
          total_reviews: 67,
          provider_id: 'mock-1',
          is_available: true,
          service_categories: { name: 'Roofing', icon: 'home' },
          profiles: { business_name: 'Elite Roofing Solutions', bio: 'Professional roofing contractors with 15+ years experience', years_of_experience: 15 }
        },
        {
          id: '3',
          title: 'Driveway Construction',
          description: 'Professional concrete driveway installation with decorative options',
          price_from: 8000,
          price_to: 25000,
          price_unit: 'per project',
          location: 'Windhoek',
          rating: 4.7,
          total_reviews: 34,
          provider_id: 'mock-2',
          is_available: true,
          service_categories: { name: 'Concrete & Masonry', icon: 'building' },
          profiles: { business_name: 'Concrete Masters Namibia', bio: 'Specialized concrete and masonry work', years_of_experience: 12 }
        },
        {
          id: '4',
          title: 'Security Fence Installation',
          description: 'High-quality security fencing for residential and commercial properties',
          price_from: 350,
          price_to: 800,
          price_unit: 'per meter',
          location: 'Windhoek',
          rating: 4.8,
          total_reviews: 89,
          provider_id: 'mock-3',
          is_available: true,
          service_categories: { name: 'Fencing', icon: 'fence' },
          profiles: { business_name: 'Secure Fence Co.', bio: 'Quality fencing solutions', years_of_experience: 8 }
        },
        {
          id: '5',
          title: 'Complete Garden Makeover',
          description: 'Full landscape design and installation with drought-resistant plants',
          price_from: 12000,
          price_to: 45000,
          price_unit: 'per project',
          location: 'Windhoek',
          rating: 4.6,
          total_reviews: 41,
          provider_id: 'mock-4',
          is_available: true,
          service_categories: { name: 'Landscaping', icon: 'tree-pine' },
          profiles: { business_name: 'Desert Landscape Designs', bio: 'Creating beautiful outdoor spaces', years_of_experience: 10 }
        },
        {
          id: '6',
          title: 'House Exterior Painting',
          description: 'Complete exterior house painting with premium weather-resistant paint',
          price_from: 8000,
          price_to: 35000,
          price_unit: 'per project',
          location: 'Windhoek',
          rating: 4.5,
          total_reviews: 53,
          provider_id: 'mock-5',
          is_available: true,
          service_categories: { name: 'Exterior Painting', icon: 'hammer' },
          profiles: { business_name: 'Pro Paint Exteriors', bio: 'Professional exterior painting services', years_of_experience: 7 }
        },
        {
          id: '7',
          title: 'Custom Deck Construction',
          description: 'Custom wooden and composite deck construction and installation',
          price_from: 18000,
          price_to: 65000,
          price_unit: 'per project',
          location: 'Windhoek',
          rating: 4.8,
          total_reviews: 47,
          provider_id: 'mock-6',
          is_available: true,
          service_categories: { name: 'Deck & Patio', icon: 'wrench' },
          profiles: { business_name: 'Outdoor Living Specialists', bio: 'Custom decks and outdoor living spaces', years_of_experience: 9 }
        },
        {
          id: '8',
          title: 'Foundation Work',
          description: 'House foundations, slabs, and structural concrete work',
          price_from: 15000,
          price_to: 50000,
          price_unit: 'per project',
          location: 'Windhoek',
          rating: 4.6,
          total_reviews: 28,
          provider_id: 'mock-2',
          is_available: true,
          service_categories: { name: 'Concrete & Masonry', icon: 'building' },
          profiles: { business_name: 'Concrete Masters Namibia', bio: 'Specialized concrete and masonry work', years_of_experience: 12 }
        }
      ];

      setServices(mockServices);
    } catch (error) {
      console.error('Error fetching exterior services:', error);
      toast.error('Failed to load exterior services');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.location.toLowerCase().includes(query) ||
        (service.service_categories?.name?.toLowerCase() || '').includes(query);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== "all") {
      const categoryName = service.service_categories?.name?.toLowerCase() || '';
      const serviceTitle = service.title.toLowerCase();
      
      switch (selectedCategory) {
        case 'roofing':
          if (!categoryName.includes('roofing') && !serviceTitle.includes('roof')) return false;
          break;
        case 'concrete':
          if (!categoryName.includes('concrete') && !categoryName.includes('masonry') && 
              !serviceTitle.includes('concrete') && !serviceTitle.includes('masonry')) return false;
          break;
        case 'fencing':
          if (!categoryName.includes('fence') && !serviceTitle.includes('fence')) return false;
          break;
        case 'landscaping':
          if (!categoryName.includes('landscaping') && !serviceTitle.includes('landscape') && 
              !serviceTitle.includes('garden')) return false;
          break;
        case 'exterior_painting':
          if (!serviceTitle.includes('exterior') && !serviceTitle.includes('paint')) return false;
          break;
        case 'deck_patio':
          if (!serviceTitle.includes('deck') && !serviceTitle.includes('patio')) return false;
          break;
      }
    }

    // Price range filter
    if (service.price_from < priceRange[0] || service.price_from > priceRange[1]) return false;

    return true;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price_low':
        return a.price_from - b.price_from;
      case 'price_high':
        return b.price_from - a.price_from;
      case 'reviews':
        return b.total_reviews - a.total_reviews;
      default:
        return 0;
    }
  });

  const formatPrice = (priceFrom: number, priceTo?: number, unit?: string) => {
    const formattedUnit = unit || 'per service';
    if (priceTo && priceTo !== priceFrom) {
      return `N$${priceFrom} - N$${priceTo} ${formattedUnit}`;
    }
    return `N$${priceFrom} ${formattedUnit}`;
  };

  const handleBookService = (service: ExteriorService) => {
    if (!user) {
      toast.error("Please sign in to book a service");
      return;
    }
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleContactProvider = (providerId: string) => {
    if (!user) {
      toast.error("Please sign in to contact providers");
      return;
    }
    setChatProvider(providerId);
    setShowChatModal(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 5000]);
    setSortBy("rating");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || priceRange[0] !== 0 || priceRange[1] !== 5000;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="h-64">
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
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Exterior Home Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Transform your home's exterior with professional roofing, landscaping, concrete work, and more
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{services.length}+</div>
                <div className="text-muted-foreground">Exterior Services</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">50+</div>
                <div className="text-muted-foreground">Professional Contractors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">4.8★</div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exterior services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {exteriorCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="flex items-center gap-2 text-sm"
                >
                  <IconComponent className="h-3 w-3" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Price Range (N$)</Label>
                    <div className="mt-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={5000}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>N${priceRange[0]}</span>
                        <span>N${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                        <SelectItem value="reviews">Most Reviews</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Found {sortedServices.length} exterior service{sortedServices.length !== 1 ? 's' : ''}
            {selectedCategory !== "all" && ` in ${exteriorCategories.find(cat => cat.value === selectedCategory)?.name}`}
          </p>
        </div>

        {/* Services Grid */}
        {sortedServices.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No exterior services found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms to find more services.
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>Clear All Filters</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedServices.map((service) => (
              <Card key={service.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {service.service_categories?.name || 'Exterior Service'}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{service.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({service.total_reviews})</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{service.location}</span>
                    </div>
                    
                    {service.profiles?.business_name && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {service.profiles.business_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <div className="font-medium">{service.profiles.business_name}</div>
                          {service.profiles.years_of_experience && (
                            <div className="text-xs text-muted-foreground">
                              {service.profiles.years_of_experience} years experience
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(service.price_from, service.price_to, service.price_unit)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleContactProvider(service.provider_id)}
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      <Button 
                        onClick={() => handleBookService(service)}
                        size="sm" 
                        className="flex-1"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Book
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Modals */}
      {showBookingModal && selectedService && (
        <MobileOptimizedBooking
          service={{
            ...selectedService,
            price_to: selectedService.price_to || null,
            profiles: {
              display_name: selectedService.profiles?.business_name || null,
              user_id: selectedService.provider_id,
              avatar_url: null
            }
          }}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showChatModal && chatProvider && (
        <RealTimeChatSystem
          receiverId={chatProvider}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
};

export default ExteriorServices;