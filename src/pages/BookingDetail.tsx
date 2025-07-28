import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  MessageSquare,
  Star,
  CreditCard
} from 'lucide-react';

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string;
  customer_notes: string | null;
  provider_notes: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  services: {
    title: string;
    description: string;
    price_unit: string;
  };
  profiles: {
    display_name: string | null;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
}

const BookingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            services (
              title,
              description,
              price_unit
            ),
            profiles!fk_bookings_provider (
              display_name,
              full_name,
              phone,
              avatar_url
            )
          `)
          .eq('id', id)
          .eq('customer_id', user.id)
          .single();

        if (error) throw error;
        setBooking(data);
      } catch (error: unknown) {
        console.error('Error fetching booking:', error);
        toast({
          title: "Error loading booking",
          description: error.message,
          variant: "destructive",
        });
        navigate('/bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, user, toast, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-NA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Booking not found</h1>
          <Button onClick={() => navigate('/bookings')} className="mt-4">
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/bookings')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookings
        </Button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{booking.services.title}</h3>
              <p className="text-muted-foreground">{booking.services.description}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(booking.booking_date)}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{formatTime(booking.booking_time)} ({booking.duration_hours}h)</span>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{booking.customer_address}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">N${booking.total_amount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Service Provider
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {booking.profiles.avatar_url ? (
                <img 
                  src={booking.profiles.avatar_url} 
                  alt="Provider"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">
                  {booking.profiles.display_name || booking.profiles.full_name}
                </h3>
                {booking.profiles.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{booking.profiles.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            {booking.provider_notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Provider Notes:</h4>
                  <p className="text-sm text-muted-foreground">{booking.provider_notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Name:</strong> {booking.customer_name}
            </div>
            {booking.customer_phone && (
              <div>
                <strong>Phone:</strong> {booking.customer_phone}
              </div>
            )}
            <div>
              <strong>Address:</strong> {booking.customer_address}
            </div>
            {booking.customer_notes && (
              <div>
                <strong>Notes:</strong>
                <p className="text-sm text-muted-foreground mt-1">{booking.customer_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Booking Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Booking created on {new Date(booking.created_at).toLocaleDateString('en-NA')}</span>
              </div>
              {booking.status === 'confirmed' && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Payment confirmed</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {booking.status === 'pending' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-3">
            Your booking is pending payment confirmation. Complete the payment to confirm your booking.
          </p>
          <Button variant="default">
            Complete Payment
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;