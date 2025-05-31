'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  currency?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  clientSecret,
  amount,
  currency = 'EUR',
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found.');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'requires_capture') {
        // Payment authorized successfully (for manual capture)
        onSuccess();
        toast.success('Payment authorized! Waiting for host approval.');
      } else if (paymentIntent.status === 'succeeded') {
        // Payment completed immediately (for instant booking)
        onSuccess();
        toast.success('Payment successful! Booking confirmed.');
      }
    } catch {
      onError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: '#9ca3af',
        },
        iconColor: '#FF2800',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-[#FF2800]/10 rounded-full flex items-center justify-center mx-auto">
          <CreditCard size={32} className="text-[#FF2800]" />
        </div>
        <h2 className="text-xl font-bold text-white">Secure Payment</h2>
        <p className="text-gray-400">
          Total: <span className="text-white font-semibold">{currency}€{amount}</span>
        </p>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Card Information
          </label>
          <div className="p-4 bg-gray-800 border border-gray-600 rounded-xl focus-within:border-[#FF2800] transition-colors">
            <CardElement
              options={cardElementOptions}
              onChange={(event: { complete: boolean }) => {
                setCardComplete(event.complete);
              }}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center space-x-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
          <Lock size={16} className="text-green-400" />
          <p className="text-xs text-gray-400">
            Your payment information is encrypted and secure. 
            We use industry-standard security measures.
          </p>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!stripe || isProcessing || !cardComplete}
          className="w-full h-14 bg-[#FF2800] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <span>Processing...</span>
            </div>
          ) : (
            <span>Authorize Payment</span>
          )}
        </motion.button>
      </form>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        By completing this payment, you agree to our Terms of Service and Privacy Policy.
        Your card will be charged only after the host approves your booking.
      </p>
    </div>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm; 