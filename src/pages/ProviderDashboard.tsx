import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Star, 
  Clock, 
  Users,
  BarChart3,
  MessageCircle,
  Settings,
  FileText,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceManagement from '@/components/ServiceManagement';
import ProviderBookingManagement from '@/components/ProviderBookingManagement';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalJobs: number;
  completedJobs: number;
  averageRating: number;
  totalReviews: number;
  pendingBookings: number;
  activeDisputes: number;
}

interface RecentBooking {
  id: string;
  customer_name: string;
  service_title: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  status: string;
}

interface EarningsData {
  month: string;
  earnings: number;
}

const ProviderDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalJobs: 0,
    completedJobs: 0,
    averageRating: 0,
    totalReviews: 0,
    pendingBookings: 0,
    activeDisputes: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);

  useEffect(() => {
    if (!user || profile?.role !== 'provider') {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [user, profile, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch earnings statistics
      const { data: earnings } = await supabase
        .from('provider_earnings')
        .select('*')
        .eq('provider_id', user.id);

      // Fetch booking statistics
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          services (title)
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch reviews statistics
      const { data: reviews } = await supabase
        .from('provider_reviews')
        .select('rating')
        .eq('provider_id', user.id);

      // Fetch pending bookings
      const { data: pendingBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('provider_id', user.id)
        .eq('status', 'pending');

      // Fetch active disputes
      const { data: disputes } = await supabase
        .from('provider_disputes')
        .select('id')
        .in('status', ['open', 'under_review'])
        .in('booking_id', bookings?.map(b => b.id) || []);

      // Calculate statistics
      const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;
      const currentMonth = new Date().getMonth();
      const monthlyEarnings = earnings?.filter(e => 
        new Date(e.created_at).getMonth() === currentMonth
      ).reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;

      const completedJobs = bookings?.filter(b => b.status === 'completed').length || 0;
      const averageRating = reviews?.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      setStats({
        totalEarnings,
        monthlyEarnings,
        totalJobs: bookings?.length || 0,
        completedJobs,
        averageRating,
        totalReviews: reviews?.length || 0,
        pendingBookings: pendingBookings?.length || 0,
        activeDisputes: disputes?.length || 0,
      });

      // Set recent bookings
      setRecentBookings(
        bookings?.slice(0, 5).map(booking => ({
          id: booking.id,
          customer_name: booking.customer_name,
          service_title: booking.services?.title || 'Unknown Service',
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          total_amount: booking.total_amount,
          status: booking.status,
        })) || []
      );

      // Calculate monthly earnings for chart
      const monthlyData: { [key: string]: number } = {};
      earnings?.forEach(earning => {
        const date = new Date(earning.created_at);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(earning.net_amount);
      });

      setEarningsData(
        Object.entries(monthlyData).map(([month, earnings]) => ({
          month,
          earnings,
        }))
      );

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
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
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.display_name || 'Provider'}! Here's your business overview.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">N${stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +N${stats.monthlyEarnings.toFixed(2)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedJobs}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.totalJobs} total jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                from {stats.totalReviews} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeDisputes > 0 && `${stats.activeDisputes} active disputes`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentBookings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No recent bookings</p>
                  ) : (
                    recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(booking.status)}
                            <span className="font-medium">{booking.service_title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {booking.customer_name} • {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusColor(booking.status) as any}>
                            {booking.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">N${booking.total_amount}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/bookings')}
                  >
                    View All Bookings
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Calendar className="w-6 h-6" />
                    <span className="text-sm">Manage Availability</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm">Customer Messages</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Award className="w-6 h-6" />
                    <span className="text-sm">Training Modules</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="bookings">
            <ProviderBookingManagement />
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Analytics</CardTitle>
                <CardDescription>Track your income and payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">N${stats.totalEarnings.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">N${stats.monthlyEarnings.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">This Month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        N${stats.totalEarnings > 0 ? (stats.totalEarnings / Math.max(stats.completedJobs, 1)).toFixed(2) : '0.00'}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg per Job</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>See what customers are saying about your services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {stats.averageRating.toFixed(1)} Average Rating
                  </h3>
                  <p className="text-muted-foreground">
                    Based on {stats.totalReviews} customer reviews
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>Update your professional profile and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Edit Profile Information
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    Manage Skills & Certifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Set Availability Hours
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Update Pricing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ProviderDashboard;