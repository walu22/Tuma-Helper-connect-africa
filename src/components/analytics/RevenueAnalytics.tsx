import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown
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
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer 
} from "recharts";

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageTransactionValue: number;
  totalTransactions: number;
  revenueGrowth: number;
  platformFees: number;
  payoutsPending: number;
  payoutsCompleted: number;
}

interface RevenueData {
  period: string;
  revenue: number;
  transactions: number;
  platformFees: number;
  netRevenue: number;
}

const RevenueAnalytics = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageTransactionValue: 0,
    totalTransactions: 0,
    revenueGrowth: 0,
    platformFees: 0,
    payoutsPending: 0,
    payoutsCompleted: 0
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [providerBreakdown, setProviderBreakdown] = useState<any[]>([]);
  const [timePeriod, setTimePeriod] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [timePeriod]);

  const fetchRevenueAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
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
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch earnings and bookings data
      const [
        { data: earnings },
        { data: bookings },
        { data: services },
        { data: profiles }
      ] = await Promise.all([
        supabase
          .from("provider_earnings")
          .select("*")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
        supabase
          .from("bookings")
          .select("*, services(*, service_categories(name))")
          .eq("status", "completed")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
        supabase.from("services").select("*, service_categories(name), provider_profiles(user_id)"),
        supabase.from("profiles").select("user_id, display_name").eq("role", "provider")
      ]);

      // Calculate metrics
      const totalRevenue = earnings?.reduce((sum, e) => sum + Number(e.gross_amount), 0) || 0;
      const platformFees = earnings?.reduce((sum, e) => sum + Number(e.platform_fee), 0) || 0;
      const netRevenue = totalRevenue - platformFees;
      const totalTransactions = earnings?.length || 0;
      const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Calculate monthly revenue for current month
      const currentMonth = new Date().getMonth();
      const monthlyRevenue = earnings?.filter(e => 
        new Date(e.created_at).getMonth() === currentMonth
      ).reduce((sum, e) => sum + Number(e.gross_amount), 0) || 0;

      // Calculate payouts
      const payoutsCompleted = earnings?.filter(e => e.payment_status === 'completed')
        .reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;
      const payoutsPending = earnings?.filter(e => e.payment_status === 'pending')
        .reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;

      // Calculate growth (comparing to previous period)
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const { data: previousEarnings } = await supabase
        .from("provider_earnings")
        .select("gross_amount")
        .gte("created_at", previousPeriodStart.toISOString())
        .lt("created_at", startDate.toISOString());

      const previousRevenue = previousEarnings?.reduce((sum, e) => sum + Number(e.gross_amount), 0) || 0;
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      setMetrics({
        totalRevenue,
        monthlyRevenue,
        averageTransactionValue,
        totalTransactions,
        revenueGrowth,
        platformFees,
        payoutsPending,
        payoutsCompleted
      });

      // Generate time series data
      const timeSeriesData = generateTimeSeriesData(earnings || [], timePeriod);
      setRevenueData(timeSeriesData);

      // Generate category breakdown
      const categoryRevenue = bookings?.reduce((acc: any, booking) => {
        const category = booking.services?.service_categories?.name || 'Other';
        acc[category] = (acc[category] || 0) + Number(booking.total_amount);
        return acc;
      }, {}) || {};

      setCategoryBreakdown(
        Object.entries(categoryRevenue)
          .map(([category, revenue]) => ({
            category,
            revenue: Number(revenue),
            percentage: ((Number(revenue) / totalRevenue) * 100).toFixed(1)
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)
      );

      // Generate top providers breakdown
      const providerRevenue = earnings?.reduce((acc: any, earning) => {
        acc[earning.provider_id] = (acc[earning.provider_id] || 0) + Number(earning.gross_amount);
        return acc;
      }, {}) || {};

      const topProviders = Object.entries(providerRevenue)
        .map(([providerId, revenue]) => {
          const provider = profiles?.find(p => p.user_id === providerId);
          return {
            providerId,
            name: provider?.display_name || 'Unknown Provider',
            revenue: Number(revenue),
            percentage: ((Number(revenue) / totalRevenue) * 100).toFixed(1)
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setProviderBreakdown(topProviders);

    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = (earnings: Record<string, unknown>[], period: string): RevenueData[] => {
    const groupBy = period === '7days' ? 'day' : period === '30days' ? 'day' : 'month';
    const grouped = earnings.reduce((acc: Record<string, { revenue: number; bookings: number; transactions: number; platformFees: number }>, earning) => {
      const date = new Date((earning as any).created_at);
      let key: string;
      
      if (groupBy === 'day') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short' });
      }
      
      if (!acc[key]) {
        acc[key] = { revenue: 0, bookings: 0, transactions: 0, platformFees: 0 };
      }
      
      acc[key].revenue += Number((earning as any).gross_amount);
      acc[key].transactions += 1;
      acc[key].platformFees += Number((earning as any).platform_fee);
      
      return acc;
    }, {});

    return Object.entries(grouped).map(([period, data]: [string, any]) => ({
      period,
      revenue: data.revenue,
      transactions: data.transactions,
      platformFees: data.platformFees,
      netRevenue: data.revenue - data.platformFees
    }));
  };

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))"
    },
    netRevenue: {
      label: "Net Revenue",
      color: "hsl(var(--secondary))"
    },
    platformFees: {
      label: "Platform Fees",
      color: "hsl(var(--accent))"
    },
    transactions: {
      label: "Transactions",
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
          <h2 className="text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-muted-foreground">Track financial performance and revenue trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">NAD {metrics.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {metrics.revenueGrowth > 0 ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${metrics.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Fees</p>
                <p className="text-2xl font-bold">NAD {metrics.platformFees.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((metrics.platformFees / Math.max(metrics.totalRevenue, 1)) * 100).toFixed(1)}% of revenue
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold">NAD {metrics.averageTransactionValue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.totalTransactions} transactions
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold">NAD {metrics.payoutsPending.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed: NAD {metrics.payoutsCompleted.toLocaleString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stackId="1" 
                stroke="var(--color-revenue)" 
                fill="var(--color-revenue)" 
                fillOpacity={0.8}
              />
              <Area 
                type="monotone" 
                dataKey="platformFees" 
                stackId="1" 
                stroke="var(--color-platformFees)" 
                fill="var(--color-platformFees)" 
                fillOpacity={0.8}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Breakdown Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">NAD {category.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Earning Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providerBreakdown.map((provider, index) => (
                <div key={provider.providerId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">NAD {provider.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{provider.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueAnalytics;