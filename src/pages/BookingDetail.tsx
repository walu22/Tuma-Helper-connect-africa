import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, MessageSquare, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface BookingDetail {
  id: string;
  customer_id: string;
  provider_id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  customer_name: string;
  customer_phone: string | null;
  customer_address: string;
  customer_notes: string | null;
  provider_notes: string | null;
  created_at: string;
  services: {
    title: string;
    description: string;
    service_categories: {
      name: string;
    };
  };
  customer_profile: {
    display_name: string | null;
  };
  provider_profile: {
    display_name: string | null;
    phone: string | null;
  };
}

const statusConfig = {
  pending: { color: 'warning', icon: AlertCircle, label: 'Pending Confirmation' },
  confirmed: { color: 'info', icon: CheckCircle, label: 'Confirmed' },
  in_progress: { color: 'info', icon: Clock, label: 'In Progress' },
  completed: { color: 'success', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'destructive', icon: XCircle, label: 'Cancelled' },
};

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            title,
            description,
            service_categories (name)
          ),
          customer_profile:profiles!customer_id (display_name),
          provider_profile:profiles!provider_id (display_name, phone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setBooking(data);
    } catch (error: any) {
      toast({
        title: "Booking not found",
        description: "This booking may have been removed or you don't have access to it.",
        variant: "destructive",
      });
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking || !user) return;

    try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus as 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' })
      .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Booking status changed to ${statusConfig[newStatus as keyof typeof statusConfig]?.label || newStatus}`,
      });

      // Refresh booking data
      fetchBooking();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isCustomer = user?.id === booking?.customer_id;
  const isProvider = user?.id === booking?.provider_id;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-48 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <Button onClick={() => navigate('/bookings')}>
            View All Bookings
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[booking.status as keyof typeof statusConfig]?.icon || AlertCircle;

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/bookings')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookings
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
            <p className="text-muted-foreground">Booking ID: {booking.id.slice(0, 8)}...</p>
          </div>
          <div className="text-right">
            <Badge 
              variant={statusConfig[booking.status as keyof typeof statusConfig]?.color as any || 'secondary'}
              className="text-sm px-3 py-1"
            >
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusConfig[booking.status as keyof typeof statusConfig]?.label || booking.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                  <Badge variant="outline" className="mt-2">
                    {booking.services.service_categories.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(booking.booking_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(booking.booking_time)} ({booking.duration_hours}h)
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">Service Address</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {booking.customer_address}
                      </p>
                    </div>
                  </div>

                  {booking.customer_notes && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">Customer Notes</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {booking.customer_notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.provider_notes && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">Provider Notes</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {booking.provider_notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">{booking.customer_name}</p>
                  {booking.customer_phone && (
                    <div className="flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="font-medium">Service Provider</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.provider_profile.display_name || 'Service Provider'}
                  </p>
                  {booking.provider_profile.phone && (
                    <div className="flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      <p className="text-sm text-muted-foreground">{booking.provider_profile.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  N${booking.total_amount}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  For {booking.duration_hours} hour{booking.duration_hours !== 1 ? 's' : ''} of service
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            {(isProvider || isCustomer) && booking.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isProvider && (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => handleStatusUpdate('confirmed')}
                      >
                        Confirm Booking
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleStatusUpdate('cancelled')}
                      >
                        Decline Booking
                      </Button>
                    </>
                  )}
                  {isCustomer && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('cancelled')}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingDetail;