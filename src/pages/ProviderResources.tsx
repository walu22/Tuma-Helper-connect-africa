import { BookOpen, Download, Video, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProviderResources = () => {
  const navigate = useNavigate();

  const resourceCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Everything you need to know to begin your journey as a provider",
      resources: [
        "Platform Setup Guide",
        "Profile Optimization Tips",
        "First Week Checklist",
        "Documentation Requirements"
      ]
    },
    {
      icon: TrendingUp,
      title: "Growing Your Business",
      description: "Strategies and tools to expand your customer base and increase revenue",
      resources: [
        "Marketing Best Practices",
        "Pricing Strategy Guide",
        "Customer Retention Tips",
        "Service Expansion Planning"
      ]
    },
    {
      icon: Users,
      title: "Customer Service",
      description: "Deliver exceptional experiences that keep customers coming back",
      resources: [
        "Communication Guidelines",
        "Handling Difficult Situations",
        "Follow-up Best Practices",
        "Building Trust & Credibility"
      ]
    },
    {
      icon: Video,
      title: "Training Videos",
      description: "Visual guides and tutorials to help you master the platform",
      resources: [
        "Platform Navigation",
        "Booking Management",
        "Payment Processing",
        "Safety Protocols"
      ]
    }
  ];

  const downloadableResources = [
    {
      title: "Provider Handbook",
      description: "Complete guide to being a successful service provider",
      type: "PDF",
      size: "2.3 MB"
    },
    {
      title: "Safety Checklist",
      description: "Essential safety protocols for all service categories",
      type: "PDF",
      size: "1.1 MB"
    },
    {
      title: "Marketing Template Pack",
      description: "Ready-to-use templates for promoting your services",
      type: "ZIP",
      size: "5.7 MB"
    },
    {
      title: "Tax Documentation Guide",
      description: "Understanding tax requirements for service providers",
      type: "PDF",
      size: "0.8 MB"
    }
  ];

  const supportOptions = [
    {
      title: "Provider Community",
      description: "Connect with other providers, share experiences, and get advice",
      action: "Join Community"
    },
    {
      title: "Live Training Sessions",
      description: "Monthly webinars covering various aspects of provider success",
      action: "View Schedule"
    },
    {
      title: "One-on-One Support",
      description: "Schedule a call with our provider success team",
      action: "Book Session"
    },
    {
      title: "Help Center",
      description: "Browse our comprehensive knowledge base",
      action: "Visit Help Center"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Provider Resources
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Everything you need to succeed as a Tuma Helper service provider
            </p>
            <Button 
              size="lg" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={() => navigate('/become-provider')}
            >
              Become a Provider
            </Button>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Resource Categories</h2>
            <p className="text-xl text-muted-foreground">
              Find the resources you need to grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resourceCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.resources.map((resource, resourceIndex) => (
                      <li key={resourceIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                          {resource}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    Explore Resources
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Downloadable Resources</h2>
            
            <div className="space-y-4">
              {downloadableResources.map((resource, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                        <p className="text-muted-foreground mb-2">{resource.description}</p>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">{resource.type}</Badge>
                          <span className="text-sm text-muted-foreground">{resource.size}</span>
                        </div>
                      </div>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get Support</h2>
            <p className="text-xl text-muted-foreground">
              We're here to help you succeed every step of the way
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {supportOptions.map((option, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full btn-hero">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Tips */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Quick Success Tips</h2>
            
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Communication
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Respond to inquiries within 2 hours</li>
                      <li>• Be clear about your services and pricing</li>
                      <li>• Follow up after completing services</li>
                      <li>• Ask for reviews from satisfied customers</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Growth
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Keep your profile updated and complete</li>
                      <li>• Upload high-quality photos of your work</li>
                      <li>• Offer competitive and fair pricing</li>
                      <li>• Continuously improve your skills</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of successful service providers on Tuma Helper
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-hero"
                onClick={() => navigate('/become-provider')}
              >
                Apply to Become a Provider
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/contact')}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProviderResources;