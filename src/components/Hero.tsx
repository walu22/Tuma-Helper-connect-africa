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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
      }}
    >
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Find top-rated pros in your area.
          </h1>
          
          {/* Angi-style Search Bar */}
          <div className="bg-white rounded-full shadow-lg p-2 flex items-center max-w-2xl">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <Input
                type="text"
                placeholder="What can we help you with?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 text-lg placeholder:text-gray-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center px-4">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <Input
                type="text"
                placeholder="Zip Code"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-0 focus-visible:ring-0 text-lg placeholder:text-gray-500 w-32"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full h-12 w-12 flex items-center justify-center ml-2"
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