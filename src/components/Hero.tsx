import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import namibianDesertHero from "@/assets/namibian-desert-hero.jpg";

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
    <section 
      className="relative min-h-[500px] flex items-center bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.3), rgba(205, 133, 63, 0.4)), url('${namibianDesertHero}')`
      }}
    >
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Find trusted local services across Namibia.
          </h1>
          
          {/* Namibian-style Search Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-glow p-2 flex items-center max-w-2xl border border-warning/20">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-secondary mr-3" />
              <Input
                type="text"
                placeholder="What service do you need?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 text-lg placeholder:text-secondary/70 bg-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-px h-8 bg-secondary/20"></div>
            <div className="flex items-center px-4">
              <MapPin className="w-5 h-5 text-secondary mr-3" />
              <Input
                type="text"
                placeholder="Area in Namibia"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-0 focus-visible:ring-0 text-lg placeholder:text-secondary/70 w-40 bg-transparent"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center ml-2 shadow-medium hover:shadow-glow transition-all duration-300"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;