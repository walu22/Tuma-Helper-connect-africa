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
    <section className="py-24 relative overflow-hidden">
      {/* Enhanced Background with Multiple Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-accent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/5 to-transparent"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-foreground rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary-foreground rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-primary-foreground rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-primary-foreground rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-4 py-2 text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                Join 5,000+ Happy Users
              </Badge>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-primary-foreground">
              Ready to Get
              <span className="block bg-gradient-to-r from-primary-foreground via-accent-foreground to-primary-foreground bg-clip-text text-transparent">
                Started?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied customers and trusted service providers in our growing community
            </p>
            
            {/* Enhanced Tab Selector */}
            <div className="flex justify-center mb-12">
              <div className="bg-primary-foreground/20 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-primary-foreground/20">
                <Button
                  variant={activeTab === 'customer' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('customer')}
                  className={`px-8 py-4 rounded-xl transition-all duration-500 transform ${
                    activeTab === 'customer' 
                      ? 'bg-primary-foreground text-primary shadow-xl scale-105' 
                      : 'text-primary-foreground hover:bg-primary-foreground/20 hover:scale-102'
                  }`}
                >
                  <Users className="w-5 h-5 mr-2" />
                  I Need Services
                </Button>
                <Button
                  variant={activeTab === 'provider' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('provider')}
                  className={`px-8 py-4 rounded-xl transition-all duration-500 transform ${
                    activeTab === 'provider' 
                      ? 'bg-primary-foreground text-primary shadow-xl scale-105' 
                      : 'text-primary-foreground hover:bg-primary-foreground/20 hover:scale-102'
                  }`}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  I Provide Services
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Content Cards with Floating Effect */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Benefits Card */}
            <Card className="group bg-primary-foreground/15 backdrop-blur-md border-primary-foreground/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary-glow rounded-xl flex items-center justify-center">
                    {activeTab === 'customer' ? <CheckCircle className="w-6 h-6 text-primary-foreground" /> : <Users className="w-6 h-6 text-primary-foreground" />}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                    {activeTab === 'customer' ? 'Why Choose Us?' : 'Why Join as a Provider?'}
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {(activeTab === 'customer' ? customerBenefits : providerBenefits).map((benefit, index) => (
                    <div key={index} className="flex items-center gap-4 group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: `${index * 100}ms` }}>
                      <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl flex items-center justify-center shrink-0">
                        <benefit.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <span className="text-primary-foreground/90 text-lg font-medium">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="group bg-primary-foreground/15 backdrop-blur-md border-primary-foreground/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary-glow rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                    Join Our Community
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="text-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-3 bg-gradient-to-r from-primary-foreground to-accent-foreground bg-clip-text text-transparent">1,000+</div>
                    <div className="text-primary-foreground/80 text-sm font-medium">Active Providers</div>
                  </div>
                  <div className="text-center group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                    <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-3 bg-gradient-to-r from-primary-foreground to-accent-foreground bg-clip-text text-transparent">5,000+</div>
                    <div className="text-primary-foreground/80 text-sm font-medium">Happy Customers</div>
                  </div>
                  <div className="text-center group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: '200ms' }}>
                    <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-3 bg-gradient-to-r from-primary-foreground to-accent-foreground bg-clip-text text-transparent">4.8</div>
                    <div className="text-primary-foreground/80 text-sm font-medium">Average Rating</div>
                  </div>
                  <div className="text-center group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: '300ms' }}>
                    <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-3 bg-gradient-to-r from-primary-foreground to-accent-foreground bg-clip-text text-transparent">24/7</div>
                    <div className="text-primary-foreground/80 text-sm font-medium">Support Available</div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl border border-primary-foreground/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-primary-foreground" />
                    <span className="text-primary-foreground font-bold text-lg">100% Secure & Trusted</span>
                  </div>
                  <p className="text-primary-foreground/80 leading-relaxed">
                    All payments are processed securely and your data is protected with enterprise-grade security
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced CTA Section */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-1"
              >
                {activeTab === 'customer' ? 'Find Services Now' : 'Start Earning Today'}
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/how-it-works')}
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/20 px-12 py-6 text-xl font-bold rounded-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105"
              >
                Learn How It Works
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: CheckCircle, text: "No Setup Fee" },
                { icon: Clock, text: "Instant Approval" },
                { icon: Shield, text: "24/7 Support" },
                { icon: Star, text: "Money Back Guarantee" }
              ].map((badge, index) => (
                <Badge 
                  key={index}
                  className="bg-primary-foreground/25 text-primary-foreground border-primary-foreground/40 px-6 py-3 text-sm font-semibold rounded-full hover:bg-primary-foreground/35 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <badge.icon className="w-4 h-4 mr-2" />
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