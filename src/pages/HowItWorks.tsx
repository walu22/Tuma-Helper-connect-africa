import { CheckCircle, Search, Calendar, CreditCard, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Search,
      title: "Find a Service",
      description: "Browse services or search for what you need. Filter by location, price, and ratings to find the perfect match."
    },
    {
      icon: Calendar,
      title: "Book & Schedule",
      description: "Select your preferred time and date. Provide details about your requirements and confirm your booking."
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "Pay securely through our platform. Your payment is protected until the service is completed to your satisfaction."
    },
    {
      icon: Star,
      title: "Rate & Review",
      description: "After service completion, rate your experience and help other customers make informed decisions."
    }
  ];

  const benefits = [
    "Verified service providers",
    "Secure payment protection",
    "24/7 customer support",
    "Quality guarantee",
    "Easy rescheduling",
    "Transparent pricing"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-glow text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            How Tuma Helper Works
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Get any service done in 4 simple steps
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple & Straightforward</h2>
            <p className="text-xl text-muted-foreground">
              From booking to completion, we've made it easy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-medium text-primary mb-2">
                    Step {index + 1}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Tuma Helper?</h2>
              <p className="text-xl text-muted-foreground">
                We're committed to providing the best service experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Find trusted service providers in Windhoek today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-hero"
              onClick={() => navigate('/services')}
            >
              Browse Services
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/become-provider')}
            >
              Become a Provider
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;