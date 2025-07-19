import { Users, Target, Award, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Users,
      title: "Community First",
      description: "We believe in building strong communities by connecting local service providers with customers who need their expertise."
    },
    {
      icon: Target,
      title: "Quality Service",
      description: "Every service provider on our platform is verified and committed to delivering exceptional results for our customers."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from our platform technology to customer support and service delivery."
    },
    {
      icon: Heart,
      title: "Trust & Safety",
      description: "Building trust through transparency, secure payments, and comprehensive safety measures for all our users."
    }
  ];

  const stats = [
    { number: "1,000+", label: "Active Providers" },
    { number: "5,000+", label: "Happy Customers" },
    { number: "4.8", label: "Average Rating" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Tuma Helper
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Connecting communities through trusted local services in Windhoek and beyond
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              To empower local service providers and make quality services accessible to everyone in Namibia. 
              We're building a platform where trust, quality, and community come together to create 
              meaningful connections between service providers and customers.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Growing Together</h2>
            <p className="text-xl text-muted-foreground">
              Our community keeps growing stronger every day
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Whether you need services or provide them, we're here to help
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-hero"
              onClick={() => navigate('/services')}
            >
              Find Services
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

export default About;