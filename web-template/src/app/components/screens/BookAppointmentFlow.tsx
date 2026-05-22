import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle, Phone, Video, MapPin, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppointmentType, AppointmentSlot, TherapistAvailability, BlockedTime, Appointment } from '../../types/appointments';
import { generateSlotsForDate } from '../../utils/appointmentSlots';
import { getBlockedTimes } from '../../services/users';
import { getAppointmentsForTherapist } from '../../services/appointments';

interface BookAppointmentFlowProps {
  therapistId: string;
  therapistName: string;
  therapistAvailability: TherapistAvailability;
  initialStep?: number;
  initialDate?: string;
  initialType?: AppointmentType | null;
  onClose: () => void;
  onRequestCustomTime: (data: { appointmentType: AppointmentType | null; date: string }) => void;
  onProceedToPayment: (appointmentData: any) => void;
}

export function BookAppointmentFlow({
  therapistId,
  therapistName,
  therapistAvailability,
  initialStep = 1,
  initialDate = '',
  initialType = null,
  onClose,
  onRequestCustomTime,
  onProceedToPayment
}: BookAppointmentFlowProps) {
  const [step, setStep] = useState(initialStep);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(initialType);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const blocked = await getBlockedTimes(therapistId);
        setBlockedTimes(blocked);
      } catch (error) {
        console.error('Error fetching blocked times:', error);
      }

      try {
        const appointments = await getAppointmentsForTherapist(therapistId);
        setExistingAppointments(appointments.filter(a => a.status === 'CONFIRMED'));
      } catch (error) {
        console.error('Error fetching appointments (index missing?):', error);
      }
    };
    fetchData();
  }, [therapistId]);

  const toLocalDateStr = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const isDateBlocked = (date: Date): boolean => {
    const dateStr = toLocalDateStr(date);
    return blockedTimes.some(bt => bt.isFullDay && dateStr >= bt.startDate && dateStr <= bt.endDate);
  };

  const isWorkingDay = (date: Date): boolean => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const wh = therapistAvailability.workingHours.find(w => w.day === dayName);
    return !!wh?.enabled;
  };

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const availableSlots = selectedDate
    ? generateSlotsForDate(selectedDate, therapistAvailability, blockedTimes, existingAppointments)
    : [];

  const appointmentTypes: { type: AppointmentType; icon: typeof MessageCircle; label: string; description: string }[] = [
    { type: 'Chat', icon: MessageCircle, label: 'Text Chat', description: 'Secure messaging session' },
    { type: 'Voice Call', icon: Phone, label: 'Voice Call', description: 'Audio-only session' },
    { type: 'Video Call', icon: Video, label: 'Video Call', description: 'Face-to-face video session' },
    { type: 'In Person', icon: MapPin, label: 'In Person', description: 'Office visit' },
  ];

  const availableTypes = appointmentTypes.filter(at =>
    therapistAvailability.enabledTypes.includes(at.type)
  );

  const handleContinue = () => {
    if (step === 3 && selectedSlot) {
      onProceedToPayment({
        therapistId,
        therapistName,
        appointmentType: selectedType,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes,
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
          <div className="flex gap-1.5">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${s <= step ? 'bg-[var(--lavender)]' : 'bg-[var(--border)]'}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 pt-6">

          {/* Step 1: Session Type */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl mb-2 text-foreground">Session Type</h2>
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
                    {selectedType === type && (
                      <div className="w-5 h-5 rounded-full bg-[var(--lavender)] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl mb-2 text-foreground">Select Date</h2>
              <p className="text-sm text-muted-foreground mb-6">Choose a date for your appointment</p>

              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <h3 className="text-lg text-foreground">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={nextMonth} className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1.5 mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs text-muted-foreground py-2">{day}</div>
                ))}
                {days.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isPast = day < today;
                  const isBlocked = !isPast && isDateBlocked(day);
                  const isNonWorking = !isPast && !isBlocked && !isWorkingDay(day);
                  const isDisabled = isPast || isBlocked || isNonWorking;
                  const dateStr = toLocalDateStr(day);
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={idx}
                      onClick={() => !isDisabled && setSelectedDate(dateStr)}
                      disabled={isDisabled}
                      title={isBlocked ? 'Therapist time off' : isNonWorking ? 'Not a working day' : undefined}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-md'
                          : isPast
                          ? 'text-muted-foreground opacity-25 cursor-not-allowed'
                          : isBlocked
                          ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-400 opacity-80 cursor-not-allowed line-through'
                          : isNonWorking
                          ? 'text-muted-foreground opacity-30 cursor-not-allowed'
                          : 'bg-card border-2 border-[var(--border)] text-foreground hover:border-[var(--lavender)]'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]" />
                  <span className="text-xs text-muted-foreground">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-pink-200 dark:bg-pink-800" />
                  <span className="text-xs text-muted-foreground">Time off</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--muted)]" />
                  <span className="text-xs text-muted-foreground">Unavailable</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Select Time */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl mb-2 text-foreground">Select Time</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric'
                })}
              </p>

              {availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">No available time slots</p>
                  <p className="text-sm text-muted-foreground mb-6">All slots may be booked or the therapist is unavailable</p>
                  <button
                    onClick={() => onRequestCustomTime({ appointmentType: selectedType, date: selectedDate })}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white"
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
                            ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-md'
                            : 'bg-card border-2 border-[var(--border)] text-foreground hover:border-[var(--lavender)]'
                        }`}
                      >
                        <span className="block text-sm">{slot.startTime}</span>
                        <span className={`block text-xs mt-0.5 ${selectedSlot?.id === slot.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {slot.endTime}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => onRequestCustomTime({ appointmentType: selectedType, date: selectedDate })}
                    className="w-full py-3 rounded-xl bg-card border-2 border-[var(--border)] text-foreground mb-6 text-sm"
                  >
                    Request Different Time
                  </button>

                  <div className="mb-6">
                    <label className="block text-sm text-foreground mb-2">Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific topics or concerns you'd like to discuss..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] text-foreground placeholder:text-muted-foreground resize-none outline-none transition-all"
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {(step < 3 || (step === 3 && availableSlots.length > 0)) && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              disabled={!canContinue()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-40"
            >
              {step === 3 ? 'Continue to Payment' : 'Continue'}
            </motion.button>
          )}

        </div>
      </div>
    </div>
  );
}