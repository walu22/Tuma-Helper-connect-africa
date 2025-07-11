import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface City {
  id: string;
  name: string;
  region: string;
  country: string;
}

interface CitySelectorProps {
  selectedCityId?: string;
  onCityChange?: (cityId: string) => void;
  className?: string;
}

export const CitySelector = ({ selectedCityId, onCityChange, className }: CitySelectorProps) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, region, country')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCity = cities.find(city => city.id === selectedCityId);

  const handleCitySelect = (cityId: string) => {
    onCityChange?.(cityId);
    localStorage.setItem('selectedCityId', cityId);
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className={className}>
        <MapPin className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`gap-2 ${className}`}>
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">
            {selectedCity ? `${selectedCity.name}, ${selectedCity.region}` : t('label.select_city')}
          </span>
          <span className="sm:hidden">
            {selectedCity ? selectedCity.name : t('label.select_city')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {cities.map((city) => (
          <DropdownMenuItem
            key={city.id}
            onClick={() => handleCitySelect(city.id)}
            className={selectedCityId === city.id ? "bg-accent" : ""}
          >
            <div className="flex flex-col">
              <span className="font-medium">{city.name}</span>
              <span className="text-sm text-muted-foreground">{city.region}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};