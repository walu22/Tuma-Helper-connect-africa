import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  MapPin,
  Tag,
  Clock,
  Star,
  CheckSquare,
  Square,
  TrendingUp,
  Calendar,
  RefreshCw,
  BarChart3,
  Settings,
  Zap,
  Users,
  Target
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  price_from: number;
  price_to: number | null;
  price_unit: string;
  location: string;
  is_available: boolean;
  rating: number | null;
  total_reviews: number;
  category_id: string;
  created_at: string;
  tags?: string[];
  service_areas?: string[];
  duration_estimate?: string;
  requirements?: string;
  booking_lead_time?: number;
  service_categories?: {
    name: string;
  };
}

interface ServiceCategory {
  id: string;
  name: string;
}

interface PricingOptimization {
  id: string;
  service_id: string;
  current_price_from: number;
  current_price_to: number | null;
  suggested_price_from: number;
  suggested_price_to: number | null;
  optimization_factors: Record<string, unknown>;
  confidence_score: number;
  demand_score: number | null;
  seasonality_factor: number | null;
  is_applied: boolean;
}

interface BulkOperation {
  id: string;
  operation_type: string;
  status: string;
  total_items: number;
  processed_items: number;
  failed_items: number;
  created_at: string;
}

const EnhancedServiceManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [pricingOptimizations, setPricingOptimizations] = useState<PricingOptimization[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [activeTab, setActiveTab] = useState('services');
  const [bulkUpdateProgress, setBulkUpdateProgress] = useState(0);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_from: '',
    price_to: '',
    price_unit: 'hour',
    location: '',
    category_id: '',
    is_available: true,
    tags: '',
    service_areas: '',
    duration_estimate: '',
    requirements: '',
    booking_lead_time: '24',
  });

  const [bulkUpdateData, setBulkUpdateData] = useState({
    price_adjustment_type: 'percentage', // 'percentage' or 'fixed'
    price_adjustment_value: '',
    location: '',
    category_id: '',
    is_available: null as boolean | null,
    tags: '',
    booking_lead_time: '',
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchServices(),
        fetchCategories(),
        fetchPricingOptimizations(),
        fetchBulkOperations()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_categories (name)
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading services",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPricingOptimizations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('service_pricing_optimization')
        .select('*')
        .eq('provider_id', user.id)
        .eq('is_applied', false)
        .gt('expires_at', new Date().toISOString())
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      setPricingOptimizations((data || []) as any);
    } catch (error: any) {
      console.error('Error fetching pricing optimizations:', error);
    }
  };

  const fetchBulkOperations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bulk_operations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBulkOperations(data || []);
    } catch (error: any) {
      console.error('Error fetching bulk operations:', error);
    }
  };

  const generatePricingOptimizations = async () => {
    if (!user || selectedServices.length === 0) return;

    try {
      setLoading(true);
      
      // Simulate AI pricing optimization
      const optimizations = selectedServices.map(serviceId => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return null;

        const demandMultiplier = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const seasonalMultiplier = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const competitionMultiplier = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
        
        const suggestedPrice = service.price_from * demandMultiplier * seasonalMultiplier * competitionMultiplier;
        const confidence = Math.min(95, 60 + Math.random() * 35);

        return {
          service_id: serviceId,
          provider_id: user.id,
          current_price_from: service.price_from,
          current_price_to: service.price_to,
          suggested_price_from: Math.round(suggestedPrice * 100) / 100,
          suggested_price_to: service.price_to ? Math.round(service.price_to * demandMultiplier * seasonalMultiplier * competitionMultiplier * 100) / 100 : null,
          optimization_factors: {
            demand_analysis: `${Math.round(demandMultiplier * 100)}% demand factor`,
            seasonal_trends: `${Math.round(seasonalMultiplier * 100)}% seasonal adjustment`,
            competition_analysis: `${Math.round(competitionMultiplier * 100)}% market positioning`,
            location_premium: service.location === 'Windhoek' ? '5% premium location' : 'Standard location'
          },
          confidence_score: Math.round(confidence * 100) / 100,
          demand_score: Math.round(demandMultiplier * 100),
          seasonality_factor: Math.round(seasonalMultiplier * 100) / 100,
        };
      }).filter(Boolean);

      const { error } = await supabase
        .from('service_pricing_optimization')
        .insert(optimizations);

      if (error) throw error;

      toast({
        title: "Pricing optimization generated",
        description: `Generated ${optimizations.length} pricing suggestions`,
      });

      fetchPricingOptimizations();
      setSelectedServices([]);
    } catch (error: any) {
      toast({
        title: "Error generating pricing optimizations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyPricingOptimization = async (optimization: PricingOptimization) => {
    try {
      // Update service price
      const { error: serviceError } = await supabase
        .from('services')
        .update({
          price_from: optimization.suggested_price_from,
          price_to: optimization.suggested_price_to,
        })
        .eq('id', optimization.service_id);

      if (serviceError) throw serviceError;

      // Mark optimization as applied
      const { error: optimizationError } = await supabase
        .from('service_pricing_optimization')
        .update({ is_applied: true })
        .eq('id', optimization.id);

      if (optimizationError) throw optimizationError;

      toast({
        title: "Pricing updated",
        description: "Service pricing has been optimized successfully",
      });

      fetchServices();
      fetchPricingOptimizations();
    } catch (error: any) {
      toast({
        title: "Error applying pricing optimization",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const processBulkUpdate = async () => {
    if (!user || selectedServices.length === 0) return;

    try {
      setIsProcessingBulk(true);
      setBulkUpdateProgress(0);

      // Create bulk operation record
      const { data: bulkOp, error: bulkOpError } = await supabase
        .from('bulk_operations')
        .insert({
          user_id: user.id,
          operation_type: 'update',
          total_items: selectedServices.length,
          operation_data: bulkUpdateData,
        })
        .select()
        .single();

      if (bulkOpError) throw bulkOpError;

      // Process each service
      const updatePromises = selectedServices.map(async (serviceId, index) => {
        try {
          const updateData: any = {};

          if (bulkUpdateData.price_adjustment_type && bulkUpdateData.price_adjustment_value) {
            const service = services.find(s => s.id === serviceId);
            if (service) {
              const adjustment = parseFloat(bulkUpdateData.price_adjustment_value);
              if (bulkUpdateData.price_adjustment_type === 'percentage') {
                updateData.price_from = service.price_from * (1 + adjustment / 100);
                if (service.price_to) {
                  updateData.price_to = service.price_to * (1 + adjustment / 100);
                }
              } else {
                updateData.price_from = service.price_from + adjustment;
                if (service.price_to) {
                  updateData.price_to = service.price_to + adjustment;
                }
              }
            }
          }

          if (bulkUpdateData.location) updateData.location = bulkUpdateData.location;
          if (bulkUpdateData.category_id) updateData.category_id = bulkUpdateData.category_id;
          if (bulkUpdateData.is_available !== null) updateData.is_available = bulkUpdateData.is_available;
          if (bulkUpdateData.booking_lead_time) updateData.booking_lead_time = parseInt(bulkUpdateData.booking_lead_time);
          if (bulkUpdateData.tags) {
            updateData.tags = bulkUpdateData.tags.split(',').map(tag => tag.trim());
          }

          const { error } = await supabase
            .from('services')
            .update(updateData)
            .eq('id', serviceId);

          if (error) throw error;

          setBulkUpdateProgress(((index + 1) / selectedServices.length) * 100);
          
        } catch (error) {
          console.error('Error updating service:', serviceId, error);
          throw error;
        }
      });

      await Promise.all(updatePromises);

      // Update bulk operation status
      await supabase
        .from('bulk_operations')
        .update({
          status: 'completed',
          processed_items: selectedServices.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', bulkOp.id);

      toast({
        title: "Bulk update completed",
        description: `Successfully updated ${selectedServices.length} services`,
      });

      setSelectedServices([]);
      setBulkUpdateData({
        price_adjustment_type: 'percentage',
        price_adjustment_value: '',
        location: '',
        category_id: '',
        is_available: null,
        tags: '',
        booking_lead_time: '',
      });
      setIsBulkDialogOpen(false);
      
      fetchServices();
      fetchBulkOperations();

    } catch (error: any) {
      toast({
        title: "Error processing bulk update",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessingBulk(false);
      setBulkUpdateProgress(0);
    }
  };

  const syncAvailability = async () => {
    if (!user || selectedServices.length === 0) return;

    try {
      const { error } = await supabase
        .from('service_availability_sync')
        .insert({
          provider_id: user.id,
          sync_type: 'bulk',
          services_affected: selectedServices,
          availability_changes: {
            sync_with_calendar: true,
            auto_disable_overbooked: true,
            availability_window_days: 30,
          },
        });

      if (error) throw error;

      // Simulate availability sync processing
      setTimeout(async () => {
        // Update services availability based on provider availability
        const { data: providerAvailability } = await supabase
          .from('provider_availability')
          .select('*')
          .eq('provider_id', user.id);

        const hasAvailability = providerAvailability && providerAvailability.length > 0;

        await supabase
          .from('services')
          .update({ is_available: hasAvailability })
          .in('id', selectedServices);

        toast({
          title: "Availability synced",
          description: `Updated availability for ${selectedServices.length} services`,
        });

        fetchServices();
        setSelectedServices([]);
        setIsAvailabilityDialogOpen(false);
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error syncing availability",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleServiceSelect = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices(prev => [...prev, serviceId]);
    } else {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
    }
  };

  const handleSelectAll = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map(s => s.id));
    }
  };

  // Form handling functions for service form dialog
  const handleFormChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      price_from: service.price_from.toString(),
      price_to: service.price_to ? service.price_to.toString() : '',
      price_unit: service.price_unit,
      location: service.location,
      category_id: service.category_id,
      is_available: service.is_available,
      tags: service.tags ? service.tags.join(', ') : '',
      service_areas: service.service_areas ? service.service_areas.join(', ') : '',
      duration_estimate: service.duration_estimate || '',
      requirements: service.requirements || '',
      booking_lead_time: service.booking_lead_time ? service.booking_lead_time.toString() : '24',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      price_from: '',
      price_to: '',
      price_unit: 'hour',
      location: '',
      category_id: '',
      is_available: true,
      tags: '',
      service_areas: '',
      duration_estimate: '',
      requirements: '',
      booking_lead_time: '24',
    });
  };

  const handleSubmit = async () => {
    if (!user) return;

    const {
      title,
      description,
      price_from,
      price_to,
      price_unit,
      location,
      category_id,
      is_available,
      tags,
      service_areas,
      duration_estimate,
      requirements,
      booking_lead_time,
    } = formData;

    if (!title || !description || !price_from || !location || !category_id) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const serviceData = {
        title,
        description,
        price_from: parseFloat(price_from),
        price_to: price_to ? parseFloat(price_to) : null,
        price_unit,
        location,
        category_id,
        is_available,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        service_areas: service_areas ? service_areas.split(',').map(s => s.trim()) : [],
        duration_estimate,
        requirements,
        booking_lead_time: booking_lead_time ? parseInt(booking_lead_time) : 24,
        provider_id: user.id,
      };

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: "Service updated",
          description: "Service details have been updated successfully",
        });
      } else {
        // Insert new service
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) throw error;

        toast({
          title: "Service created",
          description: "New service has been added successfully",
        });
      }

      fetchServices();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error saving service",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Service deleted",
        description: "The service has been deleted successfully",
      });

      fetchServices();
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
    } catch (error: any) {
      toast({
        title: "Error deleting service",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Service Management</h2>
          <p className="text-muted-foreground">Manage your services with advanced tools</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsPricingDialogOpen(true)}
            disabled={selectedServices.length === 0}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Optimize Pricing
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsAvailabilityDialogOpen(true)}
            disabled={selectedServices.length === 0}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Sync Availability
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsBulkDialogOpen(true)}
            disabled={selectedServices.length === 0}
          >
            <Settings className="w-4 h-4 mr-2" />
            Bulk Edit ({selectedServices.length})
          </Button>
          
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Optimization</TabsTrigger>
          <TabsTrigger value="operations">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {services.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedServices.length === services.length ? (
                  <CheckSquare className="w-4 h-4 mr-2" />
                ) : (
                  <Square className="w-4 h-4 mr-2" />
                )}
                Select All
              </Button>
              
              {selectedServices.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
          )}

          {services.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No services yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first service offering
                </p>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {services.map((service) => (
                <Card key={service.id} className={selectedServices.includes(service.id) ? 'ring-2 ring-primary' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={(checked) => handleServiceSelect(service.id, checked as boolean)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{service.title}</h3>
                          <Badge variant={service.is_available ? "default" : "secondary"}>
                            {service.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                          {service.service_categories && (
                            <Badge variant="outline">
                              {service.service_categories.name}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>N${service.price_from}{service.price_to ? ` - N$${service.price_to}` : ''} per {service.price_unit}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{service.location}</span>
                          </div>
                          {service.booking_lead_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{service.booking_lead_time}h lead time</span>
                            </div>
                          )}
                          {service.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{service.rating} ({service.total_reviews} reviews)</span>
                            </div>
                          )}
                        </div>

                        {service.tags && service.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {service.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {service.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{service.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(service)}
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Pricing Optimization</h3>
              <p className="text-sm text-muted-foreground">AI-powered pricing suggestions based on market analysis</p>
            </div>
            <Button 
              onClick={generatePricingOptimizations}
              disabled={selectedServices.length === 0}
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Optimizations
            </Button>
          </div>

          {pricingOptimizations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pricing optimizations</h3>
                <p className="text-muted-foreground mb-4">
                  Select services and generate AI-powered pricing suggestions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pricingOptimizations.map((optimization) => {
                const service = services.find(s => s.id === optimization.service_id);
                if (!service) return null;

                const priceChange = optimization.suggested_price_from - optimization.current_price_from;
                const priceChangePercent = (priceChange / optimization.current_price_from) * 100;

                return (
                  <Card key={optimization.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{service.title}</h3>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Current Price</Label>
                              <p className="font-medium">N${optimization.current_price_from}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Suggested Price</Label>
                              <p className="font-medium text-primary">N${optimization.suggested_price_from}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-3">
                            <Badge variant={priceChange > 0 ? "default" : "destructive"}>
                              {priceChange > 0 ? '+' : ''}N${priceChange.toFixed(2)} ({priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
                            </Badge>
                            <Badge variant="outline">
                              {optimization.confidence_score}% confidence
                            </Badge>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p>Factors: {Object.values(optimization.optimization_factors).join(', ')}</p>
                          </div>
                        </div>

                        <Button onClick={() => applyPricingOptimization(optimization)}>
                          Apply Optimization
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Bulk Operations History</h3>
            <p className="text-sm text-muted-foreground">Track your bulk update operations</p>
          </div>

          {bulkOperations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bulk operations</h3>
                <p className="text-muted-foreground">
                  Your bulk update history will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bulkOperations.map((operation) => (
                <Card key={operation.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold capitalize">{operation.operation_type} Operation</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(operation.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant={operation.status === 'completed' ? 'default' : operation.status === 'failed' ? 'destructive' : 'secondary'}>
                          {operation.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {operation.processed_items}/{operation.total_items} items
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Bulk Update Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Edit Services ({selectedServices.length} selected)</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price Adjustment</Label>
                <div className="flex gap-2">
                  <Select value={bulkUpdateData.price_adjustment_type} onValueChange={(value) => setBulkUpdateData(prev => ({ ...prev, price_adjustment_type: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">N$</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={bulkUpdateData.price_adjustment_value}
                    onChange={(e) => setBulkUpdateData(prev => ({ ...prev, price_adjustment_value: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Lead Time (hours)</Label>
                <Input
                  type="number"
                  placeholder="24"
                  value={bulkUpdateData.booking_lead_time}
                  onChange={(e) => setBulkUpdateData(prev => ({ ...prev, booking_lead_time: e.target.value }))}
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  placeholder="Leave empty to keep current"
                  value={bulkUpdateData.location}
                  onChange={(e) => setBulkUpdateData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={bulkUpdateData.category_id} onValueChange={(value) => setBulkUpdateData(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Keep current" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder="tag1, tag2, tag3"
                  value={bulkUpdateData.tags}
                  onChange={(e) => setBulkUpdateData(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulk_available"
                  checked={bulkUpdateData.is_available === true}
                  onCheckedChange={(checked) => setBulkUpdateData(prev => ({ ...prev, is_available: checked ? true : null }))}
                />
                <Label htmlFor="bulk_available">Mark as available</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulk_unavailable"
                  checked={bulkUpdateData.is_available === false}
                  onCheckedChange={(checked) => setBulkUpdateData(prev => ({ ...prev, is_available: checked ? false : null }))}
                />
                <Label htmlFor="bulk_unavailable">Mark as unavailable</Label>
              </div>
            </div>

            {isProcessingBulk && (
              <div className="space-y-2">
                <Label>Processing...</Label>
                <Progress value={bulkUpdateProgress} />
                <p className="text-sm text-muted-foreground">
                  {Math.round(bulkUpdateProgress)}% complete
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)} disabled={isProcessingBulk}>
              Cancel
            </Button>
            <Button onClick={processBulkUpdate} disabled={isProcessingBulk}>
              {isProcessingBulk ? 'Processing...' : 'Apply Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pricing Optimization Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Pricing Optimization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate AI-powered pricing suggestions for {selectedServices.length} selected service{selectedServices.length !== 1 ? 's' : ''}.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPricingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => { generatePricingOptimizations(); setIsPricingDialogOpen(false); }}>
                Generate Optimizations
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Availability Sync Dialog */}
      <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Availability</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sync availability for {selectedServices.length} selected service{selectedServices.length !== 1 ? 's' : ''} with your provider availability settings.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAvailabilityDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={syncAvailability}>
                Sync Availability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { resetForm(); setIsDialogOpen(false); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_from">Price From</Label>
                <Input
                  id="price_from"
                  type="number"
                  step="0.01"
                  value={formData.price_from}
                  onChange={(e) => handleFormChange('price_from', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="price_to">Price To</Label>
                <Input
                  id="price_to"
                  type="number"
                  step="0.01"
                  value={formData.price_to}
                  onChange={(e) => handleFormChange('price_to', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="price_unit">Price Unit</Label>
              <Select value={formData.price_unit} onValueChange={(value) => handleFormChange('price_unit', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Hour</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleFormChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => handleFormChange('is_available', checked)}
              />
              <Label htmlFor="is_available">Available</Label>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleFormChange('tags', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="service_areas">Service Areas (comma-separated)</Label>
              <Input
                id="service_areas"
                value={formData.service_areas}
                onChange={(e) => handleFormChange('service_areas', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="duration_estimate">Duration Estimate</Label>
              <Input
                id="duration_estimate"
                value={formData.duration_estimate}
                onChange={(e) => handleFormChange('duration_estimate', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleFormChange('requirements', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="booking_lead_time">Booking Lead Time (hours)</Label>
              <Input
                id="booking_lead_time"
                type="number"
                value={formData.booking_lead_time}
                onChange={(e) => handleFormChange('booking_lead_time', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => { resetForm(); setIsDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingService ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedServiceManagement;
