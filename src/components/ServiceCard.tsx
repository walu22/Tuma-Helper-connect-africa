import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, Home, MapPin, Star } from 'lucide-react';

export type CommonService = {
  id: string;
  title: string;
  description: string;
  price_from: number;
  price_to: number | null;
  price_unit: string;
  location: string;
  rating: number;
  total_reviews: number;
  service_categories: {
    name: string;
    icon: string;
  };
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    user_id?: string | null;
  } | null;
  service_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
};

interface ServiceCardProps {
  service: CommonService;
  onBook: (service: CommonService) => void;
  onOpen: (serviceId: string) => void;
}

const formatPrice = (priceFrom: number, priceTo: number | null, unit: string) => {
  if (priceTo && priceTo !== priceFrom) {
    return `N$${priceFrom} - N$${priceTo} ${unit}`;
  }
  return `N$${priceFrom} ${unit}`;
};

const ServiceCard = ({ service, onBook, onOpen }: ServiceCardProps) => {
  const primaryImage = service.service_images?.find((img) => img.is_primary) || service.service_images?.[0];

  return (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      onClick={() => onOpen(service.id)}
    >
      <div className="relative h-48 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={`${service.title} in ${service.location} - ${service.service_categories.name}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Home className="w-16 h-16 text-primary/40" />
          </div>
        )}

        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-white/90">
            <Clock className="w-3 h-3 mr-1" />
            Available
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg group-hover:text-primary transition-colors">{service.title}</CardTitle>
        <CardDescription className="line-clamp-2">{service.description}</CardDescription>

        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline">{service.service_categories.name}</Badge>
          {service.rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span className="font-medium">{service.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({service.total_reviews})</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
          <Avatar className="w-8 h-8">
            <AvatarImage src={service.profiles?.avatar_url || ''} alt={`${service.profiles?.display_name || 'Provider'} avatar`} />
            <AvatarFallback>{service.profiles?.display_name?.charAt(0) || 'P'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{service.profiles?.display_name || 'Service Provider'}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{service.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-primary">{formatPrice(service.price_from, service.price_to, service.price_unit)}</div>
            <p className="text-xs text-muted-foreground">Starting price</p>
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBook(service);
            }}
            aria-label={`Book ${service.title}`}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
