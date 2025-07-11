import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Dial a Service</h1>
              <p className="text-xs text-muted-foreground">One tap, every service</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button variant="ghost" onClick={() => navigate("/services")}>
              Services
            </Button>
            <Button variant="ghost" onClick={() => navigate("/how-it-works")}>
              How it Works
            </Button>
            <Button variant="ghost" onClick={() => navigate("/become-provider")}>
              Become a Provider
            </Button>
            <Button variant="ghost" onClick={() => navigate("/help")}>
              Help
            </Button>
          </nav>

          {/* Location & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Windhoek, Namibia</span>
            </div>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button className="btn-hero" onClick={() => navigate("/register")}>
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Button variant="ghost" className="justify-start" onClick={() => navigate("/services")}>
                Services
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate("/how-it-works")}>
                How it Works
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate("/become-provider")}>
                Become a Provider
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate("/help")}>
                Help
              </Button>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground px-4">
                <MapPin className="w-4 h-4" />
                <span>Windhoek, Namibia</span>
              </div>
              <div className="flex space-x-2 px-4">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button className="btn-hero flex-1" onClick={() => navigate("/register")}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;