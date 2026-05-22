import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import type { AppointmentType } from '../../types/appointments';

interface CustomAppointmentRequestProps {
  therapistId: string;
  therapistName: string;
  selectedType?: AppointmentType;
  selectedDate?: string;
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

export function CustomAppointmentRequest({
  therapistId,
  therapistName,
  selectedType,
  selectedDate,
  onClose,
  onSubmit
}: CustomAppointmentRequestProps) {
  const [proposedTime, setProposedTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!proposedTime) {
      alert('Please select a time');
      return;
    }

    onSubmit({
      therapistId,
      appointmentType: selectedType,
      proposedDate: selectedDate,
      proposedTime,
      message
    });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-md mx-auto min-h-screen pb-24">

        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--border)] px-6 py-4 flex items-center z-10">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center mr-4"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl text-foreground">Request Different Time</h1>
            <p className="text-xs text-muted-foreground">with {therapistName}</p>
          </div>
        </div>

        <div className="px-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Note */}
            <div className="bg-[var(--muted)] rounded-xl p-4">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> Your therapist will review and approve this request before you can proceed with payment.
              </p>
            </div>

            {/* Proposed Time */}
            <div>
              <label className="block text-sm text-foreground mb-2">Proposed Time</label>
              <input
                type="time"
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] text-foreground outline-none transition-all"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm text-foreground mb-2">Message to Therapist (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain why you need this specific time, or any additional context..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] text-foreground placeholder:text-muted-foreground resize-none outline-none transition-all"
              />
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!proposedTime}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-40"
            >
              Send Request
            </motion.button>

            <p className="text-xs text-muted-foreground text-center">
              You'll be notified when your therapist responds to your request
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}