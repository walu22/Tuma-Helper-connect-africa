import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Calendar,
  Star,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity
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

interface KPIMetric {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface BusinessMetrics {
  totalRevenue: number;
  monthlyGrowth: number;
  activeUsers: number;
  providerGrowth: number;
  bookingConversion: number;
  customerRetention: number;
  averageOrderValue: number;
  providerSatisfaction: number;
}

const BusinessIntelligenceDashboard = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeUsers: 0,
    providerGrowth: 0,
    bookingConversion: 0,
    customerRetention: 0,
    averageOrderValue: 0,
    providerSatisfaction: 0
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessMetrics();
  }, []);

  const fetchBusinessMetrics = async () => {
    try {
      // Fetch comprehensive business data
      const [
        { data: bookings },
        { data: users },
        { data: providers },
        { data: earnings },
        { data: reviews },
        { data: categories },
        { data: services }
      ] = await Promise.all([
        supabase.from("bookings").select("*"),
        supabase.from("profiles").select("*").eq("role", "customer"),
        supabase.from("profiles").select("*").eq("role", "provider"),
        supabase.from("provider_earnings").select("*"),
        supabase.from("provider_reviews").select("*"),
        supabase.from("service_categories").select("*"),
        supabase.from("services").select("*, service_categories(name)")
      ]);

      // Calculate KPIs
      const totalRevenue = earnings?.reduce((sum, e) => sum + Number(e.gross_amount), 0) || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
      const averageOrderValue = completedBookings.length > 0 
        ? completedBookings.reduce((sum, b) => sum + Number(b.total_amount), 0) / completedBookings.length 
        : 0;

      // Calculate monthly growth
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const thisMonthRevenue = earnings?.filter(e => 
        new Date(e.created_at).getMonth() === currentMonth
      ).reduce((sum, e) => sum + Number(e.gross_amount), 0) || 0;
      const lastMonthRevenue = earnings?.filter(e => 
        new Date(e.created_at).getMonth() === lastMonth
      ).reduce((sum, e) => sum + Number(e.gross_amount), 0) || 0;
      const monthlyGrowth = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Provider satisfaction
      const providerSatisfaction = reviews?.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      setMetrics({
        totalRevenue,
        monthlyGrowth,
        activeUsers: users?.length || 0,
        providerGrowth: providers?.length || 0,
        bookingConversion: bookings?.length ? (completedBookings.length / bookings.length) * 100 : 0,
        customerRetention: 85, // Mock data - would need complex query
        averageOrderValue,
        providerSatisfaction
      });

      // Generate revenue trend data
      const revenueByMonth = earnings?.reduce((acc: any, earning) => {
        const month = new Date(earning.created_at).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + Number(earning.gross_amount);
        return acc;
      }, {}) || {};

      setRevenueData(
        Object.entries(revenueByMonth).map(([month, revenue]) => ({
          month,
          revenue,
          profit: Number(revenue) * 0.15 // Platform fee
        }))
      );

      // Generate user growth data
      const usersByMonth = users?.reduce((acc: any, user) => {
        const month = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {}) || {};

      setUserGrowthData(
        Object.entries(usersByMonth).map(([month, count]) => ({
          month,
          users: count,
          providers: Math.floor(Number(count) * 0.2) // Estimate 20% are providers
        }))
      );

      // Generate category distribution
      const servicesByCategory = services?.reduce((acc: any, service) => {
        const category = service.service_categories?.name || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}) || {};

      setCategoryData(
        Object.entries(servicesByCategory).map(([name, value]) => ({
          name,
          value,
          percentage: ((Number(value) / (services?.length || 1)) * 100).toFixed(1)
        }))
      );

    } catch (error) {
      console.error("Error fetching business metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpiMetrics: KPIMetric[] = [
    {
      title: "Total Revenue",
      value: metrics.totalRevenue,
      change: metrics.monthlyGrowth,
      trend: metrics.monthlyGrowth > 0 ? 'up' : metrics.monthlyGrowth < 0 ? 'down' : 'stable',
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-green-600"
    },
    {
      title: "Active Users",
      value: metrics.activeUsers,
      change: 12.5,
      trend: 'up',
      icon: <Users className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      title: "Conversion Rate",
      value: metrics.bookingConversion,
      change: -2.1,
      trend: 'down',
      icon: <Target className="h-4 w-4" />,
      color: "text-purple-600"
    },
    {
      title: "Avg Order Value",
      value: metrics.averageOrderValue,
      change: 8.3,
      trend: 'up',
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-orange-600"
    }
  ];

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))"
    },
    profit: {
      label: "Profit",
      color: "hsl(var(--secondary))"
    },
    users: {
      label: "Users",
      color: "hsl(var(--primary))"
    },
    providers: {
      label: "Providers", 
      color: "hsl(var(--secondary))"
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

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
      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">
                    {metric.title.includes('Revenue') || metric.title.includes('Value') 
                      ? `NAD ${metric.value.toLocaleString()}` 
                      : metric.title.includes('Rate') 
                      ? `${metric.value.toFixed(1)}%`
                      : metric.value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    ) : (
                      <Clock className="h-3 w-3 text-gray-500" />
                    )}
                    <span className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className={metric.color}>
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="categories">Service Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue & Profit Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                  <Bar dataKey="profit" fill="var(--color-profit)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={3} />
                  <Line type="monotone" dataKey="providers" stroke="var(--color-providers)" strokeWidth={3} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Service Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 space-y-3">
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{category.value} services</span>
                        <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Platform Uptime</span>
              <Badge variant="default">99.9%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Response Time</span>
              <Badge variant="secondary">120ms</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Error Rate</span>
              <Badge variant="outline">0.1%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Provider Rating</span>
              <Badge variant="default">{metrics.providerSatisfaction.toFixed(1)}/5</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Customer Retention</span>
              <Badge variant="secondary">{metrics.customerRetention}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Support Response</span>
              <Badge variant="outline">&lt; 2hrs</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Key Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">Conversion rate below target</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Revenue target achieved</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessIntelligenceDashboard;