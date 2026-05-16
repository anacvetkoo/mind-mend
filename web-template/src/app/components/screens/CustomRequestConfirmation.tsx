import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Calendar } from 'lucide-react';

interface CustomRequestConfirmationProps {
  onClose: () => void;
}

export function CustomRequestConfirmation({ onClose }: CustomRequestConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl text-foreground mb-4">Request Sent!</h1>
          <p className="text-muted-foreground mb-8">
            Your request has been sent to the therapist. You will receive a notification once the therapist accepts or rejects your request.
          </p>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white"
          >
            Done
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
