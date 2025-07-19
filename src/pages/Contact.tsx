import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Contact = () => {
  const navigate = useNavigate();

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: "+264 61 123 4567",
      description: "Available 24/7 for urgent matters"
    },
    {
      icon: Mail,
      title: "Email",
      details: "hello@tumahelper.na",
      description: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Address",
      details: "123 Independence Ave, Windhoek, Namibia",
      description: "Visit our office during business hours"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon - Fri: 8:00 AM - 6:00 PM",
      description: "Saturday: 9:00 AM - 3:00 PM"
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
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              We're here to help! Get in touch with our team
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mb-4">
                    <info.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg mb-2">{info.details}</p>
                  <CardDescription className="text-base">
                    {info.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Send Us a Message</h2>
              <p className="text-xl text-muted-foreground">
                Fill out the form below and we'll get back to you soon
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <Input id="name" placeholder="Your full name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <Input id="email" type="email" placeholder="your.email@example.com" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <Input id="subject" placeholder="What is this about?" />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                    />
                  </div>
                  
                  <Button className="w-full btn-hero" size="lg">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Need Immediate Help?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-hero"
                onClick={() => navigate('/help')}
              >
                Visit Help Center
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/safety')}
              >
                Safety Information
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;