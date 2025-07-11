import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NODE_ENV === 'production' 
  ? 'pk_live_...' // Replace with your live publishable key
  : 'pk_test_...' // Replace with your test publishable key
);

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm = ({ bookingId, amount, onSuccess, onCancel }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm the payment
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on the backend
        const { error: confirmError } = await supabase.functions.invoke('confirm-payment', {
          body: { paymentIntentId: paymentIntent.id },
        });

        if (confirmError) {
          throw confirmError;
        }

        toast({
          title: "Payment successful!",
          description: "Your booking has been confirmed and payment processed.",
        });

        if (onSuccess) {
          onSuccess();
        } else {
          navigate(`/bookings/${bookingId}`);
        }
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Payment failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-primary">N${amount}</p>
            <p className="text-sm text-muted-foreground">Total amount to pay</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <PaymentElement />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <div className="flex gap-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={!stripe || loading} 
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay N$${amount}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PaymentForm = (props: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useState(() => {
    const createPaymentIntent = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            bookingId: props.bookingId,
            amount: props.amount,
          },
        });

        if (error) throw error;

        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: "Payment initialization failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  });

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Initializing payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Unable to initialize payment. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;