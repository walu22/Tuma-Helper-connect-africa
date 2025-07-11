import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Windhoek, Namibia");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary-glow to-accent text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            One Tap,{" "}
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Every Service
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Connect with verified local service providers in Windhoek and across Namibia. 
            From plumbing to house cleaning, we've got you covered.
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-8 mb-12 text-white/80">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-semibold">4.8/5 Average Rating</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30"></div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">500+ Verified Providers</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30"></div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">10,000+ Happy Customers</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="What service do you need? (e.g., plumber, house cleaning)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white/90 border-white/30 focus:bg-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white/90 border-white/30 focus:bg-white"
                />
              </div>
              
              <Button 
                onClick={handleSearch}
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-accent hover:bg-accent/90 text-white border-0"
              >
                <Search className="w-5 h-5 mr-2" />
                Find Services Now
              </Button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-8">
            <p className="text-white/70 mb-4">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Plumber", "House Cleaning", "Electrician", "Gardener", "Car Wash", "Beauty Services"].map((service) => (
                <button
                  key={service}
                  onClick={() => navigate(`/services?search=${encodeURIComponent(service)}`)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;