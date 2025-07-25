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
  XCircle,
  Eye,
  Target,
  Zap,
  Bell,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer 
} from "recharts";

interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number;
  completionRate: number;
  repeatCustomers: number;
  cancellationRate: number;
  profileViews: number;
  conversionRate: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'review' | 'message' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
}

const EnhancedProviderDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('30days');
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    averageRating: 0,
    totalReviews: 0,
    responseTime: 0,
    completionRate: 0,
    repeatCustomers: 0,
    cancellationRate: 0,
    profileViews: 0,
    conversionRate: 0
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [bookingTrends, setBookingTrends] = useState<any[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== 'provider') {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [user, profile, navigate, timePeriod]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Calculate date ranges
      const endDate = new Date();
      const startDate = new Date();
      const weekStartDate = new Date();
      
      switch (timePeriod) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }
      weekStartDate.setDate(endDate.getDate() - 7);

      // Fetch all data in parallel
      const [
        { data: earnings },
        { data: bookings },
        { data: reviews },
        { data: providerProfile },
        { data: messages }
      ] = await Promise.all([
        supabase
          .from('provider_earnings')
          .select('*')
          .eq('provider_id', user.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('bookings')
          .select(`
            *,
            services (title),
            profiles!bookings_customer_id_fkey (display_name)
          `)
          .eq('provider_id', user.id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('provider_reviews')
          .select('*')
          .eq('provider_id', user.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('messages')
          .select('*')
          .eq('receiver_id', user.id)
          .gte('created_at', startDate.toISOString())
      ]);

      // Calculate statistics
      const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;
      const monthlyEarnings = earnings?.filter(e => 
        new Date(e.created_at).getMonth() === new Date().getMonth()
      ).reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;
      const weeklyEarnings = earnings?.filter(e => 
        new Date(e.created_at) >= weekStartDate
      ).reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;

      const totalJobs = bookings?.length || 0;
      const completedJobs = bookings?.filter(b => b.status === 'completed').length || 0;
      const pendingJobs = bookings?.filter(b => b.status === 'pending').length || 0;
      const cancelledJobs = bookings?.filter(b => b.status === 'cancelled').length || 0;
      
      const averageRating = reviews?.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      const totalReviews = reviews?.length || 0;
      
      const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
      const cancellationRate = totalJobs > 0 ? (cancelledJobs / totalJobs) * 100 : 0;
      
      // Calculate repeat customers
      const customerIds = bookings?.map(b => b.customer_id) || [];
      const uniqueCustomers = new Set(customerIds).size;
      const repeatCustomers = customerIds.length - uniqueCustomers;

      // Mock some metrics that would require more complex queries
      const profileViews = Math.floor(Math.random() * 100) + 50;
      const conversionRate = profileViews > 0 ? (totalJobs / profileViews) * 100 : 0;
      const responseTime = Math.floor(Math.random() * 60) + 15; // minutes

      setStats({
        totalEarnings,
        monthlyEarnings,
        weeklyEarnings,
        totalJobs,
        completedJobs,
        pendingJobs,
        averageRating,
        totalReviews,
        responseTime,
        completionRate,
        repeatCustomers,
        cancellationRate,
        profileViews,
        conversionRate
      });

      // Set availability from provider profile
      setIsAvailable(providerProfile?.is_available || true);

      // Calculate performance metrics
      const metrics: PerformanceMetric[] = [
        {
          name: "Completion Rate",
          value: completionRate,
          target: 95,
          trend: completionRate >= 95 ? 'up' : 'down',
          change: Math.random() * 10 - 5
        },
        {
          name: "Response Time",
          value: responseTime,
          target: 30,
          trend: responseTime <= 30 ? 'up' : 'down',
          change: Math.random() * 10 - 5
        },
        {
          name: "Customer Rating",
          value: averageRating,
          target: 4.5,
          trend: averageRating >= 4.5 ? 'up' : 'down',
          change: Math.random() * 0.5 - 0.25
        },
        {
          name: "Conversion Rate",
          value: conversionRate,
          target: 15,
          trend: conversionRate >= 15 ? 'up' : 'down',
          change: Math.random() * 5 - 2.5
        }
      ];
      setPerformanceMetrics(metrics);

      // Generate recent activity
      const activities: RecentActivity[] = [
        ...bookings?.slice(0, 3).map(booking => ({
          id: booking.id,
          type: 'booking' as const,
          title: `New booking: ${booking.services?.title}`,
          description: `From ${booking.profiles?.display_name || 'Customer'}`,
          timestamp: booking.created_at,
          status: booking.status,
          amount: booking.total_amount
        })) || [],
        ...reviews?.slice(0, 2).map(review => ({
          id: review.id,
          type: 'review' as const,
          title: `New ${review.rating}-star review`,
          description: review.review_text?.slice(0, 50) + '...' || 'No comment',
          timestamp: review.created_at
        })) || [],
        ...messages?.slice(0, 2).map(message => ({
          id: message.id,
          type: 'message' as const,
          title: 'New message',
          description: message.message_text.slice(0, 50) + '...',
          timestamp: message.created_at
        })) || []
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

      setRecentActivity(activities);

      // Generate chart data
      const earningsChartData = generateEarningsData(earnings || [], timePeriod);
      setEarningsData(earningsChartData);

      const bookingChartData = generateBookingTrends(bookings || [], timePeriod);
      setBookingTrends(bookingChartData);

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

  const generateEarningsData = (earnings: any[], period: string) => {
    const groupBy = period === '7days' ? 'day' : 'week';
    const grouped = earnings.reduce((acc: any, earning) => {
      const date = new Date(earning.created_at);
      let key: string;
      
      if (groupBy === 'day') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      if (!acc[key]) {
        acc[key] = { earnings: 0, jobs: 0 };
      }
      
      acc[key].earnings += Number(earning.net_amount);
      acc[key].jobs += 1;
      
      return acc;
    }, {});

    return Object.entries(grouped).map(([period, data]: [string, any]) => ({
      period,
      earnings: data.earnings,
      jobs: data.jobs
    }));
  };

  const generateBookingTrends = (bookings: any[], period: string) => {
    const groupBy = period === '7days' ? 'day' : 'week';
    const grouped = bookings.reduce((acc: any, booking) => {
      const date = new Date(booking.created_at);
      let key: string;
      
      if (groupBy === 'day') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      if (!acc[key]) {
        acc[key] = { total: 0, completed: 0, cancelled: 0 };
      }
      
      acc[key].total += 1;
      if (booking.status === 'completed') acc[key].completed += 1;
      if (booking.status === 'cancelled') acc[key].cancelled += 1;
      
      return acc;
    }, {});

    return Object.entries(grouped).map(([period, data]: [string, any]) => ({
      period,
      total: data.total,
      completed: data.completed,
      cancelled: data.cancelled
    }));
  };

  const toggleAvailability = async () => {
    try {
      const { error } = await supabase
        .from('provider_profiles')
        .update({ is_available: !isAvailable })
        .eq('user_id', user?.id);

      if (error) throw error;

      setIsAvailable(!isAvailable);
      toast({
        title: "Availability updated",
        description: `You are now ${!isAvailable ? 'available' : 'unavailable'} for new bookings.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating availability",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'message': return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const chartConfig = {
    earnings: {
      label: "Earnings",
      color: "hsl(var(--primary))"
    },
    jobs: {
      label: "Jobs",
      color: "hsl(var(--secondary))"
    },
    total: {
      label: "Total Bookings",
      color: "hsl(var(--primary))"
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--secondary))"
    },
    cancelled: {
      label: "Cancelled",
      color: "hsl(var(--destructive))"
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header with Availability Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.display_name || 'Provider'}! Here's your business overview.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="availability"
              checked={isAvailable}
              onCheckedChange={toggleAvailability}
            />
            <Label htmlFor="availability" className="text-sm font-medium">
              {isAvailable ? 'Available' : 'Unavailable'}
            </Label>
          </div>
          
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">NAD {stats.totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  +NAD {stats.weeklyEarnings.toLocaleString()} this week
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Jobs Completed</p>
                <p className="text-2xl font-bold">{stats.completedJobs}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completionRate.toFixed(1)}% completion rate
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  from {stats.totalReviews} reviews
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Jobs</p>
                <p className="text-2xl font-bold">{stats.pendingJobs}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg response: {stats.responseTime}min
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <div className="flex items-center gap-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{metric.value.toFixed(1)}{metric.name.includes('Rate') ? '%' : metric.name.includes('Time') ? 'min' : ''}</span>
                    <span className="text-muted-foreground">Target: {metric.target}{metric.name.includes('Rate') ? '%' : metric.name.includes('Time') ? 'min' : ''}</span>
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className={`h-2 ${metric.value >= metric.target ? 'bg-green-100' : 'bg-red-100'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Earnings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <AreaChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="var(--color-earnings)" 
                  fill="var(--color-earnings)" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Booking Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Booking Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="total" fill="var(--color-total)" />
                <Bar dataKey="completed" fill="var(--color-completed)" />
                <Bar dataKey="cancelled" fill="var(--color-cancelled)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <div className="flex items-center gap-2">
                        {activity.status && (
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        )}
                        {activity.amount && (
                          <span className="text-sm font-medium text-green-600">
                            NAD {activity.amount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/provider/profile')}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/services')}>
              <FileText className="w-4 h-4 mr-2" />
              Manage Services
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/bookings')}>
              <Calendar className="w-4 h-4 mr-2" />
              View Bookings
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/messages')}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/training')}>
              <Award className="w-4 h-4 mr-2" />
              Training Center
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recommendations */}
      {(stats.pendingJobs > 5 || stats.averageRating < 4.0 || stats.cancellationRate > 10) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingJobs > 5 && (
              <div className="flex items-center gap-2 text-orange-700">
                <Clock className="h-4 w-4" />
                <span className="text-sm">You have {stats.pendingJobs} pending bookings. Respond quickly to improve your rating!</span>
              </div>
            )}
            {stats.averageRating < 4.0 && (
              <div className="flex items-center gap-2 text-orange-700">
                <Star className="h-4 w-4" />
                <span className="text-sm">Your rating is below 4.0. Consider improving service quality or asking satisfied customers for reviews.</span>
              </div>
            )}
            {stats.cancellationRate > 10 && (
              <div className="flex items-center gap-2 text-orange-700">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">High cancellation rate detected. Review your booking policies and availability settings.</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedProviderDashboard;