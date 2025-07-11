import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Award,
  Eye,
  Activity
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessIntelligenceDashboard from "@/components/analytics/BusinessIntelligenceDashboard";
import RevenueAnalytics from "@/components/analytics/RevenueAnalytics";
import UserBehaviorTracking from "@/components/analytics/UserBehaviorTracking";
import ConversionFunnelAnalysis from "@/components/analytics/ConversionFunnelAnalysis";
import ProviderPerformanceMetrics from "@/components/analytics/ProviderPerformanceMetrics";
import { useAuth } from "@/hooks/useAuth";

const AdvancedAnalytics = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("business-intelligence");

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground">
                  Admin privileges required to access Advanced Analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const analyticsFeatures = [
    {
      id: "business-intelligence",
      title: "Business Intelligence",
      description: "Comprehensive business overview with key metrics and insights",
      icon: <BarChart3 className="h-5 w-5" />,
      badge: "Core",
      implemented: true
    },
    {
      id: "revenue-analytics",
      title: "Revenue Analytics",
      description: "Detailed financial analysis with revenue trends and breakdowns",
      icon: <TrendingUp className="h-5 w-5" />,
      badge: "Financial",
      implemented: true
    },
    {
      id: "user-behavior",
      title: "User Behavior Tracking",
      description: "Track user interactions, engagement patterns, and platform usage",
      icon: <Users className="h-5 w-5" />,
      badge: "Behavioral",
      implemented: true
    },
    {
      id: "conversion-funnel",
      title: "Conversion Funnel",
      description: "Analyze user journey and conversion optimization opportunities",
      icon: <Target className="h-5 w-5" />,
      badge: "Conversion",
      implemented: true
    },
    {
      id: "provider-performance",
      title: "Provider Performance",
      description: "Detailed provider analytics, rankings, and performance metrics",
      icon: <Award className="h-5 w-5" />,
      badge: "Performance",
      implemented: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Comprehensive data insights and business intelligence for your marketplace platform
          </p>
        </div>

        {/* Analytics Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {analyticsFeatures.map((feature) => (
            <Card 
              key={feature.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeTab === feature.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setActiveTab(feature.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-primary">{feature.icon}</div>
                  <Badge variant={feature.implemented ? "default" : "secondary"} className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <h3 className="font-medium text-sm leading-tight mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="business-intelligence" className="text-xs">
              BI Dashboard
            </TabsTrigger>
            <TabsTrigger value="revenue-analytics" className="text-xs">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="user-behavior" className="text-xs">
              User Behavior
            </TabsTrigger>
            <TabsTrigger value="conversion-funnel" className="text-xs">
              Conversion
            </TabsTrigger>
            <TabsTrigger value="provider-performance" className="text-xs">
              Providers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business-intelligence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Business Intelligence Dashboard
                </CardTitle>
                <CardDescription>
                  Complete overview of your marketplace performance with key metrics, trends, and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessIntelligenceDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue-analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>
                  Detailed financial analysis with revenue trends, platform fees, and earnings breakdowns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Behavior Analytics
                </CardTitle>
                <CardDescription>
                  Track user interactions, engagement patterns, device usage, and platform behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserBehaviorTracking />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion-funnel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Conversion Funnel Analysis
                </CardTitle>
                <CardDescription>
                  Analyze user journey from landing to booking completion and identify optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionFunnelAnalysis />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="provider-performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Provider Performance Metrics
                </CardTitle>
                <CardDescription>
                  Comprehensive provider analytics including rankings, performance scores, and category analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProviderPerformanceMetrics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdvancedAnalytics;