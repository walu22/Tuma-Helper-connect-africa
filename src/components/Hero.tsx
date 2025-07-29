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
    <section className="relative bg-gradient-to-br from-background to-muted/20 overflow-hidden min-h-[70vh] flex items-center">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23f1f5f9%22 fill-opacity=%220.4%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-foreground font-display">
            Find top-rated pros in your area.
          </h1>
          
          {/* Simple Search Bar - Angi Style */}
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl mx-auto mb-12">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="What can we help you with?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-0 focus-visible:ring-0"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="20120"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 border-0 focus-visible:ring-0"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="h-12 px-6 bg-primary hover:bg-primary/90 rounded-md"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;