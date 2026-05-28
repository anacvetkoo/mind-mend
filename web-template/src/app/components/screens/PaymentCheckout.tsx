import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, Loader2, Lock, XCircle } from 'lucide-react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent } from '../../services/payments';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentCheckoutProps {
  appointmentData: {
    id: string;
    therapistId: string;
    therapistName: string;
    appointmentType: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
    price?: number;
    location?: string;
  };
  price: number;
  onClose: () => void;
  onPaymentSuccess: (paymentId?: string) => void;
  onPaymentFailed: () => void;
}

interface PaymentFormProps extends PaymentCheckoutProps {
  clientSecret: string;
}

function PaymentForm({
  appointmentData,
  price,
  onClose,
  onPaymentSuccess,
  onPaymentFailed,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const formatDate = (dateStr: string) => {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');

      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.href,
        },
      });

      if (result.error) {
        setPaymentStatus('failed');
        setErrorMessage(result.error.message || 'Payment failed. Please try again.');
        onPaymentFailed();
        return;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        setPaymentStatus('success');

        setTimeout(() => {
          onPaymentSuccess(result.paymentIntent?.id);
        }, 1200);

        return;
      }

      setPaymentStatus('failed');
      setErrorMessage('Payment was not completed. Please try again.');
      onPaymentFailed();
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('failed');
      setErrorMessage('Payment failed. Please try again.');
      onPaymentFailed();
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto px-6 text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl text-foreground mb-3">Payment Successful!</h2>
          <p className="text-muted-foreground">
            Your appointment has been confirmed.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-md mx-auto min-h-screen pb-24">
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--border)] px-6 py-4 flex items-center z-10">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center mr-4 disabled:opacity-40"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl text-foreground">Payment</h1>
            <p className="text-xs text-muted-foreground">Complete your booking</p>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="bg-card rounded-2xl p-5 shadow-md mb-6">
            <h2 className="text-lg text-foreground mb-4">Appointment Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Therapist</span>
                <span className="text-foreground text-right">{appointmentData.therapistName}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground text-right">{appointmentData.appointmentType}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground text-right">{formatDate(appointmentData.date)}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Time</span>
                <span className="text-foreground text-right">
                  {appointmentData.startTime} - {appointmentData.endTime}
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-between gap-4">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">€{price}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="bg-card rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-[var(--lavender)]" />
              <h2 className="text-lg text-foreground">Secure Payment</h2>
            </div>

            <PaymentElement />

            {paymentStatus === 'failed' && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 flex gap-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  {errorMessage}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!stripe || !elements || isProcessing}
              className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
              {isProcessing ? 'Processing...' : `Pay €${price}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function PaymentCheckout(props: PaymentCheckoutProps) {
  const { appointmentData, price, onPaymentFailed } = props;
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const elementsOptions = useMemo(() => {
    return clientSecret
      ? {
          clientSecret,
          appearance: {
            theme: 'stripe' as const,
          },
        }
      : undefined;
  }, [clientSecret]);

  useEffect(() => {
    const loadPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const secret = await createPaymentIntent({
          amount: price,
          appointmentId: appointmentData.id,
          therapistId: appointmentData.therapistId,
          therapistName: appointmentData.therapistName,
          appointmentType: appointmentData.appointmentType,
          date: appointmentData.date,
          startTime: appointmentData.startTime,
        });

        setClientSecret(secret);
      } catch (error) {
        console.error('Failed to prepare payment:', error);
        setErrorMessage('Payment could not be prepared. Please try again.');
        onPaymentFailed();
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentIntent();
  }, [appointmentData, price, onPaymentFailed]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--lavender)] animate-spin" />
      </div>
    );
  }

  if (errorMessage || !elementsOptions) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600 dark:text-red-400" />
          <h2 className="text-xl text-foreground mb-2">Payment Error</h2>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <button
            onClick={props.onClose}
            className="px-6 py-3 rounded-xl bg-card border-2 border-[var(--border)] text-foreground"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentForm {...props} clientSecret={clientSecret} />
    </Elements>
  );
}