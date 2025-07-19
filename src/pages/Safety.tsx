import { Shield, CheckCircle, Eye, Phone, AlertTriangle, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Safety = () => {
  const navigate = useNavigate();

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Provider Verification",
      description: "All service providers undergo background checks and identity verification before joining our platform."
    },
    {
      icon: Eye,
      title: "Review System",
      description: "Transparent reviews and ratings help you make informed decisions about service providers."
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "Your payments are protected with bank-level security and held until service completion."
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Our support team is available around the clock to help with any safety concerns or issues."
    }
  ];

  const safetyTips = [
    "Always check provider reviews and ratings before booking",
    "Communicate through our platform for your protection",
    "Be present during service delivery when possible",
    "Report any suspicious behavior immediately",
    "Keep personal information private",
    "Use our secure payment system only"
  ];

  const emergencyContacts = [
    { service: "Police", number: "10111" },
    { service: "Emergency Medical", number: "2032276" },
    { service: "Tuma Helper Support", number: "+264 61 123 4567" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Safety First
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              We're committed to creating a safe and secure environment for all our users
            </p>
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How We Keep You Safe</h2>
            <p className="text-xl text-muted-foreground">
              Multiple layers of protection for your peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Safety Tips</h2>
              <p className="text-xl text-muted-foreground">
                Best practices to ensure a safe service experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safetyTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-lg">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Emergency Contacts</h2>
              <p className="text-xl text-muted-foreground">
                Important numbers to keep handy
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {emergencyContacts.map((contact, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <CardTitle className="text-xl">{contact.service}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {contact.number}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Report Issues */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="w-12 h-12 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Report Safety Concerns</h2>
            <p className="text-xl text-muted-foreground mb-8">
              If you encounter any safety issues or suspicious behavior, please report it immediately
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-hero"
                onClick={() => navigate('/contact')}
              >
                Report an Issue
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/help')}
              >
                Get Help
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Safety;