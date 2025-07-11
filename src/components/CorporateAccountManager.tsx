import { useState, useEffect } from "react";
import { Building2, Users, CreditCard, Package, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface CorporateAccount {
  id: string;
  company_name: string;
  industry: string;
  employee_count: number;
  payment_terms: string;
  credit_limit: number;
  is_active: boolean;
}

interface EnterprisePackage {
  id: string;
  package_name: string;
  service_types: string[];
  monthly_credit: number;
  discount_rate: number;
  contract_duration: number;
  is_active: boolean;
}

export const CorporateAccountManager = () => {
  const [corporateAccount, setCorporateAccount] = useState<CorporateAccount | null>(null);
  const [packages, setPackages] = useState<EnterprisePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchCorporateData();
    }
  }, [user]);

  const fetchCorporateData = async () => {
    try {
      // Get user's corporate account
      const { data: profile } = await supabase
        .from('profiles')
        .select('corporate_account_id')
        .eq('user_id', user?.id)
        .single();

      if (profile?.corporate_account_id) {
        // Fetch corporate account details
        const { data: account } = await supabase
          .from('corporate_accounts')
          .select('*')
          .eq('id', profile.corporate_account_id)
          .single();

        setCorporateAccount(account);

        // Fetch enterprise packages
        const { data: packagesData } = await supabase
          .from('enterprise_packages')
          .select('*')
          .eq('corporate_account_id', profile.corporate_account_id);

        setPackages(packagesData || []);
      }
    } catch (error) {
      console.error('Error fetching corporate data:', error);
      toast({
        title: "Error",
        description: "Failed to load corporate account data",
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

  if (!corporateAccount) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('account.corporate')}
            </CardTitle>
            <CardDescription>
              You don't have access to a corporate account. Contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Corporate Dashboard</h1>
        <Badge variant={corporateAccount.is_active ? "default" : "secondary"}>
          {corporateAccount.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Company</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{corporateAccount.company_name}</div>
                <p className="text-xs text-muted-foreground">{corporateAccount.industry}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{corporateAccount.employee_count}</div>
                <p className="text-xs text-muted-foreground">Total workforce</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">N${corporateAccount.credit_limit}</div>
                <p className="text-xs text-muted-foreground">{corporateAccount.payment_terms} terms</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Enterprise Packages</h2>
            <Button>
              <Package className="h-4 w-4 mr-2" />
              Request New Package
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Credit:</span>
                    <span className="font-medium">N${pkg.monthly_credit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Discount Rate:</span>
                    <span className="font-medium">{pkg.discount_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Contract Duration:</span>
                    <span className="font-medium">{pkg.contract_duration} months</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">Service Types:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pkg.service_types.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your corporate billing settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Billing features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your corporate account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};