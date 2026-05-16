import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle, Phone, Video, MapPin } from 'lucide-react';
import type { AppointmentType } from '../../types/appointments';

interface CustomAppointmentRequestProps {
  therapistId: string;
  therapistName: string;
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

export function CustomAppointmentRequest({
  therapistId,
  therapistName,
  onClose,
  onSubmit
}: CustomAppointmentRequestProps) {
  const [selectedType, setSelectedType] = useState<AppointmentType>('Video Call');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [message, setMessage] = useState('');

  const appointmentTypes: { type: AppointmentType; icon: typeof MessageCircle; label: string }[] = [
    { type: 'Chat', icon: MessageCircle, label: 'Text Chat' },
    { type: 'Voice Call', icon: Phone, label: 'Voice Call' },
    { type: 'Video Call', icon: Video, label: 'Video Call' },
    { type: 'In Person', icon: MapPin, label: 'In Person' }
  ];

  const handleSubmit = () => {
    if (!proposedDate || !proposedTime) {
      alert('Please select a date and time');
      return;
    }

    onSubmit({
      therapistId,
      appointmentType: selectedType,
      proposedDate,
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
            <h1 className="text-xl text-foreground">Request Custom Time</h1>
            <p className="text-xs text-muted-foreground">with {therapistName}</p>
          </div>
        </div>

        <div className="px-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-[var(--muted)] rounded-xl p-4 mb-6">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> Your therapist will review and approve this request before you can proceed with payment.
              </p>
            </div>

            {/* Appointment Type */}
            <div className="mb-6">
              <label className="block text-sm text-foreground mb-3">Appointment Type</label>
              <div className="grid grid-cols-2 gap-3">
                {appointmentTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      selectedType === type
                        ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-2 border-[var(--lavender)]'
                        : 'bg-card border-2 border-[var(--border)]'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${selectedType === type ? 'text-[var(--lavender)]' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${selectedType === type ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Proposed Date and Time */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-sm text-foreground mb-2">Proposed Date</label>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">Proposed Time</label>
                <input
                  type="time"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground"
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm text-foreground mb-2">Message to Therapist (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain why you need this specific time, or any additional context..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!proposedDate || !proposedTime}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-50"
            >
              Send Request
            </motion.button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              You'll be notified when your therapist responds to your request
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
