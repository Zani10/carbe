import Stripe from 'stripe';
import { PaymentIntent } from '@/types/booking';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

/**
 * Create a payment intent with manual capture for host approval flow
 */
export async function createPaymentIntent({
  amount,
  currency = 'eur',
  customerId,
  metadata = {},
}: {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
}): Promise<PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      capture_method: 'manual', // This is key for auth-and-capture
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret!,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Capture a previously authorized payment (when host approves)
 */
export async function capturePayment(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw new Error('Failed to capture payment');
  }
}

/**
 * Cancel a payment intent (when host rejects or booking expires)
 */
export async function cancelPayment(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent.status === 'canceled';
  } catch (error) {
    console.error('Error canceling payment:', error);
    throw new Error('Failed to cancel payment');
  }
}

/**
 * Create a refund for a captured payment
 */
export async function createRefund({
  paymentIntentId,
  amount,
  reason = 'requested_by_customer',
}: {
  paymentIntentId: string;
  amount?: number;
  reason?: Stripe.RefundCreateParams.Reason;
}): Promise<boolean> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
    });
    return refund.status === 'succeeded';
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
}

/**
 * Get payment intent status
 */
export async function getPaymentIntentStatus(paymentIntentId: string): Promise<string> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Failed to retrieve payment intent');
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrRetrieveCustomer({
  email,
  name,
  userId,
}: {
  email: string;
  name: string;
  userId: string;
}): Promise<string> {
  try {
    // First, try to find existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    return customer.id;
  } catch (error) {
    console.error('Error creating/retrieving customer:', error);
    throw new Error('Failed to create/retrieve customer');
  }
}

export { stripe }; 