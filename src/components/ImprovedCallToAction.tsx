import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, Star, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

const ImprovedCallToAction = () => {
  const [activeTab, setActiveTab] = useState<'customer' | 'provider'>('customer');
  const navigate = useNavigate();
  const { user } = useAuth();

  const customerBenefits = [
    { icon: CheckCircle, text: "Access to verified service providers" },
    { icon: Shield, text: "Secure payment and booking system" },
    { icon: Star, text: "Read reviews from real customers" },
    { icon: Clock, text: "Fast response and scheduling" },
  ];

  const providerBenefits = [
    { icon: Users, text: "Connect with local customers" },
    { icon: CheckCircle, text: "Grow your business online" },
    { icon: Shield, text: "Secure payment processing" },
    { icon: Star, text: "Build your reputation with reviews" },
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate(activeTab === 'customer' ? '/services' : '/become-provider');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary-glow to-accent text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-foreground rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-foreground rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-foreground rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Join thousands of satisfied customers and trusted service providers
            </p>
            
            {/* Tab Selector */}
            <div className="flex justify-center mb-8">
              <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-full p-1">
                <Button
                  variant={activeTab === 'customer' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('customer')}
                  className={`px-8 py-3 rounded-full transition-all duration-300 ${
                    activeTab === 'customer' 
                      ? 'bg-primary-foreground text-primary shadow-lg' 
                      : 'text-primary-foreground hover:bg-primary-foreground/20'
                  }`}
                >
                  I Need Services
                </Button>
                <Button
                  variant={activeTab === 'provider' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('provider')}
                  className={`px-8 py-3 rounded-full transition-all duration-300 ${
                    activeTab === 'provider' 
                      ? 'bg-primary-foreground text-primary shadow-lg' 
                      : 'text-primary-foreground hover:bg-primary-foreground/20'
                  }`}
                >
                  I Provide Services
                </Button>
              </div>
            </div>
          </div>

          {/* Content Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Benefits */}
            <Card className="bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-foreground">
                  {activeTab === 'customer' ? 'Why Choose LocalServe?' : 'Why Join as a Provider?'}
                </h3>
                <div className="space-y-4">
                  {(activeTab === 'customer' ? customerBenefits : providerBenefits).map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <benefit.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-foreground">
                  Join Our Community
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">1,000+</div>
                    <div className="text-muted-foreground text-sm">Active Providers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">5,000+</div>
                    <div className="text-muted-foreground text-sm">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">4.8</div>
                    <div className="text-muted-foreground text-sm">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">24/7</div>
                    <div className="text-muted-foreground text-sm">Support Available</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium">100% Secure</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    All payments are processed securely and your data is protected
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {activeTab === 'customer' ? 'Find Services Now' : 'Start Earning Today'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/how-it-works')}
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm"
              >
                Learn How It Works
              </Button>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                No Setup Fee
              </Badge>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Instant Approval
              </Badge>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                24/7 Support
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImprovedCallToAction;