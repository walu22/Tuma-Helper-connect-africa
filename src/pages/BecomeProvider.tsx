import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Star, Shield, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProviderSignupData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  experience: string;
  bio: string;
}

const BecomeProvider = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProviderSignupData>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    experience: "",
    bio: ""
  });

  const benefits = [
    {
      icon: Users,
      title: "Growing Customer Base",
      description: "Access thousands of customers looking for your services"
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description: "Earn reviews and build a strong professional profile"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Get paid safely and on time through our platform"
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Work when you want and set your own availability"
    }
  ];

  const requirements = [
    "Valid ID document",
    "Proof of insurance (if applicable)",
    "Portfolio or work samples",
    "Background verification",
    "Complete training modules"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone,
        role: "provider"
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account, then complete your provider profile."
      });

      // Redirect to KYC verification after successful signup
      setTimeout(() => {
        navigate("/kyc-verification");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If already logged in and is provider, redirect to dashboard
  const { profile, isProvider } = useAuth();
  if (user && isProvider) {
    navigate("/provider/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-glow text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="text-white hover:bg-white/10 mb-4"
              >
                ← Back to Home
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Start Earning with Your Skills
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Join thousands of providers serving customers across Namibia
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Free to Join
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Flexible Hours
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Secure Payments
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Benefits Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Join Our Platform?</h2>
              <div className="grid gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">Requirements</h3>
              <div className="space-y-3">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create Provider Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+264 81 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    required
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g. 5"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Brief Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    required
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about your skills and experience..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Get Started"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => navigate("/auth")}
                  >
                    Sign in here
                  </Button>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BecomeProvider;