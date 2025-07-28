import { useState, useEffect } from "react";
import { Key, Globe, Settings, TrendingUp, Shield, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface APIIntegration {
  id: string;
  integration_name: string;
  partner_company: string;
  permissions: Record<string, unknown>;
  rate_limit: number;
  webhook_url?: string;
  is_active: boolean;
  last_used?: string;
  created_at: string;
}

const availablePermissions = [
  { key: 'read:services', label: 'Read Services' },
  { key: 'read:bookings', label: 'Read Bookings' },
  { key: 'write:bookings', label: 'Create Bookings' },
  { key: 'read:providers', label: 'Read Providers' },
  { key: 'read:reviews', label: 'Read Reviews' },
  { key: 'webhook:notifications', label: 'Webhook Notifications' },
];

export const APIIntegrationPanel = () => {
  const [integrations, setIntegrations] = useState<APIIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form states
  const [newIntegration, setNewIntegration] = useState({
    integration_name: '',
    partner_company: '',
    webhook_url: '',
    rate_limit: 1000,
    permissions: {} as Record<string, boolean>,
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('api_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations((data || []) as any);
    } catch (error) {
      console.error('Error fetching API integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load API integrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAPIKey = () => {
    return 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateIntegration = async () => {
    try {
      const apiKey = generateAPIKey();
      const permissions = availablePermissions.reduce((acc, perm) => {
        acc[perm.key] = newIntegration.permissions[perm.key] || false;
        return acc;
      }, {} as Record<string, boolean>);

      const { error } = await supabase
        .from('api_integrations')
        .insert([{
          integration_name: newIntegration.integration_name,
          partner_company: newIntegration.partner_company,
          api_key_hash: apiKey, // In production, hash this
          permissions: permissions,
          rate_limit: newIntegration.rate_limit,
          webhook_url: newIntegration.webhook_url || null,
          is_active: true,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `API integration created. API Key: ${apiKey}`,
      });

      setShowNewForm(false);
      setNewIntegration({
        integration_name: '',
        partner_company: '',
        webhook_url: '',
        rate_limit: 1000,
        permissions: {},
      });
      fetchIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: "Error",
        description: "Failed to create API integration",
        variant: "destructive",
      });
    }
  };

  const toggleIntegrationStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('api_integrations')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `API integration ${!isActive ? 'activated' : 'deactivated'}`,
      });

      fetchIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration status",
        variant: "destructive",
      });
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Integration Management</h1>
        <Button onClick={() => setShowNewForm(true)}>
          <Key className="h-4 w-4 mr-2" />
          New Integration
        </Button>
      </div>

      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Integration</CardTitle>
            <CardDescription>Set up a new third-party API integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="integration_name">Integration Name</Label>
                <Input
                  id="integration_name"
                  value={newIntegration.integration_name}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, integration_name: e.target.value }))}
                  placeholder="My API Integration"
                />
              </div>
              <div>
                <Label htmlFor="partner_company">Partner Company</Label>
                <Input
                  id="partner_company"
                  value={newIntegration.partner_company}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, partner_company: e.target.value }))}
                  placeholder="Partner Company Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rate_limit">Rate Limit (per hour)</Label>
                <Input
                  id="rate_limit"
                  type="number"
                  value={newIntegration.rate_limit}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, rate_limit: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="webhook_url">Webhook URL (optional)</Label>
                <Input
                  id="webhook_url"
                  value={newIntegration.webhook_url}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder="https://partner.com/webhook"
                />
              </div>
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availablePermissions.map((perm) => (
                  <div key={perm.key} className="flex items-center space-x-2">
                    <Switch
                      id={perm.key}
                      checked={newIntegration.permissions[perm.key] || false}
                      onCheckedChange={(checked) => 
                        setNewIntegration(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, [perm.key]: checked }
                        }))
                      }
                    />
                    <Label htmlFor={perm.key} className="text-sm">{perm.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateIntegration}>Create Integration</Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{integration.integration_name}</CardTitle>
                <Badge variant={integration.is_active ? "default" : "secondary"}>
                  {integration.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>{integration.partner_company}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Rate Limit:
                </span>
                <span>{integration.rate_limit}/hour</span>
              </div>

              {integration.webhook_url && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Webhook:
                  </span>
                  <span className="truncate max-w-32">Configured</span>
                </div>
              )}

              {integration.last_used && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last Used:
                  </span>
                  <span>{new Date(integration.last_used).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Permissions:
                </span>
                <span>{Object.values(integration.permissions).filter(Boolean).length}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleIntegrationStatus(integration.id, integration.is_active)}
                >
                  {integration.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {integrations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No API Integrations</h3>
            <p className="text-muted-foreground mb-4">
              Create your first API integration to allow third-party access to your platform.
            </p>
            <Button onClick={() => setShowNewForm(true)}>
              Create Integration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};