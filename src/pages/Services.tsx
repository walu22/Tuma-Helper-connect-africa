import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  };
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch services with category and provider info
      let query = supabase
        .from('services')
        .select(`
          *,
          service_categories (name, icon),
          profiles (display_name)
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      const categoryParam = searchParams.get('category');
      if (categoryParam && categoryParam !== 'all') {
        query = query.eq('category_id', categoryParam);
      }

      const { data: servicesData, error } = await query;

      if (error) throw error;

      if (servicesData) {
        setServices(servicesData);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching services",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
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

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search services, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or browse all categories
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card 
                key={service.id} 
                className="service-card cursor-pointer hover-scale"
                onClick={() => navigate(`/services/${service.id}`)}
              >
                <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <div className="text-6xl text-primary/30">🛠️</div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {service.service_categories.name}
                    </Badge>
                    {service.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 fill-current text-yellow-400" />
                        <span>{service.rating.toFixed(1)}</span>
                        <span>({service.total_reviews})</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{service.location}</span>
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      {formatPrice(service.price_from, service.price_to, service.price_unit)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      by {service.profiles.display_name || 'Service Provider'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Services;