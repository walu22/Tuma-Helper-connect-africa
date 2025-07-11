import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_amount: number;
  status: string;
  customer_name: string;
  customer_address: string;
  created_at: string;
  services: {
    title: string;
    service_categories: {
      name: string;
    };
  };
  customer_profile: {
    display_name: string | null;
  };
  provider_profile: {
    display_name: string | null;
  };
}

const statusConfig = {
  pending: { color: 'warning', icon: AlertCircle, label: 'Pending' },
  confirmed: { color: 'info', icon: CheckCircle, label: 'Confirmed' },
  in_progress: { color: 'info', icon: Clock, label: 'In Progress' },
  completed: { color: 'success', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'destructive', icon: XCircle, label: 'Cancelled' },
};

const Bookings = () => {
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      // Fetch bookings where user is the customer
      const { data: customerData, error: customerError } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            title,
            service_categories (name)
          ),
          customer_profile:profiles!customer_id (display_name),
          provider_profile:profiles!provider_id (display_name)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (customerError) throw customerError;

      // Fetch bookings where user is the provider
      const { data: providerData, error: providerError } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            title,
            service_categories (name)
          ),
          customer_profile:profiles!customer_id (display_name),
          provider_profile:profiles!provider_id (display_name)
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (providerError) throw providerError;

      setCustomerBookings(customerData || []);
      setProviderBookings(providerData || []);
    } catch (error: any) {
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filterBookings = (bookings: Booking[]) => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(booking => booking.status === statusFilter);
  };

  const BookingCard = ({ booking, isProvider = false }: { booking: Booking; isProvider?: boolean }) => {
    const StatusIcon = statusConfig[booking.status as keyof typeof statusConfig]?.icon || AlertCircle;
    
    return (
      <Card 
        className="cursor-pointer hover-scale service-card"
        onClick={() => navigate(`/bookings/${booking.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{booking.services.title}</CardTitle>
              <CardDescription className="mt-1">
                {isProvider ? `Customer: ${booking.customer_name}` : `Provider: ${booking.provider_profile.display_name || 'Service Provider'}`}
              </CardDescription>
            </div>
            <Badge 
              variant={statusConfig[booking.status as keyof typeof statusConfig]?.color as any || 'secondary'}
              className="ml-2"
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig[booking.status as keyof typeof statusConfig]?.label || booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(booking.booking_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(booking.booking_time)}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm text-muted-foreground line-clamp-2">
              {booking.customer_address}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <Badge variant="outline" className="text-xs">
              {booking.services.service_categories.name}
            </Badge>
            <div className="text-lg font-semibold text-primary">
              N${booking.total_amount}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-4">You need to be signed in to view your bookings.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage your service bookings and appointments</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="customer">
              My Bookings ({customerBookings.length})
            </TabsTrigger>
            <TabsTrigger value="provider">
              Service Requests ({providerBookings.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="customer" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Services You've Booked</h2>
              <p className="text-muted-foreground">Track your service appointments and requests</p>
            </div>
            
            {filterBookings(customerBookings).length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-4">
                  {statusFilter === 'all' 
                    ? "You haven't booked any services yet" 
                    : `No bookings with status: ${statusFilter}`}
                </p>
                <Button onClick={() => navigate('/services')}>
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterBookings(customerBookings).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="provider" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Service Requests</h2>
              <p className="text-muted-foreground">Manage bookings for your services</p>
            </div>
            
            {filterBookings(providerBookings).length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No service requests</h3>
                <p className="text-muted-foreground mb-4">
                  {statusFilter === 'all' 
                    ? "You haven't received any booking requests yet" 
                    : `No bookings with status: ${statusFilter}`}
                </p>
                <Button onClick={() => navigate('/services')}>
                  View Your Services
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterBookings(providerBookings).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isProvider />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Bookings;