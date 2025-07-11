import { useState, useEffect } from "react";
import { Heart, Star, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface FavoriteProvider {
  id: string;
  provider_id: string;
  created_at: string;
  provider_profile: {
    user_id: string;
    bio: string;
    hourly_rate: number;
    rating: number;
    total_jobs_completed: number;
    is_available: boolean;
    years_of_experience: number;
    profiles: {
      full_name: string;
      avatar_url: string;
      city: string;
    };
  };
  services: Array<{
    id: string;
    title: string;
    price_from: number;
    rating: number;
    service_categories: {
      name: string;
    };
  }>;
}

interface FavoriteButtonProps {
  providerId: string;
  size?: "sm" | "default" | "lg";
  showText?: boolean;
}

interface FavoritesListProps {
  compact?: boolean;
  limit?: number;
}

export const FavoriteButton = ({ providerId, size = "default", showText = false }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, providerId]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("customer_favorites")
      .select("id")
      .eq("customer_id", user.id)
      .eq("provider_id", providerId)
      .single();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("customer_favorites")
          .delete()
          .eq("customer_id", user.id)
          .eq("provider_id", providerId);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: "Removed from Favorites",
          description: "Provider removed from your favorites"
        });
      } else {
        const { error } = await supabase
          .from("customer_favorites")
          .insert({
            customer_id: user.id,
            provider_id: providerId
          });

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: "Added to Favorites",
          description: "Provider added to your favorites"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size={size}
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`${isFavorite ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
    >
      <Heart
        className={`${iconSize} ${isFavorite ? "fill-current" : ""} ${showText ? "mr-2" : ""}`}
      />
      {showText && (isFavorite ? "Favorited" : "Add to Favorites")}
    </Button>
  );
};

export const FavoritesList = ({ compact = false, limit }: FavoritesListProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      let query = supabase
        .from("customer_favorites")
        .select(`
          id,
          provider_id,
          created_at
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: favoritesData } = await query;

      if (favoritesData) {
        // Fetch services for each favorite provider
        const providersWithServices = await Promise.all(
          favoritesData.map(async (favorite) => {
            const { data: services } = await supabase
              .from("services")
              .select(`
                id,
                title,
                price_from,
                rating,
                service_categories(name)
              `)
              .eq("provider_id", favorite.provider_id)
              .eq("is_available", true)
              .limit(2);

            return {
              ...favorite,
              provider_profile: null, // Simplified for demo
              services: services || []
            };
          })
        );

        setFavorites(providersWithServices);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (providerId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("customer_favorites")
      .delete()
      .eq("customer_id", user.id)
      .eq("provider_id", providerId);

    if (!error) {
      setFavorites(prev => prev.filter(fav => fav.provider_id !== providerId));
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to view your favorites</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
        <p className="text-muted-foreground mb-4">
          Start adding providers to your favorites to see them here
        </p>
        <Button onClick={() => navigate("/services")}>
          Browse Services
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={favorite.provider_profile?.profiles?.avatar_url} />
                  <AvatarFallback>
                    {favorite.provider_profile?.profiles?.full_name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate">
                      {favorite.provider_profile?.profiles?.full_name || "Unknown Provider"}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {favorite.provider_profile?.is_available && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      )}
                      <FavoriteButton
                        providerId={favorite.provider_id}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{favorite.provider_profile?.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{favorite.provider_profile?.profiles?.city || "Location not set"}</span>
                    </div>
                    {favorite.provider_profile?.hourly_rate && (
                      <span>From NAD {favorite.provider_profile.hourly_rate}/hr</span>
                    )}
                  </div>

                  {!compact && favorite.provider_profile?.bio && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {favorite.provider_profile.bio}
                    </p>
                  )}

                  {favorite.services.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {favorite.services.slice(0, compact ? 1 : 2).map((service) => (
                        <Badge key={service.id} variant="outline" className="text-xs">
                          {service.title}
                        </Badge>
                      ))}
                      {favorite.services.length > (compact ? 1 : 2) && (
                        <Badge variant="outline" className="text-xs">
                          +{favorite.services.length - (compact ? 1 : 2)} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {favorite.provider_profile?.total_jobs_completed || 0} jobs completed
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/provider/${favorite.provider_id}`)}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/services?provider=${favorite.provider_id}`)}
                      >
                        Book Service
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {limit && favorites.length >= limit && (
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate("/favorites")}>
            View All Favorites
          </Button>
        </div>
      )}
    </div>
  );
};

export default FavoritesList;