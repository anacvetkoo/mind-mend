import type { TherapistAvailability, AppointmentSlot, BlockedTime, Appointment } from '../types/appointments';

/**
 * Generates available appointment slots for a specific date based on therapist availability
 */
export function generateSlotsForDate(
  date: string,
  availability: TherapistAvailability,
  blockedTimes: BlockedTime[],
  existingAppointments: Appointment[]
): AppointmentSlot[] {
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }) as any;

  // Find working hours for this day
  const workingHours = availability.workingHours.find(wh => wh.day === dayName);

  if (!workingHours || !workingHours.enabled) {
    return []; // Not a working day
  }

  // Check if date is blocked
  const isBlocked = blockedTimes.some(bt => {
    const blockStart = new Date(bt.startDate);
    const blockEnd = new Date(bt.endDate);
    const currentDate = new Date(date);

    if (bt.isFullDay) {
      return currentDate >= blockStart && currentDate <= blockEnd;
    } else {
      // Check if specific time range is blocked
      return currentDate.toDateString() === blockStart.toDateString() &&
             bt.startTime && bt.endTime;
    }
  });

  if (isBlocked) {
    const relevantBlock = blockedTimes.find(bt => {
      const blockStart = new Date(bt.startDate);
      const currentDate = new Date(date);
      return !bt.isFullDay && currentDate.toDateString() === blockStart.toDateString();
    });

    if (relevantBlock?.isFullDay) {
      return []; // Fully blocked day
    }
  }

  const slots: AppointmentSlot[] = [];
  const { appointmentDuration, breakDuration } = availability;

  // Parse start and end times
  const [startHour, startMin] = workingHours.startTime.split(':').map(Number);
  const [endHour, endMin] = workingHours.endTime.split(':').map(Number);

  let currentTime = startHour * 60 + startMin; // Convert to minutes
  const endTime = endHour * 60 + endMin;

  while (currentTime + appointmentDuration <= endTime) {
    const slotStartHour = Math.floor(currentTime / 60);
    const slotStartMin = currentTime % 60;
    const slotEndTime = currentTime + appointmentDuration;
    const slotEndHour = Math.floor(slotEndTime / 60);
    const slotEndMin = slotEndTime % 60;

    const startTimeStr = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;
    const endTimeStr = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

    // Check if slot overlaps with blocked time
    let isSlotBlocked = false;
    for (const bt of blockedTimes) {
      if (!bt.isFullDay && bt.startTime && bt.endTime) {
        const blockStart = new Date(bt.startDate);
        const currentDate = new Date(date);

        if (currentDate.toDateString() === blockStart.toDateString()) {
          const [blockStartHour, blockStartMin] = bt.startTime.split(':').map(Number);
          const [blockEndHour, blockEndMin] = bt.endTime.split(':').map(Number);
          const blockStartMinutes = blockStartHour * 60 + blockStartMin;
          const blockEndMinutes = blockEndHour * 60 + blockEndMin;

          // Check if slot overlaps with blocked time
          if (!(slotEndTime <= blockStartMinutes || currentTime >= blockEndMinutes)) {
            isSlotBlocked = true;
            break;
          }
        }
      }
    }

    // Check if slot overlaps with existing appointment
    const hasConflict = existingAppointments.some(apt => {
      if (apt.date !== date) return false;

      const [aptStartHour, aptStartMin] = apt.startTime.split(':').map(Number);
      const [aptEndHour, aptEndMin] = apt.endTime.split(':').map(Number);
      const aptStartMinutes = aptStartHour * 60 + aptStartMin;
      const aptEndMinutes = aptEndHour * 60 + aptEndMin;

      // Check if slot overlaps
      return !(slotEndTime <= aptStartMinutes || currentTime >= aptEndMinutes);
    });

    if (!isSlotBlocked && !hasConflict) {
      slots.push({
        id: `${date}-${startTimeStr}`,
        therapistId: availability.therapistId,
        date,
        startTime: startTimeStr,
        endTime: endTimeStr,
        isAvailable: true
      });
    }

    // Move to next slot (appointment duration + break)
    currentTime += appointmentDuration + breakDuration;
  }

  return slots;
}

/**
 * Generates slots for multiple dates
 */
export function generateSlotsForDateRange(
  startDate: string,
  endDate: string,
  availability: TherapistAvailability,
  blockedTimes: BlockedTime[],
  existingAppointments: Appointment[]
): AppointmentSlot[] {
  const slots: AppointmentSlot[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const daySlots = generateSlotsForDate(dateStr, availability, blockedTimes, existingAppointments);
    slots.push(...daySlots);
  }

  return slots;
}

/**
 * Check if a specific time slot is available
 */
export function isSlotAvailable(
  date: string,
  startTime: string,
  endTime: string,
  availability: TherapistAvailability,
  blockedTimes: BlockedTime[],
  existingAppointments: Appointment[]
): boolean {
  const slots = generateSlotsForDate(date, availability, blockedTimes, existingAppointments);
  return slots.some(slot => slot.startTime === startTime && slot.endTime === endTime);
}
