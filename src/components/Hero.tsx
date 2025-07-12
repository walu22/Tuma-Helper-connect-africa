import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (user) {
      fetchSearchHistory();
    }
  }, [user]);

  const fetchSearchHistory = async () => {
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
  };

  const saveSearchHistory = async (query: string) => {
    if (!user || !query.trim()) return;

    await supabase
      .from("search_history")
      .insert({
        user_id: user.id,
        search_query: query,
        search_filters: { query, location } as any
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
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight px-4">
            {t('hero.title')}
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
            {t('hero.subtitle')}
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-12 text-white/80 px-4">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              <span className="font-semibold text-sm md:text-base">{t('hero.rating')}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30"></div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm md:text-base">{t('hero.providers')}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30"></div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm md:text-base">{t('hero.customers')}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 max-w-2xl mx-4 md:mx-auto border border-white/20">
            <div className="space-y-3 md:space-y-4">
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('hero.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 0 && searchSuggestions.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 0 && searchSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10 md:pl-12 h-12 md:h-14 text-base md:text-lg bg-white/90 border-white/30 focus:bg-white text-gray-900 placeholder:text-gray-600"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                
                {/* Search Suggestions */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto mt-1">
                    {searchSuggestions
                      .filter(suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-foreground"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 md:pl-12 h-12 md:h-14 text-base md:text-lg bg-white/90 border-white/30 focus:bg-white text-gray-900 placeholder:text-gray-600"
                />
              </div>
              
              <Button 
                onClick={handleSearch}
                size="lg"
                className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-accent hover:bg-accent/90 text-white border-0 touch-manipulation"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                {t('hero.find_services')}
              </Button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-8 px-4">
            <p className="text-white/70 mb-4 text-sm md:text-base">{t('hero.popular_searches')}</p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {["Plumber", "House Cleaning", "Electrician", "Gardener", "Car Wash", "Beauty Services"].map((service) => (
                <button
                  key={service}
                  onClick={() => navigate(`/services?search=${encodeURIComponent(service)}`)}
                  className="px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-xs md:text-sm font-medium transition-all duration-300 hover:scale-105 touch-manipulation"
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