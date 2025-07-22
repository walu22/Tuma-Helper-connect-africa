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
    <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-24 h-24 bg-primary-foreground rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary-foreground rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-primary-foreground rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-3">
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-3 py-1 text-xs font-medium">
                <Star className="w-3 h-3 mr-1" />
                Join 5,000+ Happy Users
              </Badge>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-primary-foreground tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto font-medium">
              Join thousands of satisfied customers and trusted service providers
            </p>
            
            {/* Tab Selector */}
            <div className="flex justify-center mb-8">
              <div className="bg-primary-foreground/20 backdrop-blur-md rounded-xl p-1 shadow-xl border border-primary-foreground/20">
                <Button
                  variant={activeTab === 'customer' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('customer')}
                  className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'customer' 
                      ? 'bg-primary-foreground text-primary shadow-lg' 
                      : 'text-primary-foreground hover:bg-primary-foreground/20'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  I Need Services
                </Button>
                <Button
                  variant={activeTab === 'provider' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('provider')}
                  className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'provider' 
                      ? 'bg-primary-foreground text-primary shadow-lg' 
                      : 'text-primary-foreground hover:bg-primary-foreground/20'
                  }`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  I Provide Services
                </Button>
              </div>
            </div>
          </div>

          {/* Content Cards */}
          <div className="grid lg:grid-cols-2 gap-6 mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Benefits Card */}
            <Card className="group bg-primary-foreground/15 backdrop-blur-md border-primary-foreground/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] animate-fade-in-left">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                    {activeTab === 'customer' ? <CheckCircle className="w-4 h-4 text-primary-foreground" /> : <Users className="w-4 h-4 text-primary-foreground" />}
                  </div>
                  <h3 className="text-xl font-bold text-primary-foreground tracking-tight">
                    {activeTab === 'customer' ? 'Why Choose Us?' : 'Why Join as a Provider?'}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {(activeTab === 'customer' ? customerBenefits : providerBenefits).map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${index * 50}ms` }}>
                      <div className="w-8 h-8 bg-accent/30 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <benefit.icon className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-primary-foreground/90 text-sm font-medium">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="group bg-primary-foreground/15 backdrop-blur-md border-primary-foreground/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] animate-fade-in-right">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-foreground tracking-tight">
                    Join Our Community
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl font-bold text-primary-foreground mb-1 font-mono">1,000+</div>
                    <div className="text-primary-foreground/80 text-xs font-medium">Active Providers</div>
                  </div>
                  <div className="text-center group-hover:scale-105 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                    <div className="text-2xl font-bold text-primary-foreground mb-1 font-mono">5,000+</div>
                    <div className="text-primary-foreground/80 text-xs font-medium">Happy Customers</div>
                  </div>
                  <div className="text-center group-hover:scale-105 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                    <div className="text-2xl font-bold text-primary-foreground mb-1 font-mono">4.8</div>
                    <div className="text-primary-foreground/80 text-xs font-medium">Average Rating</div>
                  </div>
                  <div className="text-center group-hover:scale-105 transition-transform duration-300" style={{ transitionDelay: '150ms' }}>
                    <div className="text-2xl font-bold text-primary-foreground mb-1 font-mono">24/7</div>
                    <div className="text-primary-foreground/80 text-xs font-medium">Support Available</div>
                  </div>
                </div>
                
                <div className="p-3 bg-secondary/20 rounded-lg border border-primary-foreground/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-primary-foreground" />
                    <span className="text-primary-foreground font-semibold text-sm">100% Secure</span>
                  </div>
                  <p className="text-primary-foreground/80 text-xs leading-relaxed">
                    All payments are processed securely and your data is protected
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center animate-scale-in" style={{ animationDelay: '400ms' }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-3 text-lg font-bold rounded-xl shadow-xl hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {activeTab === 'customer' ? 'Find Services Now' : 'Start Earning Today'}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/how-it-works')}
                className="border-2 border-primary-foreground bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 px-8 py-3 text-lg font-bold rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                Learn How It Works
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: CheckCircle, text: "No Setup Fee" },
                { icon: Clock, text: "Instant Approval" },
                { icon: Shield, text: "24/7 Support" }
              ].map((badge, index) => (
                <Badge 
                  key={index}
                  className="bg-primary-foreground/25 text-primary-foreground border-primary-foreground/40 px-4 py-2 text-xs font-semibold rounded-full hover:bg-primary-foreground/35 transition-all duration-300 backdrop-blur-sm hover:scale-105"
                >
                  <badge.icon className="w-3 h-3 mr-1" />
                  {badge.text}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImprovedCallToAction;