import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer 
} from "recharts";

interface ProviderMetrics {
  providerId: string;
  name: string;
  avatar?: string;
  totalEarnings: number;
  totalJobs: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number;
  repeatCustomers: number;
  cancellationRate: number;
  monthlyGrowth: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface PerformanceCategory {
  category: string;
  score: number;
  benchmark: number;
}

const ProviderPerformanceMetrics = () => {
  const [providers, setProviders] = useState<ProviderMetrics[]>([]);
  const [topPerformers, setTopPerformers] = useState<ProviderMetrics[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<PerformanceCategory[]>([]);
  const [sortBy, setSortBy] = useState('earnings');
  const [timePeriod, setTimePeriod] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderMetrics();
  }, [sortBy, timePeriod]);

  const fetchProviderMetrics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
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

      // Fetch provider data
      const [
        { data: providerProfiles },
        { data: profiles },
        { data: earnings },
        { data: bookings },
        { data: reviews },
        { data: services }
      ] = await Promise.all([
        supabase.from("provider_profiles").select("*"),
        supabase.from("profiles").select("*").eq("role", "provider"),
        supabase
          .from("provider_earnings")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("bookings")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("provider_reviews")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase.from("services").select("*, service_categories(name)")
      ]);

      // Process provider metrics
      const providerMetrics = profiles?.map(profile => {
        const providerProfile = providerProfiles?.find(pp => pp.user_id === profile.user_id);
        const providerEarnings = earnings?.filter(e => e.provider_id === profile.user_id) || [];
        const providerBookings = bookings?.filter(b => b.provider_id === profile.user_id) || [];
        const providerReviews = reviews?.filter(r => r.provider_id === profile.user_id) || [];

        const totalEarnings = providerEarnings.reduce((sum, e) => sum + Number(e.net_amount), 0);
        const totalJobs = providerBookings.length;
        const completedJobs = providerBookings.filter(b => b.status === 'completed').length;
        const cancelledJobs = providerBookings.filter(b => b.status === 'cancelled').length;
        const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
        const cancellationRate = totalJobs > 0 ? (cancelledJobs / totalJobs) * 100 : 0;
        const averageRating = providerReviews.length > 0 
          ? providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length 
          : 0;

        // Calculate repeat customers
        const customerIds = providerBookings.map(b => b.customer_id);
        const uniqueCustomers = new Set(customerIds).size;
        const repeatCustomers = customerIds.length - uniqueCustomers;

        // Mock previous period data for growth calculation
        const previousPeriodEarnings = totalEarnings * (0.8 + Math.random() * 0.4); // Mock data
        const monthlyGrowth = previousPeriodEarnings > 0 
          ? ((totalEarnings - previousPeriodEarnings) / previousPeriodEarnings) * 100 
          : 0;

        return {
          providerId: profile.user_id,
          name: profile.display_name || profile.full_name || 'Unknown Provider',
          avatar: profile.avatar_url,
          totalEarnings,
          totalJobs,
          completionRate,
          averageRating,
          totalReviews: providerReviews.length,
          responseTime: Math.floor(Math.random() * 180) + 30, // Mock response time in minutes
          repeatCustomers,
          cancellationRate,
          monthlyGrowth,
          lastActive: profile.updated_at,
          status: providerProfile?.is_available ? 'active' : 'inactive'
        } as ProviderMetrics;
      }) || [];

      // Sort providers based on selected criteria
      const sortedProviders = [...providerMetrics].sort((a, b) => {
        switch (sortBy) {
          case 'earnings':
            return b.totalEarnings - a.totalEarnings;
          case 'rating':
            return b.averageRating - a.averageRating;
          case 'jobs':
            return b.totalJobs - a.totalJobs;
          case 'completion':
            return b.completionRate - a.completionRate;
          default:
            return b.totalEarnings - a.totalEarnings;
        }
      });

      setProviders(sortedProviders);
      setTopPerformers(sortedProviders.slice(0, 5));

      // Generate performance trends data
      const performanceTrends = generatePerformanceTrends(sortedProviders.slice(0, 10));
      setPerformanceData(performanceTrends);

