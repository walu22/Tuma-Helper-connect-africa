import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  MousePointer,
  Eye,
  Clock,
  TrendingUp,
  Search,
  ShoppingCart,
  Star,
  MapPin,
  Smartphone,
  Monitor,
  Globe
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
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer 
} from "recharts";

interface BehaviorMetrics {
  totalUsers: number;
  activeUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
  pageViews: number;
  uniquePageViews: number;
  searchQueries: number;
  bookingStarted: number;
  bookingCompleted: number;
  conversionRate: number;
}

interface DeviceStats {
  device: string;
  users: number;
  percentage: number;
}

interface PopularPages {
  page: string;
  views: number;
  avgTimeOnPage: number;
}

interface UserJourney {
  step: string;
  users: number;
  dropoffRate: number;
}

const UserBehaviorTracking = () => {
  const [metrics, setMetrics] = useState<BehaviorMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    pageViews: 0,
    uniquePageViews: 0,
    searchQueries: 0,
    bookingStarted: 0,
    bookingCompleted: 0,
    conversionRate: 0
  });
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [popularPages, setPopularPages] = useState<PopularPages[]>([]);
  const [userJourney, setUserJourney] = useState<UserJourney[]>([]);
  const [searchData, setSearchData] = useState<any[]>([]);
  const [timePeriod, setTimePeriod] = useState('7days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBehaviorData();
  }, [timePeriod]);

  const fetchBehaviorData = async () => {
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

      // Fetch user behavior data (using available tables as proxies)
      const [
        { data: users },
        { data: searchHistory },
        { data: bookings },
        { data: favorites }
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("search_history")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("bookings")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("customer_favorites")
          .select("*")
          .gte("created_at", startDate.toISOString())
      ]);

      // Calculate basic metrics
      const totalUsers = users?.length || 0;
      const activeUsers = Math.floor(totalUsers * 0.7); // Mock active users
      const searchQueries = searchHistory?.length || 0;
      const bookingStarted = bookings?.length || 0;
      const bookingCompleted = bookings?.filter(b => b.status === 'completed').length || 0;
      const conversionRate = bookingStarted > 0 ? (bookingCompleted / bookingStarted) * 100 : 0;

      setMetrics({
        totalUsers,
        activeUsers,
        avgSessionDuration: 285, // Mock data - seconds
        bounceRate: 35.2, // Mock data - percentage
        pageViews: totalUsers * 8, // Mock calculation
        uniquePageViews: totalUsers * 5, // Mock calculation
        searchQueries,
        bookingStarted,
        bookingCompleted,
        conversionRate
      });

      // Generate device stats (mock data based on industry standards)
      setDeviceStats([
        { device: 'Mobile', users: Math.floor(totalUsers * 0.65), percentage: 65 },
        { device: 'Desktop', users: Math.floor(totalUsers * 0.25), percentage: 25 },
        { device: 'Tablet', users: Math.floor(totalUsers * 0.10), percentage: 10 }
      ]);

      // Generate popular pages (mock data)
      setPopularPages([
        { page: 'Home', views: Math.floor(totalUsers * 2.5), avgTimeOnPage: 120 },
        { page: 'Services', views: Math.floor(totalUsers * 1.8), avgTimeOnPage: 180 },
        { page: 'Provider Profiles', views: Math.floor(totalUsers * 1.5), avgTimeOnPage: 150 },
        { page: 'Booking Form', views: Math.floor(totalUsers * 0.8), avgTimeOnPage: 240 },
        { page: 'Search Results', views: Math.floor(totalUsers * 1.2), avgTimeOnPage: 90 }
      ]);

      // Generate user journey funnel
      const journeySteps = [
        { step: 'Homepage Visit', users: totalUsers, dropoffRate: 0 },
        { step: 'Service Browse', users: Math.floor(totalUsers * 0.8), dropoffRate: 20 },
        { step: 'Provider View', users: Math.floor(totalUsers * 0.6), dropoffRate: 25 },
        { step: 'Booking Started', users: bookingStarted, dropoffRate: 33 },
        { step: 'Booking Completed', users: bookingCompleted, dropoffRate: (bookingStarted - bookingCompleted) / Math.max(bookingStarted, 1) * 100 }
      ];
      setUserJourney(journeySteps);

      // Generate search trend data
      const searchTrends = generateSearchTrends(searchHistory || []);
      setSearchData(searchTrends);

    } catch (error) {
      console.error("Error fetching behavior data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSearchTrends = (searchHistory: any[]) => {
    const dailySearches = searchHistory.reduce((acc: any, search) => {
      const date = new Date(search.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dailySearches).map(([date, searches]) => ({
      date,
      searches: Number(searches),
      clickthrough: Math.floor(Number(searches) * 0.3) // Mock clickthrough data
    }));
  };

  const chartConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--primary))"
    },
    searches: {
      label: "Searches",
      color: "hsl(var(--secondary))"
    },
    clickthrough: {
      label: "Click-through",
      color: "hsl(var(--accent))"
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

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
          <h2 className="text-2xl font-bold">User Behavior Analytics</h2>
          <p className="text-muted-foreground">Track how users interact with your platform</p>
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

      {/* Key Behavior Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((metrics.activeUsers / Math.max(metrics.totalUsers, 1)) * 100).toFixed(1)}% of total
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold">{Math.floor(metrics.avgSessionDuration / 60)}m {metrics.avgSessionDuration % 60}s</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.pageViews.toLocaleString()} page views
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-bold">{metrics.bounceRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.searchQueries} searches
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.bookingCompleted} of {metrics.bookingStarted} bookings
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Behavior Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Behavior Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <LineChart data={searchData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="searches" stroke="var(--color-searches)" strokeWidth={3} />
              <Line type="monotone" dataKey="clickthrough" stroke="var(--color-clickthrough)" strokeWidth={3} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Journey Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Journey Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userJourney.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{step.step}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{step.users.toLocaleString()}</p>
                      {step.dropoffRate > 0 && (
                        <p className="text-xs text-red-500">-{step.dropoffRate.toFixed(1)}%</p>
                      )}
                    </div>
                  </div>
                  {index < userJourney.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="w-px h-4 bg-border"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie
                    data={deviceStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="users"
                    label={({ device, percentage }) => `${device}: ${percentage}%`}
                  >
                    {deviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </RechartsPie>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                {deviceStats.map((device, index) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{device.users.toLocaleString()}</span>
                      <p className="text-xs text-muted-foreground">{device.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Most Visited Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <span className="font-medium">{page.page}</span>
                    <p className="text-xs text-muted-foreground">
                      Avg time: {Math.floor(page.avgTimeOnPage / 60)}m {page.avgTimeOnPage % 60}s
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{page.views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">page views</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserBehaviorTracking;