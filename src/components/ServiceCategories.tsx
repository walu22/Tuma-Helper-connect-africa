import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Home, 
  Wrench, 
  Zap, 
  Scissors, 
  Car, 
  Sparkles,
  ArrowRight,
  Users,
  Clock,
  Shield,
  Flower,
  Heart,
  Camera,
  BookOpen,
  Laptop,
  Truck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  serviceCount?: number;
}

  const iconMap: { [key: string]: React.ComponentType } = {
  home: Home,
  car: Car,
  scissors: Scissors,
  sparkles: Sparkles,
  laptop: Laptop,
  truck: Truck,
  wrench: Wrench,
  flower: Flower,
  heart: Heart,
  camera: Camera,
  'book-open': BookOpen,
  zap: Zap,
};

const colorMap: { [key: string]: string } = {
  'Home Services': 'from-blue-500 to-blue-600',
  'Beauty & Wellness': 'from-pink-500 to-pink-600',
  'Automotive': 'from-purple-500 to-purple-600',
  'Delivery & Moving': 'from-orange-500 to-orange-600',
  'Tech Support': 'from-cyan-500 to-cyan-600',
  'Gardening': 'from-green-500 to-green-600',
  'Tutoring': 'from-indigo-500 to-indigo-600',
  'Events': 'from-red-500 to-red-600',
  'Pet Services': 'from-yellow-500 to-yellow-600',
  'Handyman': 'from-gray-500 to-gray-600',
};

const ServiceCategories = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Add retry logic for network issues
      let retries = 3;
      let categoriesData, error;
      
      while (retries > 0) {
        try {
          const result = await supabase
            .from('service_categories')
            .select(`
              id,
              name,
              description,
              icon,
              services (count)
            `)
            .order('name');
          
          categoriesData = result.data;
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
      
      if (categoriesData) {
        // Map the data and add service counts
        const mappedCategories = categoriesData.map(category => ({
          ...category,
          serviceCount: category.services?.length || 0
        }));
        setCategories(mappedCategories.slice(0, 6)); // Show first 6 categories
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Provide fallback categories if fetch fails
      setCategories([
        { id: '1', name: 'Home Services', description: 'Professional home services', icon: 'home', serviceCount: 0 },
        { id: '2', name: 'Beauty & Wellness', description: 'Beauty and wellness services', icon: 'scissors', serviceCount: 0 },
        { id: '3', name: 'Automotive', description: 'Car and vehicle services', icon: 'car', serviceCount: 0 },
        { id: '4', name: 'Tech Support', description: 'Technology and IT services', icon: 'laptop', serviceCount: 0 },
        { id: '5', name: 'Delivery & Moving', description: 'Delivery and moving services', icon: 'truck', serviceCount: 0 },
        { id: '6', name: 'Gardening', description: 'Garden and landscaping services', icon: 'flower', serviceCount: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {t('services.browse')}
            </h2>
            <div className="h-6 bg-muted animate-pulse rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-muted rounded-2xl mb-4"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-24 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
            Browse Services
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover trusted professionals across various service categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon] || Home;
            const colorClass = colorMap[category.name] || 'from-gray-500 to-gray-600';
            return (
              <Card 
                key={category.id} 
                className="service-category-card animate-fade-in group overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/services?category=${category.id}`)}
              >
                <CardHeader className="pb-4 md:pb-6 relative">
                  {/* Gradient Background Glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${colorClass} opacity-5 rounded-full blur-3xl transform translate-x-8 -translate-y-8 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-r ${colorClass} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-medium relative z-10`}>
                    <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  
                  <CardTitle className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 md:space-y-5">
                  <div className="flex items-center justify-between text-sm md:text-base">
                    <div className="flex items-center space-x-2 text-muted-foreground bg-muted/30 rounded-full px-3 py-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{category.serviceCount || 0} services</span>
                    </div>
                    <div className="flex items-center space-x-2 text-success bg-success-light rounded-full px-3 py-1">
                      <Shield className="w-4 h-4" />
                      <span>{t('services.verified')}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs md:text-sm text-muted-foreground min-h-[40px] md:min-h-[60px] flex items-center line-clamp-3">
                    Professional {category.name.toLowerCase()} services available in Windhoek. 
                    All providers are background-checked and rated by our community.
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors text-xs md:text-sm h-8 md:h-9"
                  >
                    {t('services.view')}
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="btn-hero"
            onClick={() => navigate("/services")}
          >
            {t('services.view_all')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;