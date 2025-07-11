import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Phone, Mail, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ServiceDetail {
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
  created_at: string;
  service_categories: {
    name: string;
    icon: string;
  };
  profiles: {
    display_name: string | null;
    phone: string | null;
    user_id: string;
  };
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_categories (name, icon),
          profiles (display_name, phone, user_id)
        `)
        .eq('id', id)
        .eq('is_available', true)
        .single();

      if (error) throw error;
      
      setService(data);
    } catch (error: any) {
      toast({
        title: "Service not found",
        description: "This service may have been removed or is no longer available.",
        variant: "destructive",
      });
      navigate('/services');
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

  const handleBookService = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book this service.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    // TODO: Navigate to booking flow
    toast({
      title: "Booking feature coming soon!",
      description: "The booking system is currently under development.",
    });
  };

  const handleContactProvider = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact the service provider.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // TODO: Open contact modal or chat
    toast({
      title: "Contact feature coming soon!",
      description: "Direct messaging with providers is under development.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
          <Button onClick={() => navigate('/services')}>
            Browse All Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Service Image/Hero */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mb-8">
          <div className="text-8xl opacity-30">🛠️</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <Badge variant="secondary">{service.service_categories.name}</Badge>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{service.location}</span>
                  </div>
                  {service.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-400" />
                      <span>{service.rating.toFixed(1)}</span>
                      <span>({service.total_reviews} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">About this service</h2>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Features - placeholder for now */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">What's included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Professional service</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Quality guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Flexible scheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Local provider</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  {formatPrice(service.price_from, service.price_to, service.price_unit)}
                </CardTitle>
                <CardDescription>
                  Service by {service.profiles.display_name || 'Service Provider'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full btn-hero"
                  onClick={handleBookService}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book This Service
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleContactProvider}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Provider
                </Button>

                <Separator />

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Instant booking available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Service guarantee</span>
                  </div>
                </div>

                <Separator />

                <div className="text-center text-sm text-muted-foreground">
                  <p>Need help? Contact our support team</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetail;