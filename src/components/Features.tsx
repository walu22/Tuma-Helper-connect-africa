import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Shield, 
  Clock, 
  CreditCard, 
  Star, 
  Smartphone, 
  Users,
  CheckCircle,
  Zap
} from "lucide-react";

const Features = () => {
  const { t } = useLanguage();
  const features = [
    {
      icon: Shield,
      title: t('features.verified_providers'),
      description: t('features.verified_providers_desc'),
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Clock,
      title: t('features.real_time_booking'),
      description: t('features.real_time_booking_desc'),
      color: "from-green-500 to-green-600"
    },
    {
      icon: CreditCard,
      title: t('features.secure_payments'),
      description: t('features.secure_payments_desc'),
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Star,
      title: t('features.quality_assurance'),
      description: t('features.quality_assurance_desc'),
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Smartphone,
      title: t('features.easy_to_use'),
      description: t('features.easy_to_use_desc'),
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Users,
      title: t('features.community_driven'),
      description: t('features.community_driven_desc'),
      color: "from-teal-500 to-teal-600"
    }
  ];

  const stats = [
    { number: "10,000+", label: t('features.happy_customers') },
    { number: "500+", label: t('hero.providers').replace('500+ ', '') },
    { number: "50,000+", label: t('features.services_completed') },
    { number: "4.8/5", label: t('features.average_rating') }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t('features.why_choose')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features.why_choose_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="service-card group border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-16 text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              {t('features.trusted_by_thousands')}
            </h3>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              {t('features.trusted_desc')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;