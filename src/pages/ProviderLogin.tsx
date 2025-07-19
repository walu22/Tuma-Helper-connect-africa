import { LogIn, User, Lock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProviderLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <LogIn className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Provider Login
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Access your provider dashboard and manage your services
            </p>
          </div>
        </div>
      </section>

      {/* Login Form */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                  Log in to your provider account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input id="email" type="email" placeholder="your.email@example.com" className="pl-10" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input id="password" type="password" placeholder="Enter your password" className="pl-10" />
                    </div>
                  </div>
                  
                  <Button className="w-full btn-hero" size="lg">
                    Log In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <div className="text-center">
                    <button className="text-primary hover:underline text-sm">
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <div className="text-center mt-6">
              <p className="text-muted-foreground">
                Not a provider yet?{' '}
                <button 
                  onClick={() => navigate('/become-provider')}
                  className="text-primary hover:underline font-medium"
                >
                  Apply to become a provider
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProviderLogin;