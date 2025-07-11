import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Phone, Mail, Clock, HelpCircle, Shield, CreditCard, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I book a service?",
      answer: "Browse our services, select the one you need, choose your preferred provider, pick a date and time, then confirm your booking with payment."
    },
    {
      question: "What if I need to cancel my booking?",
      answer: "You can cancel your booking up to 24 hours before the scheduled time through your dashboard. Cancellations within 24 hours may incur a fee."
    },
    {
      question: "How do I become a service provider?",
      answer: "Click 'Become a Provider' in the navigation, complete the application form, verify your identity, and wait for approval. You'll then have access to your provider dashboard."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and mobile money. All payments are secure and processed through encrypted channels."
    },
    {
      question: "How are providers verified?",
      answer: "All providers undergo identity verification, background checks, and skill assessments. We also review their ratings and customer feedback regularly."
    },
    {
      question: "What if I'm not satisfied with a service?",
      answer: "Contact our support team within 24 hours of service completion. We'll investigate and may offer a refund or free repeat service."
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      available: "24/7"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      action: "+264 61 123 456",
      available: "Mon-Fri 8AM-6PM"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed questions",
      action: "support@tumahelper.com",
      available: "Response within 24h"
    }
  ];

  const helpCategories = [
    {
      icon: User,
      title: "Account & Profile",
      description: "Managing your account, profile settings, and preferences"
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Payment methods, invoices, and billing questions"
    },
    {
      icon: Shield,
      title: "Safety & Security",
      description: "Platform safety, privacy, and security features"
    },
    {
      icon: HelpCircle,
      title: "General Questions",
      description: "Common questions about using Tuma Helper"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">How can we help you?</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {supportOptions.map((option, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <option.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full mb-2">
                  {option.action}
                </Button>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  {option.available}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <category.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <CardTitle className="text-base">{category.title}</CardTitle>
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-primary/5 rounded-lg">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Still need help?
          </h3>
          <p className="text-muted-foreground mb-6">
            Our support team is here to assist you with any questions or issues
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Contact Support
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/services")}>
              Browse Services
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Help;