import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, MessageSquare, CreditCard, ArrowRight, ArrowLeft, Check, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  title: string;
  description: string;
  price_from: number;
  price_to: number | null;
  price_unit: string;
  profiles: {
    display_name: string | null;
    user_id: string;
    avatar_url: string | null;
  };
  provider_profiles?: {
    rating: number;
    total_jobs_completed: number;
  };
}

interface MobileOptimizedBookingProps {
  service: Service;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface BookingStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

const MobileOptimizedBooking = ({ service, onClose, onSuccess }: MobileOptimizedBookingProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '09:00',
    duration_hours: 1,
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    customer_notes: '',
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps: BookingStep[] = [
    {
      id: 1,
      title: "Service Details",
      description: "Review service information",
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      id: 2,
      title: "Date & Time",
      description: "Choose when you need the service",
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      id: 3,
      title: "Your Information",
      description: "Provide contact details",
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    },
    {
      id: 4,
      title: "Payment",
      description: "Complete your booking",
      isCompleted: currentStep > 4,
      isActive: currentStep === 4
    }
  ];

  useEffect(() => {
    if (user) {
      prefillUserData();
    }
    if (currentStep === 2) {
      generateAvailableSlots();
    }
  }, [user, currentStep]);

  const prefillUserData = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, phone')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      setFormData(prev => ({
        ...prev,
        customer_name: profile.display_name || '',
        customer_phone: profile.phone || '',
      }));
    }
  };

  const generateAvailableSlots = () => {
    // Generate available time slots (in a real app, this would come from provider availability)
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    setAvailableSlots(slots);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true; // Service details are pre-filled
      case 2:
        return formData.booking_date && formData.booking_time;
      case 3:
        return formData.customer_name && formData.customer_address;
      case 4:
        return selectedPaymentMethod !== '';
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast({
        title: "Please complete all required fields",
        description: "Fill in the required information before proceeding.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotalAmount = () => {
    return service.price_from * formData.duration_hours;
  };

  const handleBookingSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete your booking.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Validate form data
      if (!formData.booking_date || !formData.customer_name || !formData.customer_address) {
        throw new Error('Please fill in all required fields');
      }

      // Check if booking date is in the future
      const bookingDateTime = new Date(`${formData.booking_date}T${formData.booking_time}`);
      if (bookingDateTime <= new Date()) {
        throw new Error('Please select a future date and time');
      }

      const bookingData = {
        customer_id: user.id,
        service_id: service.id,
        provider_id: service.profiles.user_id,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        duration_hours: formData.duration_hours,
        total_amount: calculateTotalAmount(),
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        customer_notes: formData.customer_notes,
        status: 'pending' as const,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking successful!",
        description: "Your booking has been submitted and is pending confirmation.",
      });

      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceFrom: number, priceTo: number | null, unit: string) => {
    if (priceTo && priceTo !== priceFrom) {
      return `NAD ${priceFrom} - ${priceTo} per ${unit}`;
    }
    return `NAD ${priceFrom} per ${unit}`;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const timeSlots = availableSlots;
  const durationOptions = [
    { value: 1, label: '1 hour' },
    { value: 2, label: '2 hours' },
    { value: 3, label: '3 hours' },
    { value: 4, label: '4 hours' },
    { value: 6, label: '6 hours' },
    { value: 8, label: '8 hours (full day)' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="font-semibold">Book Service</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <Progress value={(currentStep / 4) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            Step {currentStep} of 4
          </p>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="px-4 py-4 bg-muted/30">
        <div className="flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step.isCompleted 
                  ? 'bg-green-500 text-white' 
                  : step.isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.isCompleted ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <p className="text-xs text-center mt-1 font-medium">{step.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-4 py-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={service.profiles.avatar_url || ''} />
                    <AvatarFallback>
                      {service.profiles.display_name?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      by {service.profiles.display_name || 'Service Provider'}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      {service.provider_profiles?.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{service.provider_profiles.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Description:</p>
                  <p className="text-sm">{service.description}</p>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Starting price:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(service.price_from, service.price_to, service.price_unit)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="booking_date">Preferred Date *</Label>
                  <Input
                    id="booking_date"
                    type="date"
                    min={getMinDate()}
                    value={formData.booking_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, booking_date: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="booking_time">Preferred Time *</Label>
                  <Select value={formData.booking_time} onValueChange={(value) => setFormData(prev => ({ ...prev, booking_time: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={formData.duration_hours.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, duration_hours: parseInt(value) }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer_name">Full Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer_phone">Phone Number</Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                    placeholder="+264 XX XXX XXXX"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="customer_address">Service Address *</Label>
                  <Textarea
                    id="customer_address"
                    value={formData.customer_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                    placeholder="Enter the full address where the service should be provided"
                    className="mt-1"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer_notes">Additional Notes</Label>
                  <Textarea
                    id="customer_notes"
                    value={formData.customer_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_notes: e.target.value }))}
                    placeholder="Any special requirements or additional information"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{service.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{new Date(formData.booking_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{formData.booking_time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{formData.duration_hours} hour{formData.duration_hours !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium text-right text-sm">{formData.customer_address}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">NAD {calculateTotalAmount()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setSelectedPaymentMethod('card')}
                    className="justify-start h-12"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit/Debit Card
                  </Button>
                  <Button
                    variant={selectedPaymentMethod === 'mobile' ? 'default' : 'outline'}
                    onClick={() => setSelectedPaymentMethod('mobile')}
                    className="justify-start h-12"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Mobile Money
                  </Button>
                  <Button
                    variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className="justify-start h-12"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay on Service
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Secure Booking</span>
              </div>
              <p className="text-xs text-blue-700">
                Your payment is protected. Funds are only released to the provider after service completion.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button 
              onClick={nextStep} 
              className="flex-1"
              disabled={!validateStep(currentStep)}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleBookingSubmit} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : `Book Now - NAD ${calculateTotalAmount()}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileOptimizedBooking;