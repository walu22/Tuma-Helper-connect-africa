import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Star, Clock, DollarSign, SlidersHorizontal, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
  distance: number;
  verified: boolean;
  instantBooking: boolean;
  languages: string[];
  serviceTypes: string[];
  experienceLevel: string;
  responseTime: string;
}

interface AdvancedSearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

const AdvancedSearchFilters = ({ 
  onSearch, 
  onFiltersChange, 
  initialFilters,
  className 
}: AdvancedSearchFiltersProps) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "Windhoek, Namibia",
    category: "",
    priceRange: [0, 1000],
    rating: 0,
    availability: "",
    sortBy: "relevance",
    distance: 25,
    verified: false,
    instantBooking: false,
    languages: [],
    serviceTypes: [],
    experienceLevel: "",
    responseTime: "",
    ...initialFilters
  });

  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [cities, setCities] = useState<Record<string, unknown>[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchCities();
    if (user) {
      fetchSearchHistory();
    }
    loadRecentSearches();
  }, [user]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("service_categories")
      .select("*")
      .order("name");
    
    if (data) {
      setCategories(data);
    }
  };

  const fetchCities = async () => {
    const { data } = await supabase
      .from("cities")
      .select("*")
      .eq("is_active", true)
      .order("name");
    
    if (data) {
      setCities(data);
    }
  };

  const fetchSearchHistory = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("search_history")
      .select("search_query")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (data) {
      const suggestions = [...new Set(data.map(item => item.search_query))];
      setSearchSuggestions(suggestions);
    }
  };

  const loadRecentSearches = () => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  };

  const saveSearchHistory = async (searchFilters: SearchFilters) => {
    if (!searchFilters.query.trim()) return;

    // Save to database if user is logged in
    if (user) {
      await supabase
        .from("search_history")
        .insert({
          user_id: user.id,
          search_query: searchFilters.query,
          search_filters: searchFilters as any
        });
    }

    // Save to localStorage
    const recent = [searchFilters.query, ...recentSearches.filter(s => s !== searchFilters.query)].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  const handleSearch = async () => {
    await saveSearchHistory(filters);
    onSearch(filters);
    setShowSuggestions(false);
  };

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: filters.query, // Keep search query
      location: "Windhoek, Namibia",
      category: "",
      priceRange: [0, 1000],
      rating: 0,
      availability: "",
      sortBy: "relevance",
      distance: 25,
      verified: false,
      instantBooking: false,
      languages: [],
      serviceTypes: [],
      experienceLevel: "",
      responseTime: ""
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.rating > 0) count++;
    if (filters.availability) count++;
    if (filters.verified) count++;
    if (filters.instantBooking) count++;
    if (filters.experienceLevel) count++;
    if (filters.responseTime) count++;
    if (filters.languages.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.distance < 25) count++;
    return count;
  };

  const quickFilters = [
    { label: "Verified Only", key: "verified", type: "boolean" },
    { label: "Instant Booking", key: "instantBooking", type: "boolean" },
    { label: "Top Rated (4.5+)", key: "rating", value: 4.5 },
    { label: "Available Today", key: "availability", value: "today" },
    { label: "Within 10km", key: "distance", value: 10 }
  ];

  const availableLanguages = ["English", "Afrikaans", "German", "Oshiwambo"];
  const experienceLevels = ["Entry Level", "Experienced", "Expert", "Master"];

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for services, providers, or keywords..."
                value={filters.query}
                onChange={(e) => {
                  updateFilter("query", e.target.value);
                  setShowSuggestions(e.target.value.length > 0 && (searchSuggestions.length > 0 || recentSearches.length > 0));
                }}
                onFocus={() => setShowSuggestions(filters.query.length > 0 && (searchSuggestions.length > 0 || recentSearches.length > 0))}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 h-12 text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              
              {/* Search Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                  {recentSearches.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Recent Searches</p>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-foreground rounded-sm"
                          onClick={() => {
                            updateFilter("query", search);
                            setShowSuggestions(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{search}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {searchSuggestions.length > 0 && (
                    <div className="p-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions</p>
                      {searchSuggestions
                        .filter(suggestion => suggestion.toLowerCase().includes(filters.query.toLowerCase()))
                        .map((suggestion, index) => (
                          <button
                            key={index}
                            className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-foreground rounded-sm"
                            onClick={() => {
                              updateFilter("query", suggestion);
                              setShowSuggestions(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Search className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{suggestion}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Location Input */}
            <div className="relative lg:w-64">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Select value={filters.location} onValueChange={(value) => updateFilter("location", value)}>
                <SelectTrigger className="pl-10 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id as string} value={`${city.name as string}, ${city.region as string}`}>
                      {city.name as string}, {city.region as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Button */}
            <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative h-12 px-4">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Advanced Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Service Category</Label>
                    <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id as string} value={category.id as string}>
                            {category.name as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Price Range (NAD)</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
                        max={1000}
                        min={0}
                        step={25}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>NAD {filters.priceRange[0]}</span>
                        <span>NAD {filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Distance Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Distance (km)</Label>
                    <div className="px-2">
                      <Slider
                        value={[filters.distance]}
                        onValueChange={(value) => updateFilter("distance", value[0])}
                        max={50}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>1 km</span>
                        <span className="font-medium">{filters.distance} km</span>
                        <span>50 km</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Minimum Rating</Label>
                    <div className="flex gap-2">
                      {[0, 3, 4, 4.5, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant={filters.rating >= rating ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilter("rating", rating)}
                          className="flex items-center gap-1"
                        >
                          <Star className="h-3 w-3" />
                          {rating === 0 ? "Any" : `${rating}+`}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Availability</Label>
                    <Select value={filters.availability} onValueChange={(value) => updateFilter("availability", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any time</SelectItem>
                        <SelectItem value="now">Available now</SelectItem>
                        <SelectItem value="today">Available today</SelectItem>
                        <SelectItem value="tomorrow">Available tomorrow</SelectItem>
                        <SelectItem value="week">Available this week</SelectItem>
                        <SelectItem value="weekend">Available weekends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Experience Level</Label>
                    <Select value={filters.experienceLevel} onValueChange={(value) => updateFilter("experienceLevel", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any experience</SelectItem>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level.toLowerCase()}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Response Time */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Response Time</Label>
                    <Select value={filters.responseTime} onValueChange={(value) => updateFilter("responseTime", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any response time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any response time</SelectItem>
                        <SelectItem value="15min">Within 15 minutes</SelectItem>
                        <SelectItem value="1hour">Within 1 hour</SelectItem>
                        <SelectItem value="4hours">Within 4 hours</SelectItem>
                        <SelectItem value="24hours">Within 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Languages */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Languages Spoken</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableLanguages.map((language) => (
                        <div key={language} className="flex items-center space-x-2">
                          <Checkbox
                            id={language}
                            checked={filters.languages.includes(language)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilter("languages", [...filters.languages, language]);
                              } else {
                                updateFilter("languages", filters.languages.filter(l => l !== language));
                              }
                            }}
                          />
                          <Label htmlFor={language} className="text-sm">{language}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Quick Toggles */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Quick Filters</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="verified" className="text-sm">Verified providers only</Label>
                        <Switch
                          id="verified"
                          checked={filters.verified}
                          onCheckedChange={(checked) => updateFilter("verified", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="instant" className="text-sm">Instant booking available</Label>
                        <Switch
                          id="instant"
                          checked={filters.instantBooking}
                          onCheckedChange={(checked) => updateFilter("instantBooking", checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Sort by</Label>
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
                        <SelectItem value="popular">Most popular</SelectItem>
                        <SelectItem value="response_time">Fastest response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Search Button */}
            <Button onClick={handleSearch} className="h-12 px-8 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.label}
            variant="outline"
            size="sm"
            onClick={() => {
              if (filter.type === "boolean") {
                updateFilter(filter.key as keyof SearchFilters, !filters[filter.key as keyof SearchFilters] as any);
              } else {
                updateFilter(filter.key as keyof SearchFilters, filter.value as any);
              }
            }}
            className={`${
              (filter.type === "boolean" && filters[filter.key as keyof SearchFilters]) ||
              (filter.value && filters[filter.key as keyof SearchFilters] === filter.value)
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {(categories.find(c => c.id === filters.category)?.name as string) || 'Unknown'}
              <button
                onClick={() => updateFilter("category", "")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
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
                <X className="h-3 w-3" />
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
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.verified && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Verified only
              <button
                onClick={() => updateFilter("verified", false)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.instantBooking && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Instant booking
              <button
                onClick={() => updateFilter("instantBooking", false)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
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
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.distance < 25 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Within {filters.distance}km
              <button
                onClick={() => updateFilter("distance", 25)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchFilters;