import { Calendar, Download, ExternalLink, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Press = () => {
  const navigate = useNavigate();

  const pressReleases = [
    {
      title: "Tuma Helper Launches Platform to Connect Local Service Providers with Customers",
      date: "January 15, 2025",
      excerpt: "New digital platform aims to revolutionize how Namibians access home and business services.",
      category: "Launch"
    },
    {
      title: "Local Service Platform Sees 500% Growth in First Quarter",
      date: "December 10, 2024",
      excerpt: "Tuma Helper reports significant user adoption as more Namibians turn to digital solutions.",
      category: "Growth"
    },
    {
      title: "Tuma Helper Partners with Local Training Centers for Provider Education",
      date: "November 20, 2024",
      excerpt: "Initiative to enhance service quality through professional development programs.",
      category: "Partnership"
    },
    {
      title: "New Safety Features Introduced to Enhance User Trust",
      date: "October 15, 2024",
      excerpt: "Platform announces enhanced verification and safety measures for service providers.",
      category: "Product"
    }
  ];

  const mediaKit = [
    {
      name: "Company Logo Package",
      description: "High-resolution logos in various formats",
      type: "ZIP"
    },
    {
      name: "Brand Guidelines",
      description: "Official brand usage guidelines and standards",
      type: "PDF"
    },
    {
      name: "Executive Photos",
      description: "High-resolution photos of company leadership",
      type: "ZIP"
    },
    {
      name: "Company Fact Sheet",
      description: "Key statistics and company information",
      type: "PDF"
    }
  ];

  const awards = [
    {
      title: "Best Digital Innovation 2024",
      organization: "Namibia Business Awards",
      date: "December 2024"
    },
    {
      title: "Rising Star Technology Company",
      organization: "Tech Namibia",
      date: "November 2024"
    },
    {
      title: "Community Impact Award",
      organization: "Windhoek Chamber of Commerce",
      date: "October 2024"
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
              Press & Media
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Latest news, updates, and resources for media professionals
            </p>
          </div>
        </div>
      </section>

      {/* Press Contact */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Media Contact</CardTitle>
                <CardDescription className="text-center text-lg">
                  For press inquiries and interview requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-4">Sarah Mukonda</h3>
                    <p className="text-muted-foreground mb-4">Communications Manager</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>press@tumahelper.na</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>+264 61 123 4568</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-4">David Nakale</h3>
                    <p className="text-muted-foreground mb-4">Marketing Director</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>media@tumahelper.na</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>+264 61 123 4569</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Recent Press Releases</h2>
            
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="secondary">{release.category}</Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {release.date}
                          </div>
                        </div>
                        <CardTitle className="text-xl hover:text-primary cursor-pointer">
                          {release.title}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Read
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {release.excerpt}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Media Kit</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mediaKit.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        {item.type}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Awards & Recognition</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {awards.map((award, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{award.title}</h3>
                    <p className="text-muted-foreground mb-2">{award.organization}</p>
                    <p className="text-sm text-muted-foreground">{award.date}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Quick Facts</h2>
            
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Company Overview</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Founded: 2024</li>
                      <li>• Headquarters: Windhoek, Namibia</li>
                      <li>• Industry: Digital Services Platform</li>
                      <li>• Employees: 25+</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Platform Statistics</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• 1,000+ Active Service Providers</li>
                      <li>• 5,000+ Happy Customers</li>
                      <li>• 4.8 Average Rating</li>
                      <li>• 24/7 Support Available</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Press;