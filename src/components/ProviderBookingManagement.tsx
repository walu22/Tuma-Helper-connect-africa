import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  MessageSquare,
  Check,
  X,
  Eye,
  Star,
  DollarSign
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
  };
  profiles: {
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const ProviderBookingManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [providerNotes, setProviderNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (title, description),
          profiles!bookings_customer_id_fkey (display_name, full_name, avatar_url)
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading bookings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string, notes?: string) => {
    setActionLoading(true);
    try {
      const updateData: any = { status: newStatus };
      if (notes) {
        updateData.provider_notes = notes;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking updated",
        description: `Booking ${newStatus === 'confirmed' ? 'accepted' : newStatus}.`,
      });

      fetchBookings();
      setSelectedBooking(null);
      setProviderNotes('');
    } catch (error: any) {
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptBooking = (booking: Booking) => {
    updateBookingStatus(booking.id, 'confirmed');
  };

  const handleDeclineBooking = (booking: Booking) => {
    updateBookingStatus(booking.id, 'cancelled');
  };

  const handleStartJob = (booking: Booking) => {
    updateBookingStatus(booking.id, 'in_progress');
  };

  const handleCompleteJob = (booking: Booking) => {
    updateBookingStatus(booking.id, 'completed', providerNotes);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionButtons = (booking: Booking) => {
    switch (booking.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAcceptBooking(booking)}
              disabled={actionLoading}
            >
              <Check className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeclineBooking(booking)}
              disabled={actionLoading}
            >
              <X className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        );
      case 'confirmed':
        return (
          <Button
            size="sm"
            onClick={() => handleStartJob(booking)}
            disabled={actionLoading}
          >
            Start Job
          </Button>
        );
      case 'in_progress':
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedBooking(booking);
                  setProviderNotes(booking.provider_notes || '');
                }}
              >
                Complete Job
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Complete Job</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="provider-notes">Job Completion Notes (Optional)</Label>
                  <Textarea
                    id="provider-notes"
                    value={providerNotes}
                    onChange={(e) => setProviderNotes(e.target.value)}
                    placeholder="Add any notes about the completed job..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => selectedBooking && handleCompleteJob(selectedBooking)}>
                    Mark as Completed
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-NA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filterBookingsByStatus = (status: string | null) => {
    if (!status) return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <p className="text-muted-foreground">Manage your service bookings and requests</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Bookings ({bookings.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({filterBookingsByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({filterBookingsByStatus('confirmed').length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({filterBookingsByStatus('in_progress').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filterBookingsByStatus('completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <BookingList bookings={bookings} getActionButtons={getActionButtons} getStatusColor={getStatusColor} formatDate={formatDate} formatTime={formatTime} />
        </TabsContent>

        <TabsContent value="pending">
          <BookingList bookings={filterBookingsByStatus('pending')} getActionButtons={getActionButtons} getStatusColor={getStatusColor} formatDate={formatDate} formatTime={formatTime} />
        </TabsContent>

        <TabsContent value="confirmed">
          <BookingList bookings={filterBookingsByStatus('confirmed')} getActionButtons={getActionButtons} getStatusColor={getStatusColor} formatDate={formatDate} formatTime={formatTime} />
        </TabsContent>

        <TabsContent value="in_progress">
          <BookingList bookings={filterBookingsByStatus('in_progress')} getActionButtons={getActionButtons} getStatusColor={getStatusColor} formatDate={formatDate} formatTime={formatTime} />
        </TabsContent>

        <TabsContent value="completed">
          <BookingList bookings={filterBookingsByStatus('completed')} getActionButtons={getActionButtons} getStatusColor={getStatusColor} formatDate={formatDate} formatTime={formatTime} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface BookingListProps {
  bookings: Booking[];
  getActionButtons: (booking: Booking) => React.ReactNode;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
}

const BookingList = ({ bookings, getActionButtons, getStatusColor, formatDate, formatTime }: BookingListProps) => {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground">
            When customers book your services, they'll appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{booking.services.title}</h3>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{booking.customer_name}</span>
                    </div>
                    {booking.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{booking.customer_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.customer_address}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(booking.booking_time)} ({booking.duration_hours}h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">N${booking.total_amount}</span>
                    </div>
                  </div>
                </div>

                {booking.customer_notes && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Customer Notes:</h4>
                    <p className="text-sm">{booking.customer_notes}</p>
                  </div>
                )}

                {booking.provider_notes && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Your Notes:</h4>
                    <p className="text-sm">{booking.provider_notes}</p>
                  </div>
                )}
              </div>

              <div className="ml-4">
                {getActionButtons(booking)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProviderBookingManagement;