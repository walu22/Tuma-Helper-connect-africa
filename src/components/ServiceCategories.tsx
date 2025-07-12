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

const iconMap: { [key: string]: any } = {
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
      // Fetch categories with service counts
      const { data: categoriesData, error } = await supabase
        .from('service_categories')
        .select(`
          id,
          name,
          description,
          icon,
          services (count)
        `)
        .order('name');

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
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t('services.browse')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('services.browse_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon] || Home;
            const colorClass = colorMap[category.name] || 'from-gray-500 to-gray-600';
            return (
              <Card 
                key={category.id} 
                className="service-card group cursor-pointer hover:scale-105 transition-all duration-300 touch-manipulation"
                onClick={() => navigate(`/services?category=${category.id}`)}
              >
                <CardHeader className="pb-3 md:pb-4">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-r ${colorClass} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg md:text-xl font-bold text-foreground">
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base text-muted-foreground line-clamp-2">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Users className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{category.serviceCount || 0} {t('services.text')}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Shield className="w-3 h-3 md:w-4 md:h-4" />
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