import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, MessageSquare, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PaymentForm from './PaymentForm';

interface Service {
  id: string;
  title: string;
  price_from: number;
  price_to: number | null;
  price_unit: string;
  profiles: {
    display_name: string | null;
    user_id: string;
  };
}

interface BookingFormProps {
  service: Service;
  onClose?: () => void;
}

const BookingForm = ({ service, onClose }: BookingFormProps) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '09:00',
    duration_hours: 1,
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    customer_notes: '',
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pre-fill customer name from profile
  useEffect(() => {
    const fetchCustomerInfo = async () => {
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

    fetchCustomerInfo();
  }, [user]);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const durationOptions = [
    { value: 1, label: '1 hour' },
    { value: 2, label: '2 hours' },
    { value: 3, label: '3 hours' },
    { value: 4, label: '4 hours' },
    { value: 6, label: '6 hours' },
    { value: 8, label: '8 hours (full day)' },
  ];

  const calculateTotalAmount = () => {
    const basePrice = service.price_from;
    return basePrice * formData.duration_hours;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book this service.",
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

      setCreatedBookingId(data.id);
      setCurrentStep(2); // Move to payment step
    } catch (error: unknown) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment successful!",
      description: "Your booking has been confirmed and payment processed.",
    });
    
    if (createdBookingId) {
      navigate(`/bookings/${createdBookingId}`);
    }
    
    if (onClose) onClose();
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (currentStep === 2 && createdBookingId) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Complete Payment</h3>
            <p className="text-sm text-muted-foreground">Secure payment for your booking</p>
          </div>
        </div>
        
        <PaymentForm
          bookingId={createdBookingId}
          amount={calculateTotalAmount()}
          onSuccess={handlePaymentSuccess}
          onCancel={handleBack}
        />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Book Service: {service.title}
        </CardTitle>
        <CardDescription>
          Fill in the details below to book this service with {service.profiles.display_name || 'the provider'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Preferred Date *
              </Label>
              <Input
                id="booking_date"
                type="date"
                min={getMinDate()}
                value={formData.booking_date}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Preferred Time *
              </Label>
              <Select value={formData.booking_time} onValueChange={(value) => setFormData(prev => ({ ...prev, booking_time: value }))}>
                <SelectTrigger>
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
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration
            </Label>
            <Select value={formData.duration_hours.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, duration_hours: parseInt(value) }))}>
              <SelectTrigger>
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

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Full Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  placeholder="+264 XX XXX XXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Service Address *
              </Label>
              <Textarea
                id="customer_address"
                value={formData.customer_address}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                placeholder="Enter the full address where the service should be provided"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_notes" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Additional Notes
              </Label>
              <Textarea
                id="customer_notes"
                value={formData.customer_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_notes: e.target.value }))}
                placeholder="Any special requirements or additional information for the service provider"
                rows={3}
              />
            </div>
          </div>

          {/* Pricing Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Price ({service.price_unit}):</span>
                  <span>N${service.price_from}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{formData.duration_hours} hours</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total Estimated Cost:</span>
                  <span className="text-primary">N${calculateTotalAmount()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  * Final price may vary based on actual service requirements
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading} className="flex-1 btn-hero">
              {loading ? (
                'Creating Booking...'
              ) : (
                <>
                  Continue to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;