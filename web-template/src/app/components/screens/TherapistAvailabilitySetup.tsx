import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Calendar, MessageCircle, Phone, Video, MapPin, Edit2, PlusCircle } from 'lucide-react';
import type { TherapistAvailability, AppointmentType, DayOfWeek, WorkingHours } from '../../types/appointments';

interface TherapistAvailabilitySetupProps {
  onClose: () => void;
  existingAvailability?: TherapistAvailability;
  onSave: (availability: TherapistAvailability) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DURATIONS = [30, 45, 50, 60, 90, 120];

export function TherapistAvailabilitySetup({ onClose, existingAvailability, onSave }: TherapistAvailabilitySetupProps) {
  const [step, setStep] = useState(1);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(
    existingAvailability?.workingHours || DAYS.map(day => ({
      day,
      enabled: day !== 'Saturday' && day !== 'Sunday',
      startTime: '09:00',
      endTime: '17:00'
    }))
  );
  const [appointmentDuration, setAppointmentDuration] = useState(existingAvailability?.appointmentDuration || 50);
  const [breakDuration, setBreakDuration] = useState(existingAvailability?.breakDuration || 10);
  const [enabledTypes, setEnabledTypes] = useState<AppointmentType[]>(
    existingAvailability?.enabledTypes || ['Chat', 'Video Call']
  );
  const [inPersonAddress, setInPersonAddress] = useState(existingAvailability?.inPersonAddress || '');

  const appointmentTypes: { type: AppointmentType; icon: typeof MessageCircle; label: string }[] = [
    { type: 'Chat', icon: MessageCircle, label: 'Chat' },
    { type: 'Voice Call', icon: Phone, label: 'Voice Call' },
    { type: 'Video Call', icon: Video, label: 'Video Call' },
    { type: 'In Person', icon: MapPin, label: 'In Person' }
  ];

  const toggleDay = (day: DayOfWeek) => {
    setWorkingHours(workingHours.map(wh =>
      wh.day === day ? { ...wh, enabled: !wh.enabled } : wh
    ));
  };

  const updateDayTime = (day: DayOfWeek, field: 'startTime' | 'endTime', value: string) => {
    setWorkingHours(workingHours.map(wh =>
      wh.day === day ? { ...wh, [field]: value } : wh
    ));
  };

  const toggleAppointmentType = (type: AppointmentType) => {
    if (enabledTypes.includes(type)) {
      setEnabledTypes(enabledTypes.filter(t => t !== type));
    } else {
      setEnabledTypes([...enabledTypes, type]);
    }
  };

  const handleSave = () => {
    const availability: TherapistAvailability = {
      therapistId: 'current-therapist-id', // In real app, get from context
      workingHours,
      appointmentDuration,
      breakDuration,
      enabledTypes,
      inPersonAddress: enabledTypes.includes('In Person') ? inPersonAddress : undefined,
      isSetupComplete: true
    };
    onSave(availability);
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
            <h1 className="text-xl text-foreground">
              {existingAvailability ? 'Edit Availability' : 'Set Up Availability'}
            </h1>
            <p className="text-xs text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>

        <div className="px-6 pt-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl mb-2 text-foreground">Working Hours</h2>
              <p className="text-sm text-muted-foreground mb-6">Set your available days and times</p>

              <div className="space-y-4 mb-6">
                {workingHours.map(({ day, enabled, startTime, endTime }) => (
                  <div key={day} className="bg-card rounded-2xl p-4 border-2 border-[var(--border)]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-foreground">{day}</span>
                      <button
                        onClick={() => toggleDay(day)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          enabled ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]' : 'bg-[var(--muted)]'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                          enabled ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    {enabled && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => updateDayTime(day, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">End</label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => updateDayTime(day, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white"
              >
                Continue
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl mb-2 text-foreground">Session Settings</h2>
              <p className="text-sm text-muted-foreground mb-6">Configure appointment timing</p>

              <div className="mb-6">
                <label className="block text-sm text-foreground mb-3">
                  Appointment Duration
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {DURATIONS.map(duration => (
                    <button
                      key={duration}
                      onClick={() => setAppointmentDuration(duration)}
                      className={`py-3 rounded-xl text-sm transition-all ${
                        appointmentDuration === duration
                          ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                          : 'bg-card border-2 border-[var(--border)] text-foreground'
                      }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-foreground mb-3">
                  Break Between Appointments
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[0, 5, 10, 15].map(duration => (
                    <button
                      key={duration}
                      onClick={() => setBreakDuration(duration)}
                      className={`py-3 rounded-xl text-sm transition-all ${
                        breakDuration === duration
                          ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                          : 'bg-card border-2 border-[var(--border)] text-foreground'
                      }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-2xl bg-card border-2 border-[var(--border)] text-foreground"
                >
                  Back
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl mb-2 text-foreground">Appointment Types</h2>
              <p className="text-sm text-muted-foreground mb-6">Select the types you offer</p>

              <div className="space-y-3 mb-6">
                {appointmentTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => toggleAppointmentType(type)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${
                      enabledTypes.includes(type)
                        ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-2 border-[var(--lavender)]'
                        : 'bg-card border-2 border-[var(--border)]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${enabledTypes.includes(type) ? 'text-[var(--lavender)]' : 'text-muted-foreground'}`} />
                    <span className="flex-1 text-left text-foreground">{label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      enabledTypes.includes(type)
                        ? 'bg-[var(--lavender)] border-[var(--lavender)]'
                        : 'border-[var(--border)]'
                    }`}>
                      {enabledTypes.includes(type) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {enabledTypes.includes('In Person') && (
                <div className="mb-6">
                  <label className="block text-sm text-foreground mb-2">
                    Office Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={inPersonAddress}
                    onChange={(e) => setInPersonAddress(e.target.value)}
                    placeholder="Enter your office address..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-2xl bg-card border-2 border-[var(--border)] text-foreground"
                >
                  Back
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={enabledTypes.length === 0 || (enabledTypes.includes('In Person') && !inPersonAddress.trim())}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-50"
                >
                  Save Availability
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
