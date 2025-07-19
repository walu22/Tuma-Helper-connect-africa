import { Shield, Eye, Lock, Database, UserCheck, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Privacy = () => {
  const navigate = useNavigate();

  const privacyPrinciples = [
    {
      icon: Shield,
      title: "Data Protection",
      description: "We use industry-standard security measures to protect your personal information."
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "We clearly explain what data we collect and how we use it."
    },
    {
      icon: UserCheck,
      title: "User Control",
      description: "You have control over your data and can request access, updates, or deletion."
    },
    {
      icon: Lock,
      title: "Secure Storage",
      description: "All data is encrypted and stored securely with limited access."
    }
  ];

  const dataTypes = [
    {
      category: "Account Information",
      items: ["Name, email address, phone number", "Profile picture and preferences", "Account settings and preferences"]
    },
    {
      category: "Service Data",
      items: ["Booking history and details", "Reviews and ratings", "Payment information (securely processed)"]
    },
    {
      category: "Usage Information",
      items: ["Platform usage patterns", "Search queries and preferences", "Device and browser information"]
    },
    {
      category: "Location Data",
      items: ["Service area preferences", "General location for service matching", "Delivery addresses when provided"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Your privacy matters to us. Learn how we protect your data.
            </p>
            <p className="text-sm text-primary-foreground/80">
              Last updated: January 19, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Privacy Principles</h2>
            <p className="text-xl text-muted-foreground">
              Built on trust, transparency, and respect for your privacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {privacyPrinciples.map((principle, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mb-4">
                    <principle.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{principle.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {principle.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Collection */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Data We Collect</h2>
              <p className="text-xl text-muted-foreground">
                We only collect data that helps us provide better services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dataTypes.map((dataType, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-6 h-6 text-primary" />
                      {dataType.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {dataType.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How We Use Data */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">How We Use Your Data</CardTitle>
                <CardDescription className="text-center text-lg">
                  Your data helps us provide and improve our services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Service Delivery</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Connect you with service providers</li>
                      <li>• Process bookings and payments</li>
                      <li>• Provide customer support</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Platform Improvement</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Enhance user experience</li>
                      <li>• Develop new features</li>
                      <li>• Ensure platform security</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Communication</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Send booking confirmations</li>
                      <li>• Provide service updates</li>
                      <li>• Share important announcements</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Safety & Security</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Verify user identities</li>
                      <li>• Prevent fraud and abuse</li>
                      <li>• Maintain platform integrity</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Your Privacy Rights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Access Your Data</h3>
                  <p className="text-muted-foreground">Request a copy of all data we have about you</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Update Information</h3>
                  <p className="text-muted-foreground">Correct or update your personal information</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Delete Your Data</h3>
                  <p className="text-muted-foreground">Request deletion of your personal data</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Privacy?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Contact us if you have any questions about how we handle your data
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-hero"
                onClick={() => navigate('/contact')}
              >
                Contact Privacy Team
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/terms')}
              >
                View Terms of Service
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;