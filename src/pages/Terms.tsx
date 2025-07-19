import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using Tuma Helper, you accept and agree to be bound by the terms and provision of this agreement."
    },
    {
      title: "2. Platform Services",
      content: "Tuma Helper provides a platform that connects service providers with customers. We do not directly provide services but facilitate connections between parties."
    },
    {
      title: "3. User Accounts",
      content: "Users must provide accurate information when creating accounts. You are responsible for maintaining the confidentiality of your account credentials."
    },
    {
      title: "4. Service Provider Requirements",
      content: "Service providers must be properly licensed, insured, and qualified to provide their advertised services. All providers undergo verification."
    },
    {
      title: "5. Payment Terms",
      content: "Payments are processed securely through our platform. Service fees and payment schedules are clearly disclosed before booking."
    },
    {
      title: "6. Cancellation Policy",
      content: "Bookings can be cancelled according to the specified timeframes. Cancellation fees may apply depending on the timing and service type."
    },
    {
      title: "7. Liability and Disputes",
      content: "Tuma Helper acts as an intermediary. While we facilitate connections, service providers are independent contractors responsible for their work."
    },
    {
      title: "8. Privacy and Data",
      content: "We collect and process personal data in accordance with our Privacy Policy. User privacy and data protection are paramount."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Please read these terms carefully before using our platform
            </p>
            <p className="text-sm text-primary-foreground/80">
              Last updated: January 19, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Agreement Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">
                  These Terms of Service ("Terms") govern your use of Tuma Helper's platform and services. 
                  By using our platform, you agree to these terms. If you don't agree to these terms, 
                  please don't use our services.
                </p>
              </CardContent>
            </Card>

            {/* Terms Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Important Notice */}
            <Card className="mt-8 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-6 h-6" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-yellow-800">
                <p className="leading-relaxed">
                  These terms may be updated from time to time. We will notify users of significant changes. 
                  Continued use of the platform after changes constitutes acceptance of the new terms. 
                  For questions about these terms, please contact our support team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Our Terms?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              We're here to help clarify anything you need to know
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-hero"
                onClick={() => navigate('/contact')}
              >
                Contact Support
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/privacy')}
              >
                View Privacy Policy
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;