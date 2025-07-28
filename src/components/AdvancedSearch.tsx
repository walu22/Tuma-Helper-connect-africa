import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Star, Clock, DollarSign, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SearchFilters {
  query: string;
  location: string;
  category: string;
  priceRange: [number, number];
  rating: number;
  availability: string;
  sortBy: string;
  services: string[];
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

const AdvancedSearch = ({ onSearch, initialFilters }: AdvancedSearchProps) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "Windhoek, Namibia",
    category: "",
    priceRange: [0, 1000],
    rating: 0,
    availability: "",
    sortBy: "relevance",
    services: [],
    ...initialFilters
  });

  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchSearchHistory();
    }
  }, [user]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("service_categories")
      .select("*")
      .order("name");
    
    if (data) {
      setCategories(data);
    }
  };

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

  const saveSearchHistory = async (searchFilters: SearchFilters) => {
    if (!user || !searchFilters.query.trim()) return;

    await supabase
      .from("search_history")
      .insert({
        user_id: user.id,
        search_query: searchFilters.query,
        search_filters: searchFilters as Record<string, unknown>
      });
  };

  const handleSearch = async () => {
    await saveSearchHistory(filters);
    onSearch(filters);
    setShowSuggestions(false);
  };

  const updateFilter = (key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      location: "Windhoek, Namibia",
      category: "",
      priceRange: [0, 1000],
      rating: 0,
      availability: "",
      sortBy: "relevance",
      services: []
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.rating > 0) count++;
    if (filters.availability) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    return count;
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for services..."
              value={filters.query}
              onChange={(e) => {
                updateFilter("query", e.target.value);
                setShowSuggestions(e.target.value.length > 0 && searchSuggestions.length > 0);
              }}
              onFocus={() => setShowSuggestions(filters.query.length > 0 && searchSuggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10"
            />
            
            {/* Search Suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                {searchSuggestions
                  .filter(suggestion => suggestion.toLowerCase().includes(filters.query.toLowerCase()))
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-foreground"
                      onClick={() => {
                        updateFilter("query", suggestion);
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

          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="w-48"
            />
          </div>

          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6" align="end">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                </div>

                {/* Category Filter */}
                <div className="space-y-3">
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <Label>Price Range (NAD)</Label>
                  <div className="px-2">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => updateFilter("priceRange", value)}
                      max={1000}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>NAD {filters.priceRange[0]}</span>
                      <span>NAD {filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <Label>Minimum Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={filters.rating >= rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter("rating", rating)}
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3" />
                        {rating}+
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="space-y-3">
                  <Label>Availability</Label>
                  <Select value={filters.availability} onValueChange={(value) => updateFilter("availability", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any time</SelectItem>
                      <SelectItem value="today">Available today</SelectItem>
                      <SelectItem value="tomorrow">Available tomorrow</SelectItem>
                      <SelectItem value="week">Available this week</SelectItem>
                      <SelectItem value="weekend">Available weekends</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-3">
                  <Label>Sort by</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="rating">Highest rated</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="newest">Newest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={handleSearch} className="px-6">
            Search
          </Button>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {categories.find(c => c.id === filters.category)?.name}
                <button
                  onClick={() => updateFilter("category", "")}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.rating > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.rating}+ stars
                <button
                  onClick={() => updateFilter("rating", 0)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.availability && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.availability}
                <button
                  onClick={() => updateFilter("availability", "")}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                NAD {filters.priceRange[0]} - {filters.priceRange[1]}
                <button
                  onClick={() => updateFilter("priceRange", [0, 1000])}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;