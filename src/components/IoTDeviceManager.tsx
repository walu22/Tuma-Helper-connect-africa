import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Wifi, WifiOff, Plus, Settings, Zap, Home, Thermometer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface IoTDevice {
  id: string;
  device_name: string;
  device_type: string;
  device_model?: string;
  manufacturer?: string;
  status: string;
  capabilities: Record<string, any>;
  last_seen?: string;
  created_at: string;
}

interface SmartServiceRequest {
  id: string;
  device_id: string;
  service_type: string;
  priority: string;
  automated: boolean;
  device_data: Record<string, unknown>;
  status: string;
  created_at: string;
  device?: IoTDevice;
}

export default function IoTDeviceManager() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [serviceRequests, setServiceRequests] = useState<SmartServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingDevice, setIsAddingDevice] = useState(false);

  const [newDevice, setNewDevice] = useState({
    device_name: '',
    device_type: 'smart_home',
    device_model: '',
    manufacturer: '',
    capabilities: {}
  });

  useEffect(() => {
    if (user) {
      loadDevices();
      loadServiceRequests();
    }
  }, [user]);

  const loadDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data?.map(d => ({...d, capabilities: d.capabilities as Record<string, any>})) || []);
    } catch (error) {
      console.error('Error loading devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const loadServiceRequests = async () => {
    try {
      if (devices.length === 0) return;
      
      const { data, error } = await supabase
        .from('smart_service_requests')
        .select('*')
        .in('device_id', devices.map(d => d.id))
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Get device details separately
      const requestsWithDevices = data?.map(req => {
        const device = devices.find(d => d.id === req.device_id);
        return {
          ...req,
          device_data: req.device_data || {},
          device
        };
      }) || [];
      
      setServiceRequests(requestsWithDevices as any);
    } catch (error) {
      console.error('Error loading service requests:', error);
    }
  };

  const addDevice = async () => {
    try {
      const { error } = await supabase
        .from('iot_devices')
        .insert({
          user_id: user?.id,
          ...newDevice,
          capabilities: newDevice.capabilities
        });

      if (error) throw error;

      setNewDevice({
        device_name: '',
        device_type: 'smart_home',
        device_model: '',
        manufacturer: '',
        capabilities: {}
      });
      setIsAddingDevice(false);
      await loadDevices();
      toast.success('Device added successfully');
    } catch (error) {
      console.error('Error adding device:', error);
      toast.error('Failed to add device');
    }
  };

  const updateDeviceStatus = async (deviceId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('iot_devices')
        .update({ 
          status,
          last_seen: new Date().toISOString()
        })
        .eq('id', deviceId);

      if (error) throw error;
      await loadDevices();
      toast.success('Device status updated');
    } catch (error) {
      console.error('Error updating device:', error);
      toast.error('Failed to update device');
    }
  };

  const createServiceRequest = async (deviceId: string, serviceType: string) => {
    try {
      const device = devices.find(d => d.id === deviceId);
      const { error } = await supabase
        .from('smart_service_requests')
        .insert({
          device_id: deviceId,
          service_type: serviceType,
          priority: 'normal',
          automated: true,
          device_data: {
            device_name: device?.device_name,
            device_type: device?.device_type,
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;
      await loadServiceRequests();
      toast.success('Service request created');
    } catch (error) {
      console.error('Error creating service request:', error);
      toast.error('Failed to create service request');
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smart_home': return <Home className="h-5 w-5" />;
      case 'thermostat': return <Thermometer className="h-5 w-5" />;
      case 'lighting': return <Zap className="h-5 w-5" />;
      case 'security': return <Settings className="h-5 w-5" />;
      default: return <Smartphone className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">IoT Device Manager</h2>
        </div>
        <Dialog open={isAddingDevice} onOpenChange={setIsAddingDevice}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New IoT Device</DialogTitle>
              <DialogDescription>
                Connect a new smart device to your account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  value={newDevice.device_name}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, device_name: e.target.value }))}
                  placeholder="e.g., Living Room Thermostat"
                />
              </div>
              <div>
                <Label htmlFor="device-type">Device Type</Label>
                <Select
                  value={newDevice.device_type}
                  onValueChange={(value) => setNewDevice(prev => ({ ...prev, device_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smart_home">Smart Home</SelectItem>
                    <SelectItem value="thermostat">Thermostat</SelectItem>
                    <SelectItem value="lighting">Smart Lighting</SelectItem>
                    <SelectItem value="security">Security System</SelectItem>
                    <SelectItem value="appliance">Smart Appliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={newDevice.manufacturer}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder="e.g., Nest, Philips, Samsung"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newDevice.device_model}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, device_model: e.target.value }))}
                  placeholder="Device model number"
                />
              </div>
              <Button onClick={addDevice} className="w-full">
                Add Device
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devices">My Devices</TabsTrigger>
          <TabsTrigger value="requests">Service Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          {devices.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No devices connected yet. Add your first smart device!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => (
                <Card key={device.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.device_type)}
                        <CardTitle className="text-lg">{device.device_name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></div>
                        {device.status === 'active' ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {device.manufacturer} {device.device_model}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Status:</span>
                        <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                          {device.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Type:</span>
                        <span className="capitalize">{device.device_type.replace('_', ' ')}</span>
                      </div>
                      {device.last_seen && (
                        <div className="flex justify-between items-center text-sm">
                          <span>Last Seen:</span>
                          <span>{new Date(device.last_seen).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateDeviceStatus(device.id, device.status === 'active' ? 'inactive' : 'active')}
                          className="flex-1"
                        >
                          {device.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => createServiceRequest(device.id, 'maintenance')}
                          className="flex-1"
                        >
                          Request Service
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {serviceRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No service requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {serviceRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {request.service_type.replace('_', ' ').toUpperCase()} Service
                        </CardTitle>
                        <CardDescription>
                          Device: {request.device?.device_name}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                          {request.priority}
                        </Badge>
                        <Badge variant={request.status === 'pending' ? 'outline' : 'default'}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Automated Request:</span>
                        <span>{request.automated ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                      {Object.keys(request.device_data).length > 0 && (
                        <div className="pt-2">
                          <span className="text-sm font-medium">Device Data:</span>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                            {JSON.stringify(request.device_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}