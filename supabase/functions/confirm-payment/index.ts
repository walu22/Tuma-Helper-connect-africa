import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client with service role for bypassing RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get request body
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      throw new Error("Missing payment intent ID");
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment not completed");
    }

    // Get booking ID from metadata
    const bookingId = paymentIntent.metadata.bookingId;
    if (!bookingId) {
      throw new Error("Booking ID not found in payment metadata");
    }

    // Update booking status to confirmed and mark as paid
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({ 
        status: 'confirmed',
        // You could add a payment_status field or store payment_intent_id
      })
      .eq('id', bookingId);

    if (updateError) {
      throw updateError;
    }

    // Optionally create a payment record
    // You could add a payments table to track all payment transactions

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment confirmed and booking updated",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error confirming payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});