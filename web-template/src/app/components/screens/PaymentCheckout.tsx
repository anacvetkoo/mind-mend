import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Lock, CheckCircle, XCircle } from 'lucide-react';

interface PaymentCheckoutProps {
  appointmentData: {
    therapistName: string;
    appointmentType: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  };
  price: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
  onPaymentFailed: () => void;
}

export function PaymentCheckout({
  appointmentData,
  price,
  onClose,
  onPaymentSuccess,
  onPaymentFailed
}: PaymentCheckoutProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      alert('Please fill in all fields');
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // 90% success rate for demo
      const success = Math.random() > 0.1;

      setProcessing(false);
      if (success) {
        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      } else {
        setPaymentStatus('failed');
      }
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
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
          <p className="text-muted-foreground mb-6">
            Your appointment has been confirmed. You'll receive a confirmation shortly.
          </p>
        </motion.div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl text-foreground mb-3">Payment Failed</h2>
            <p className="text-muted-foreground mb-6">
              There was an issue processing your payment. Please try again.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaymentStatus('idle')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white"
            >
              Try Again
            </motion.button>
            <button
              onClick={onClose}
              className="mt-3 w-full py-3 text-muted-foreground"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-md mx-auto min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--border)] px-6 py-4 flex items-center z-10">
          <button
            onClick={onClose}
            disabled={processing}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center mr-4"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl text-foreground">Secure Checkout</h1>
        </div>

        <div className="px-6 pt-6">
          {/* Appointment Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-md mb-6"
          >
            <h3 className="text-lg text-foreground mb-4">Appointment Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Therapist</span>
                <span className="text-foreground">{appointmentData.therapistName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground">{appointmentData.appointmentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">{formatDate(appointmentData.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="text-foreground">{appointmentData.startTime} - {appointmentData.endTime}</span>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex justify-between">
                <span className="text-foreground font-medium">Total</span>
                <span className="text-foreground font-medium text-lg">${price}</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-md mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-[var(--lavender)]" />
              <h3 className="text-lg text-foreground">Payment Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-2">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    disabled={processing}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground"
                  />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-foreground mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    disabled={processing}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-2">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    disabled={processing}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={processing}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </motion.div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 mb-6 px-4 py-3 rounded-xl bg-[var(--muted)]">
            <Lock className="w-4 h-4 text-[var(--lavender)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>

          {/* Pay Button */}
          <motion.button
            whileTap={{ scale: processing ? 1 : 0.98 }}
            onClick={handlePayment}
            disabled={processing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Pay $${price}`}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
