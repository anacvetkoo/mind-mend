import type { TherapistAvailability, AppointmentSlot, BlockedTime, Appointment } from '../types/appointments';

export function generateSlotsForDate(
  date: string,
  availability: TherapistAvailability,
  blockedTimes: BlockedTime[],
  existingAppointments: Appointment[]
): AppointmentSlot[] {

  // T12:00:00 prepreči UTC shift — brez tega je dayName napačen v +1/+2 conah
  const dateObj = new Date(date + 'T12:00:00');
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  // Preveri ali je delovni dan
  const workingHours = availability.workingHours.find(wh => wh.day === dayName);
  if (!workingHours || !workingHours.enabled) {
    return [];
  }

  // Preveri ali je cel dan blokiran — primerjava stringov, timezone safe
  const isFullDayBlocked = blockedTimes.some(
    bt => bt.isFullDay && date >= bt.startDate && date <= bt.endDate
  );
  if (isFullDayBlocked) {
    return [];
  }

  // Generiraj slote
  const slots: AppointmentSlot[] = [];
  const { appointmentDuration, breakDuration } = availability;

  const [startHour, startMin] = workingHours.startTime.split(':').map(Number);
  const [endHour, endMin] = workingHours.endTime.split(':').map(Number);

  let currentTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  // Če je datum danes, ugotovimo trenutni čas in preskočimo pretekle slote
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = date === todayStr;
  // Dodamo 30 min buffer da user nima nerealno malo časa za pripravo
  const nowMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : 0;

  while (currentTime + appointmentDuration <= endTime) {
    // Preskoči slote ki so že v preteklosti (za današnji dan)
    if (isToday && currentTime < nowMinutes) {
      currentTime += appointmentDuration + breakDuration;
      continue;
    }
    const slotEnd = currentTime + appointmentDuration;

    const startStr = `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`;
    const endStr = `${String(Math.floor(slotEnd / 60)).padStart(2, '0')}:${String(slotEnd % 60).padStart(2, '0')}`;

    // Preveri ali slot pade v partial-day blokado — string primerjava za datum
    const isSlotBlocked = blockedTimes.some(bt => {
      if (bt.isFullDay || !bt.startTime || !bt.endTime) return false;
      if (date < bt.startDate || date > bt.endDate) return false;

      const [bsh, bsm] = bt.startTime.split(':').map(Number);
      const [beh, bem] = bt.endTime.split(':').map(Number);
      const bStart = bsh * 60 + bsm;
      const bEnd = beh * 60 + bem;

      // Overlap: slot se prepleta z blokado
      return !(slotEnd <= bStart || currentTime >= bEnd);
    });

    // Preveri ali slot ni zaseden z obstoječim appointmentom
    const hasConflict = existingAppointments.some(apt => {
      if (apt.date !== date) return false;
      const [ash, asm] = apt.startTime.split(':').map(Number);
      const [aeh, aem] = apt.endTime.split(':').map(Number);
      const aStart = ash * 60 + asm;
      const aEnd = aeh * 60 + aem;
      return !(slotEnd <= aStart || currentTime >= aEnd);
    });

    if (!isSlotBlocked && !hasConflict) {
      slots.push({
        id: `${date}-${startStr}`,
        therapistId: availability.therapistId,
        date,
        startTime: startStr,
        endTime: endStr,
        isAvailable: true,
      });
    }

    currentTime += appointmentDuration + breakDuration;
  }

  return slots;
}

export function generateSlotsForDateRange(
  startDate: string,
  endDate: string,
  availability: TherapistAvailability,
  blockedTimes: BlockedTime[],
  existingAppointments: Appointment[]
): AppointmentSlot[] {
  const slots: AppointmentSlot[] = [];
  const start = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    slots.push(...generateSlotsForDate(dateStr, availability, blockedTimes, existingAppointments));
  }

  return slots;
}

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