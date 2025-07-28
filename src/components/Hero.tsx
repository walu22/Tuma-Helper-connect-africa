import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Windhoek, Namibia");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const fetchSearchHistory = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("search_history")
      .select("search_query")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (data) {
      const suggestions = [...new Set(data.map(item => item.search_query))];
      setSearchSuggestions(suggestions);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSearchHistory();
    }
  }, [user, fetchSearchHistory]);

  const saveSearchHistory = async (query: string) => {
    if (!user || !query.trim()) return;

    await supabase
      .from("search_history")
      .insert({
        user_id: user.id,
        search_query: query,
        search_filters: { query, location } as Record<string, unknown>
      });
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await saveSearchHistory(searchQuery);
      navigate(`/services?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`);
      setShowSuggestions(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary-glow to-accent text-white overflow-hidden min-h-[80vh] flex items-center">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-mesh opacity-20"></div>
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-10 right-1/3 w-24 h-24 bg-accent-light rounded-full blur-2xl animate-pulse-glow"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Hero Title with Gradient Text */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight px-4 animate-fade-in-left">
            <span className="block">Find Amazing</span>
            <span className="block text-gradient-warm animate-shimmer bg-gradient-to-r from-white via-accent-light to-white bg-clip-text text-transparent">
              Local Services
            </span>
            <span className="block">In Namibia</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed px-4 animate-fade-in-right" style={{ animationDelay: '0.2s' }}>
            Connect with trusted professionals for home services, beauty, automotive, and more. Quality guaranteed, locally delivered.
          </p>

          {/* Enhanced Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-12 text-white/80 px-4 animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 interactive-glow">
              <Star className="w-4 h-4 md:w-5 md:h-5 fill-current text-warning" />
              <span className="font-semibold text-sm md:text-base">4.9 Rating</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30"></div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 interactive-glow">
              <span className="font-semibold text-sm md:text-base">1000+ Providers</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30"></div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 interactive-glow">
              <span className="font-semibold text-sm md:text-base">50k+ Customers</span>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="card-glass rounded-3xl p-6 md:p-8 max-w-2xl mx-4 md:mx-auto animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <div className="space-y-4 md:space-y-6">
              <div className="relative">
                <Search className="absolute left-4 md:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/70" />
                <Input
                  type="text"
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 0 && searchSuggestions.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 0 && searchSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="input-glass pl-12 md:pl-14 h-14 md:h-16 text-base md:text-lg font-medium"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                
                {/* Enhanced Search Suggestions */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-md border border-white/20 rounded-xl shadow-elevated z-50 max-h-40 overflow-y-auto mt-2">
                    {searchSuggestions
                      .filter(suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors text-foreground interactive-lift"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-4 md:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/70" />
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-glass pl-12 md:pl-14 h-14 md:h-16 text-base md:text-lg font-medium"
                />
              </div>
              
              <Button 
                onClick={handleSearch}
                size="lg"
                className="w-full h-14 md:h-16 text-base md:text-lg font-bold bg-accent hover:bg-accent/90 text-white border-0 rounded-xl interactive-scale shadow-accent hover:shadow-elevated transition-all duration-300"
              >
                <Search className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                Find Services Now
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Popular Searches */}
        <div className="mt-12 px-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="text-white/70 mb-6 text-sm md:text-base font-medium">Popular Services:</p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {["Plumber", "House Cleaning", "Electrician", "Gardener", "Car Wash", "Beauty Services"].map((service, index) => (
              <button
                key={service}
                onClick={() => navigate(`/services?search=${encodeURIComponent(service)}`)}
                className="px-4 md:px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full text-sm md:text-base font-medium transition-all duration-300 interactive-scale border border-white/20 hover:border-white/40"
                style={{ animationDelay: `${0.9 + index * 0.1}s` }}
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;