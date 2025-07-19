import { Briefcase, Heart, Users, TrendingUp, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Careers = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: "Community Impact",
      description: "Make a difference in people's lives by connecting them with quality services."
    },
    {
      icon: Users,
      title: "Collaborative Culture",
      description: "Work with passionate people who care about building something meaningful."
    },
    {
      icon: TrendingUp,
      title: "Growth Opportunities",
      description: "Develop your skills and grow your career in a fast-moving environment."
    }
  ];

  const openPositions = [
    {
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "Windhoek, Namibia",
      type: "Full-time",
      description: "Join our engineering team to build scalable solutions for our growing platform."
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Help design intuitive experiences that make service booking seamless."
    },
    {
      title: "Customer Success Manager",
      department: "Operations",
      location: "Windhoek, Namibia",
      type: "Full-time",
      description: "Ensure our customers and service providers have amazing experiences."
    },
    {
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Windhoek, Namibia",
      type: "Full-time",
      description: "Drive growth through creative marketing campaigns and community engagement."
    }
  ];

  const benefits = [
    "Competitive salary and equity",
    "Comprehensive health insurance",
    "Flexible working hours",
    "Professional development budget",
    "Modern office in Windhoek",
    "Team retreats and events"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Help us transform how people access services in Namibia
            </p>
            <Button 
              size="lg" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Open Positions
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Join Tuma Helper?</h2>
            <p className="text-xl text-muted-foreground">
              Be part of something that makes a real difference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mb-4">
                    <value.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Benefits & Perks</h2>
              <p className="text-xl text-muted-foreground">
                We take care of our team members
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
            <p className="text-xl text-muted-foreground">
              Find your next opportunity with us
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {openPositions.map((position, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        {position.title}
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        {position.description}
                      </CardDescription>
                    </div>
                    <Button className="btn-hero self-start sm:self-center">
                      Apply Now
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary">
                      <Users className="w-3 h-3 mr-1" />
                      {position.department}
                    </Badge>
                    <Badge variant="secondary">
                      <MapPin className="w-3 h-3 mr-1" />
                      {position.location}
                    </Badge>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {position.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Don't See a Perfect Match?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
            </p>
            <Button 
              size="lg" 
              className="btn-hero"
              onClick={() => navigate('/contact')}
            >
              Send Your Resume
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;