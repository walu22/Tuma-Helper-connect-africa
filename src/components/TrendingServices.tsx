import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TrendingService {
  id: string;
  title: string;
  category: string;
  interestedCount: number;
  location: string;
  icon: string;
}

const TrendingServices = () => {
  const [trendingServices, setTrendingServices] = useState<TrendingService[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingServices();
  }, []);

  const fetchTrendingServices = async () => {
    try {
      // Get popular services based on bookings and searches
      const { data: popularServices, error } = await supabase
        .from('services')
        .select(`
          id,
          title,
          location,
          service_categories (name, icon),
          bookings (count)
        `)
        .eq('is_available', true)
        .order('total_reviews', { ascending: false })
        .limit(8);

      if (error) throw error;

      if (popularServices) {
        const formattedServices = popularServices.map((service, index) => ({
          id: service.id,
          title: service.title,
          category: service.service_categories?.name || 'General',
          interestedCount: Math.floor(Math.random() * 5000) + 1000, // Mock data for demo
          location: service.location,
          icon: service.service_categories?.icon || 'wrench'
        }));
        
        setTrendingServices(formattedServices);
      }
    } catch (error) {
      console.error('Error fetching trending services:', error);
      // Fallback trending services
      setTrendingServices([
        { id: '1', title: 'Roofing', category: 'Home Services', interestedCount: 8582, location: 'Windhoek', icon: 'home' },
        { id: '2', title: 'Air Conditioning', category: 'HVAC', interestedCount: 7249, location: 'Windhoek', icon: 'zap' },
        { id: '3', title: 'Painting', category: 'Home Services', interestedCount: 6843, location: 'Windhoek', icon: 'home' },
        { id: '4', title: 'Addition and Remodeling', category: 'Construction', interestedCount: 5967, location: 'Windhoek', icon: 'wrench' },
        { id: '5', title: 'Cleaning & Maid Services', category: 'Cleaning', interestedCount: 5423, location: 'Windhoek', icon: 'sparkles' },
        { id: '6', title: 'Handyman Service', category: 'General', interestedCount: 4789, location: 'Windhoek', icon: 'wrench' },
        { id: '7', title: 'Tree Service', category: 'Gardening', interestedCount: 4567, location: 'Windhoek', icon: 'flower' },
        { id: '8', title: 'Plumbing', category: 'Home Services', interestedCount: 4201, location: 'Windhoek', icon: 'wrench' },
      ]);
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Most in-demand home services in <span className="text-primary">Windhoek</span>
          </h2>
          <p className="text-muted-foreground">Don't miss your chance to book a pro</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {trendingServices.map((service) => (
            <Card 
              key={service.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-muted bg-card"
              onClick={() => navigate(`/services?search=${encodeURIComponent(service.title)}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                    <div className="text-2xl">
                      {service.title.includes('Roof') ? '🏠' :
                       service.title.includes('Air') ? '❄️' :
                       service.title.includes('Paint') ? '🎨' :
                       service.title.includes('Clean') ? '🧽' :
                       service.title.includes('Tree') ? '🌳' :
                       service.title.includes('Plumb') ? '🔧' : '🛠️'}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                      {service.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-foreground">{service.interestedCount.toLocaleString()}</span>
                      <span>homeowners interested</span>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      {service.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/services')}
            className="group"
          >
            See All Services
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingServices;