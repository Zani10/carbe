import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { PaymentStatus, BookingStatus } from '@/types/booking';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('payment_intent_id', paymentIntent.id)
    .single();

  if (error || !booking) {
    console.error('Booking not found for payment intent:', paymentIntent.id);
    return;
  }

  // Update booking status to confirmed and payment status to captured
  await supabase
    .from('bookings')
    .update({
      payment_status: 'captured' as PaymentStatus,
      status: 'confirmed' as BookingStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  console.log(`Payment succeeded for booking ${booking.id}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('payment_intent_id', paymentIntent.id)
    .single();

  if (error || !booking) {
    console.error('Booking not found for payment intent:', paymentIntent.id);
    return;
  }

  // Update payment status to failed
  await supabase
    .from('bookings')
    .update({
      payment_status: 'failed' as PaymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  console.log(`Payment failed for booking ${booking.id}`);
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('payment_intent_id', paymentIntent.id)
    .single();

  if (error || !booking) {
    console.error('Booking not found for payment intent:', paymentIntent.id);
    return;
  }

  // Update booking status to rejected and payment status to refunded
  await supabase
    .from('bookings')
    .update({
      payment_status: 'refunded' as PaymentStatus,
      status: 'rejected' as BookingStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  console.log(`Payment canceled for booking ${booking.id}`);
} 