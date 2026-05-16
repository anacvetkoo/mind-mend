import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';
import { TherapistAvailabilitySetup } from './TherapistAvailabilitySetup';
import { TherapistAvailabilityOverview } from './TherapistAvailabilityOverview';
import type { TherapistAvailability } from '../../types/appointments';

export function TherapistAvailabilityScreen() {
  const [availability, setAvailability] = useState<TherapistAvailability | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showBlockedTime, setShowBlockedTime] = useState(false);

  const handleSaveAvailability = (newAvailability: TherapistAvailability) => {
    setAvailability(newAvailability);
    setShowSetup(false);
  };

  if (showSetup) {
    return (
      <TherapistAvailabilitySetup
        onClose={() => setShowSetup(false)}
        existingAvailability={availability || undefined}
        onSave={handleSaveAvailability}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-foreground">Availability & Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your scheduling</p>
        </motion.div>

        {!availability || !availability.isSetupComplete ? (
          /* Onboarding State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-8 shadow-md text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--lavender)]/20 to-[var(--soft-purple)]/20 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-[var(--lavender)]" />
            </div>

            <h2 className="text-2xl mb-3 text-foreground">Set Up Appointment Booking</h2>
            <p className="text-muted-foreground mb-6">
              Configure your availability to start accepting appointment bookings from clients
            </p>

            <div className="bg-[var(--muted)] rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-foreground mb-3">You'll need to define:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--lavender)]">•</span>
                  <span>Working hours for each day</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--lavender)]">•</span>
                  <span>Appointment duration (30-120 minutes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--lavender)]">•</span>
                  <span>Break duration between sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--lavender)]">•</span>
                  <span>Supported appointment types (chat, call, video, in-person)</span>
                </li>
              </ul>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSetup(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Set Up Availability</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : (
          /* Setup Complete - Show Overview */
          <TherapistAvailabilityOverview
            availability={availability}
            onEdit={() => setShowSetup(true)}
            onManageBlockedTime={() => setShowBlockedTime(true)}
          />
        )}
      </div>
    </div>
  );
}
