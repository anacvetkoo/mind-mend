import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Edit2, Ban, MessageCircle, Phone, Video, MapPin } from 'lucide-react';
import type { TherapistAvailability, AppointmentType } from '../../types/appointments';

interface TherapistAvailabilityOverviewProps {
  availability: TherapistAvailability;
  onEdit: () => void;
  onManageBlockedTime: () => void;
}

export function TherapistAvailabilityOverview({ availability, onEdit, onManageBlockedTime }: TherapistAvailabilityOverviewProps) {
  const enabledDays = availability.workingHours.filter(wh => wh.enabled);

  const getTypeIcon = (type: AppointmentType) => {
    switch (type) {
      case 'Chat': return MessageCircle;
      case 'Voice Call': return Phone;
      case 'Video Call': return Video;
      case 'In Person': return MapPin;
    }
  };

  return (
    <div className="space-y-4">
      {/* Working Days Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-md"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[var(--lavender)]" />
          </div>
          <div>
            <h3 className="text-foreground">Working Days</h3>
            <p className="text-xs text-muted-foreground">{enabledDays.length} days per week</p>
          </div>
        </div>

        <div className="space-y-2">
          {enabledDays.map(({ day, startTime, endTime }) => (
            <div key={day} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm text-foreground">{day}</span>
              <span className="text-sm text-muted-foreground">{startTime} - {endTime}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Session Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-6 shadow-md"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--soft-purple)]/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[var(--soft-purple)]" />
          </div>
          <div>
            <h3 className="text-foreground">Session Settings</h3>
            <p className="text-xs text-muted-foreground">Timing configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Appointment Duration</p>
            <p className="text-foreground">{availability.appointmentDuration} minutes</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Break Duration</p>
            <p className="text-foreground">{availability.breakDuration} minutes</p>
          </div>
        </div>
      </motion.div>

      {/* Appointment Types Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-6 shadow-md"
      >
        <h3 className="text-foreground mb-4">Appointment Types</h3>
        <div className="grid grid-cols-2 gap-3">
          {availability.enabledTypes.map(type => {
            const Icon = getTypeIcon(type);
            return (
              <div key={type} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--lavender)]/10 border border-[var(--lavender)]/20">
                <Icon className="w-4 h-4 text-[var(--lavender)]" />
                <span className="text-sm text-foreground">{type}</span>
              </div>
            );
          })}
        </div>

        {availability.inPersonAddress && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-xs text-muted-foreground mb-1">Office Address</p>
            <p className="text-sm text-foreground">{availability.inPersonAddress}</p>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onEdit}
          className="py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Availability</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onManageBlockedTime}
          className="py-4 rounded-2xl bg-card border-2 border-[var(--border)] text-foreground flex items-center justify-center gap-2"
        >
          <Ban className="w-4 h-4" />
          <span>Manage Time Off</span>
        </motion.button>
      </div>
    </div>
  );
}
