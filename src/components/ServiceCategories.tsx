import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ServiceCategories = () => {
  const navigate = useNavigate();
  
  const categories = [
    {
      icon: Home,
      title: "House Cleaning",
      description: "Professional home cleaning services",
      providers: "120+ providers",
      avgTime: "2-3 hours",
      services: ["Deep cleaning", "Regular maintenance", "Move-in/out cleaning"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Wrench,
      title: "Plumbing",
      description: "Emergency and scheduled plumbing services",
      providers: "85+ providers",
      avgTime: "1-2 hours",
      services: ["Leak repairs", "Installation", "Emergency callouts"],
      color: "from-red-500 to-red-600"
    },
    {
      icon: Zap,
      title: "Electrical",
      description: "Certified electricians for all your needs",
      providers: "95+ providers",
      avgTime: "1-3 hours",
      services: ["Wiring", "Appliance installation", "Fault finding"],
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Sparkles,
      title: "Gardening",
      description: "Garden maintenance and landscaping",
      providers: "70+ providers",
      avgTime: "2-4 hours",
      services: ["Lawn mowing", "Pruning", "Garden design"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: Scissors,
      title: "Beauty & Wellness",
      description: "Personal care services at your location",
      providers: "60+ providers",
      avgTime: "1-2 hours",
      services: ["Hair styling", "Massage", "Nails"],
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Car,
      title: "Car Services",
      description: "Vehicle maintenance and detailing",
      providers: "45+ providers",
      avgTime: "1-4 hours",
      services: ["Car wash", "Detailing", "Minor repairs"],
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Browse Our Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover trusted professionals for every service you need. All providers are verified and rated by our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={index} 
                className="service-card group cursor-pointer hover:scale-105 transition-all duration-300"
                onClick={() => navigate(`/services/${category.title.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{category.providers}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{category.avgTime}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {category.services.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
                  >
                    View Services
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
            View All Services
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;