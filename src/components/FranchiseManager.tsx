import { useState, useEffect } from "react";
import { Store, MapPin, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Franchise {
  id: string;
  franchise_name: string;
  city_id: string;
  franchise_fee: number;
  royalty_rate: number;
  marketing_fee_rate: number;
  contract_start: string;
  contract_end: string;
  performance_metrics: Record<string, unknown>;
  is_active: boolean;
  cities?: {
    name: string;
    region: string;
  };
}

export const FranchiseManager = () => {
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFranchiseData();
    }
  }, [user]);

  const fetchFranchiseData = async () => {
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select(`
          *,
          cities (
            name,
            region
          )
        `)
        .eq('franchisee_id', user?.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setFranchise(data as any);
    } catch (error) {
      console.error('Error fetching franchise data:', error);
      toast({
        title: "Error",
        description: "Failed to load franchise data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Franchise Dashboard
            </CardTitle>
            <CardDescription>
              You don't have an active franchise. Contact support to learn about franchise opportunities.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const contractDaysRemaining = Math.ceil(
    (new Date(franchise.contract_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const performanceData = franchise.performance_metrics || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{franchise.franchise_name}</h1>
        <Badge variant={franchise.is_active ? "default" : "secondary"}>
          {franchise.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="territory">Territory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Location</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{franchise.cities?.name}</div>
                <p className="text-xs text-muted-foreground">{franchise.cities?.region}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contract Remaining</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contractDaysRemaining}</div>
                <p className="text-xs text-muted-foreground">days left</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Royalty Rate</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{franchise.royalty_rate}%</div>
                <p className="text-xs text-muted-foreground">of gross revenue</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Franchise Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Franchise Fee</label>
                  <p className="text-lg font-semibold">N${franchise.franchise_fee}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Marketing Fee</label>
                  <p className="text-lg font-semibold">{franchise.marketing_fee_rate}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract Start</label>
                  <p className="text-lg font-semibold">
                    {new Date(franchise.contract_start).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract End</label>
                  <p className="text-lg font-semibold">
                    {new Date(franchise.contract_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Revenue Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current: N${(performanceData as any)?.monthly_revenue || 0}</span>
                    <span>Target: N${(performanceData as any)?.monthly_target || 50000}</span>
                  </div>
                  <Progress 
                    value={((performanceData as any)?.monthly_revenue || 0) / ((performanceData as any)?.monthly_target || 50000) * 100} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Rating: {(performanceData as any)?.customer_rating || 4.5}/5</span>
                    <span>Reviews: {(performanceData as any)?.total_reviews || 0}</span>
                  </div>
                  <Progress value={((performanceData as any)?.customer_rating || 4.5) / 5 * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Franchise financial performance and obligations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Financial reporting features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="territory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Territory Management</CardTitle>
              <CardDescription>Your franchise territory and coverage area</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Territory mapping features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};