import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle, Phone, Video, MapPin, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppointmentType, AppointmentSlot, TherapistAvailability, BlockedTime, Appointment } from '../../types/appointments';
import { generateSlotsForDate } from '../../utils/appointmentSlots';

interface BookAppointmentFlowProps {
  therapistId: string;
  therapistName: string;
  therapistAvailability: TherapistAvailability;
  onClose: () => void;
  onRequestCustomTime: () => void;
  onProceedToPayment: (appointmentData: any) => void;
}

export function BookAppointmentFlow({
  therapistId,
  therapistName,
  therapistAvailability,
  onClose,
  onRequestCustomTime,
  onProceedToPayment
}: BookAppointmentFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const savedBlocked = localStorage.getItem(`blockedTimes_${therapistId}`);
    if (savedBlocked) {
      setBlockedTimes(JSON.parse(savedBlocked));
    }

    const savedAppointments = localStorage.getItem(`appointments_${therapistId}`);
    if (savedAppointments) {
      setExistingAppointments(JSON.parse(savedAppointments));
    }
  }, [therapistId]);

  const appointmentTypes: { type: AppointmentType; icon: typeof MessageCircle; label: string; description: string }[] = [
    { type: 'Chat', icon: MessageCircle, label: 'Text Chat', description: 'Secure messaging session' },
    { type: 'Voice Call', icon: Phone, label: 'Voice Call', description: 'Audio-only session' },
    { type: 'Video Call', icon: Video, label: 'Video Call', description: 'Face-to-face video session' },
    { type: 'In Person', icon: MapPin, label: 'In Person', description: 'Office visit' }
  ];

  const availableTypes = appointmentTypes.filter(at => therapistAvailability.enabledTypes.includes(at.type));

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  // Generate slots for selected date
  const availableSlots = selectedDate
    ? generateSlotsForDate(selectedDate, therapistAvailability, blockedTimes, existingAppointments)
    : [];

  const handleContinue = () => {
    if (step === 3 && selectedSlot) {
      // Proceed to payment
      onProceedToPayment({
        therapistId,
        therapistName,
        appointmentType: selectedType,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes
      });
    } else {
      setStep(step + 1);
    }
  };

  const canContinue = () => {
    if (step === 1) return selectedType !== null;
    if (step === 2) return selectedDate !== '';
    if (step === 3) return selectedSlot !== null;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-md mx-auto min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--border)] px-6 py-4 flex items-center z-10">
          <button
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center mr-4"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl text-foreground">Book Appointment</h1>
            <p className="text-xs text-muted-foreground">with {therapistName}</p>
          </div>
        </div>

        <div className="px-6 pt-6">
          {/* Step 1: Select Type */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl mb-2 text-foreground">Select Appointment Type</h2>
              <p className="text-sm text-muted-foreground mb-6">Choose how you'd like to meet</p>

              <div className="space-y-3 mb-6">
                {availableTypes.map(({ type, icon: Icon, label, description }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                      selectedType === type
                        ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-2 border-[var(--lavender)]'
                        : 'bg-card border-2 border-[var(--border)]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedType === type ? 'bg-[var(--lavender)]' : 'bg-[var(--muted)]'
                    }`}>
                      <Icon className={`w-6 h-6 ${selectedType === type ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-foreground">{label}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl mb-2 text-foreground">Select Date</h2>
              <p className="text-sm text-muted-foreground mb-6">Choose a date for your appointment</p>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <h3 className="text-lg text-foreground">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={nextMonth}
                  className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {days.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} />;
                  }

                  const dateStr = day.toISOString().split('T')[0];
                  const isSelected = dateStr === selectedDate;
                  const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                  return (
                    <button
                      key={idx}
                      onClick={() => !isPast && setSelectedDate(dateStr)}
                      disabled={isPast}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                          : isPast
                          ? 'text-muted-foreground opacity-30 cursor-not-allowed'
                          : 'bg-card border-2 border-[var(--border)] text-foreground hover:border-[var(--lavender)]'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 3: Select Time */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl mb-2 text-foreground">Select Time</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>

              {availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No available time slots</p>
                  <button
                    onClick={onRequestCustomTime}
                    className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white"
                  >
                    Request Different Time
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-4 rounded-xl transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                            : 'bg-card border-2 border-[var(--border)] text-foreground'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={onRequestCustomTime}
                    className="w-full py-3 rounded-xl bg-card border-2 border-[var(--border)] text-foreground mb-4"
                  >
                    Request Different Time
                  </button>
                </>
              )}

              {/* Optional Notes */}
              {availableSlots.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm text-foreground mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific topics or concerns you'd like to discuss..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Continue Button */}
          {step < 3 || (step === 3 && availableSlots.length > 0) ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              disabled={!canContinue()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-50"
            >
              {step === 3 ? 'Continue to Payment' : 'Continue'}
            </motion.button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