      // Generate category performance analysis
      const categoryAnalysis = analyzeCategoryPerformance(services || [], bookings || []);
      setCategoryPerformance(categoryAnalysis);

    } catch (error) {
      console.error("Error fetching provider metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceTrends = (topProviders: ProviderMetrics[]) => {
    return topProviders.map(provider => ({
      name: provider.name.split(' ')[0], // First name only for chart
      earnings: provider.totalEarnings,
      rating: provider.averageRating * 20, // Scale to 0-100 for better visualization
      completion: provider.completionRate,
      jobs: provider.totalJobs * 10 // Scale for visualization
    }));
  };

  const analyzeCategoryPerformance = (services: any[], bookings: any[]) => {
    const categoryStats = services.reduce((acc: any, service) => {
      const category = service.service_categories?.name || 'Other';
      const serviceBookings = bookings.filter(b => b.service_id === service.id);
      const completedBookings = serviceBookings.filter(b => b.status === 'completed');
      
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0 };
      }
      
      acc[category].total += serviceBookings.length;
      acc[category].completed += completedBookings.length;
      
      return acc;
    }, {});

    return Object.entries(categoryStats).map(([category, stats]: [string, any]) => ({
      category,
      score: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      benchmark: 85 // Industry benchmark
    }));
  };

  const getPerformanceLevel = (provider: ProviderMetrics) => {
    const score = (
      (provider.averageRating / 5) * 0.3 +
      (provider.completionRate / 100) * 0.3 +
      (Math.min(provider.totalJobs, 50) / 50) * 0.2 +
      (Math.max(0, 100 - provider.cancellationRate) / 100) * 0.2
    ) * 100;

    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', badge: 'default' };
    if (score >= 65) return { level: 'Good', color: 'text-blue-600', badge: 'secondary' };
    if (score >= 50) return { level: 'Average', color: 'text-yellow-600', badge: 'outline' };
    return { level: 'Needs Improvement', color: 'text-red-600', badge: 'destructive' };
  };

  const chartConfig = {
    earnings: {
      label: "Earnings",
      color: "hsl(var(--primary))"
    },
    rating: {
      label: "Rating Score",
      color: "hsl(var(--secondary))"
    },
    completion: {
      label: "Completion Rate",
      color: "hsl(var(--accent))"
    },
    jobs: {
      label: "Job Volume",
      color: "hsl(var(--muted-foreground))"
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Provider Performance Metrics</h2>
          <p className="text-muted-foreground">Track and analyze provider performance across key metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="earnings">Earnings</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="jobs">Job Count</SelectItem>
              <SelectItem value="completion">Completion</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Top Performers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {topPerformers.map((provider, index) => {
          const performance = getPerformanceLevel(provider);
          return (
            <Card key={provider.providerId}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={provider.avatar} />
                      <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -top-1 -right-1 w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{provider.name}</p>
                    <Badge variant={performance.badge as any} className="text-xs">
                      {performance.level}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Earnings:</span>
                    <span className="font-medium">NAD {provider.totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{provider.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jobs:</span>
                    <span className="font-medium">{provider.totalJobs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Performers Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="earnings" fill="var(--color-earnings)" />
              <Bar dataKey="rating" fill="var(--color-rating)" />
              <Bar dataKey="completion" fill="var(--color-completion)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPerformance.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className={category.score >= category.benchmark ? 'text-green-600' : 'text-red-600'}>
                      {category.score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full">
                    <div 
                      className={`absolute left-0 top-0 h-full rounded-full ${
                        category.score >= category.benchmark ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(category.score, 100)}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 w-px h-full bg-gray-400"
                      style={{ left: `${category.benchmark}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>Benchmark: {category.benchmark}%</span>
                    <span>100%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Provider Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Provider Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {providers.filter(p => p.status === 'active').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {providers.filter(p => p.status === 'inactive').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {providers.filter(p => p.status === 'suspended').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                </div>
              </div>

              {/* Performance Alerts */}
              <div className="space-y-2">
                <h4 className="font-medium">Performance Alerts</h4>
                {providers
                  .filter(p => p.cancellationRate > 15 || p.averageRating < 3.5)
                  .slice(0, 3)
                  .map(provider => (
                    <div key={provider.providerId} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">
                        {provider.name}: {provider.cancellationRate > 15 ? 'High cancellation rate' : 'Low rating'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Provider List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            All Providers Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.slice(0, 20).map((provider) => {
              const performance = getPerformanceLevel(provider);
              return (
                <div key={provider.providerId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={provider.avatar} />
                      <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {provider.totalJobs} jobs • {provider.totalReviews} reviews
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium">NAD {provider.totalEarnings.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Earnings</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{provider.averageRating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{provider.completionRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Completion</p>
                    </div>
                    <Badge variant={performance.badge as any}>
                      {performance.level}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderPerformanceMetrics;