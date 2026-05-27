import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSlotsForDate } from '../appointmentSlots';
import type { TherapistAvailability, BlockedTime, Appointment } from '../../types/appointments';

const mockAvailability: TherapistAvailability = {
  therapistId: 'therapist_1',
  appointmentDuration: 60,
  breakDuration: 15,
  enabledTypes: ['Chat', 'Voice Call', 'Video Call', 'In Person'],
  isSetupComplete: true,
  workingHours: [
    {
      day: 'Monday',
      enabled: true,
      startTime: '08:00',
      endTime: '11:00',
    },
    {
      day: 'Sunday',
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
    }
  ]
};

describe('generateSlotsForDate', () => {
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-25T06:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return empty array if the day is disabled or not a working day', () => {
    const slots = generateSlotsForDate('2026-05-24', mockAvailability, [], []);
    expect(slots).toEqual([]);
  });

  it('should return empty array if the full day is blocked', () => {
    const blockedTimes: BlockedTime[] = [
      {
        id: 'b1',
        therapistId: 'therapist_1',
        startDate: '2026-05-25',
        endDate: '2026-05-25',
        isFullDay: true,
        reason: 'Osebni opravek',
      }
    ];

    const slots = generateSlotsForDate('2026-05-25', mockAvailability, blockedTimes, []);
    expect(slots).toEqual([]);
  });

  it('should successfully generate available slots with correct breaks', () => {
    const slots = generateSlotsForDate('2026-05-25', mockAvailability, [], []);

    expect(slots).toHaveLength(2);
    
    expect(slots[0]).toMatchObject({
      startTime: '08:00',
      endTime: '09:00',
      isAvailable: true
    });
    expect(slots[1]).toMatchObject({
      startTime: '09:15',
      endTime: '10:15',
      isAvailable: true
    });
  });

  it('should filter out specific slots that overlap with partial-day blocked times', () => {
    const blockedTimes: BlockedTime[] = [
      {
        id: 'b2',
        therapistId: 'therapist_1',
        startDate: '2026-05-25',
        endDate: '2026-05-25',
        isFullDay: false,
        startTime: '08:00',
        endTime: '09:00',
        reason: 'Osebni opravek',
      }
    ];

    const slots = generateSlotsForDate('2026-05-25', mockAvailability, blockedTimes, []);

    expect(slots).toHaveLength(1);
    expect(slots[0].startTime).toBe('09:15');
  });

  it('should filter out slots that conflict with existing appointments', () => {
    const existingAppointments: Appointment[] = [
      {
        id: 'apt1',
        therapistId: 'therapist_1',
        userId: 'patientX',
        date: '2026-05-25',
        startTime: '09:00', // Ta termin se seka z drugim slotom (09:15 - 10:15)
        endTime: '10:00',
        status: 'CONFIRMED',
        therapistName: 'Dr. Janez Novak',
        userName: 'Anže Uporabnik',
        appointmentType: 'Chat',
        price: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    const slots = generateSlotsForDate('2026-05-25', mockAvailability, [], existingAppointments);

    // Drugi slot odpade zaradi prekrivanja, ostane samo prvi (08:00 - 09:00)
    expect(slots).toHaveLength(1);
    expect(slots[0].startTime).toBe('08:00');
  });

  it('should skip past slots if generating for today with buffer', () => {
    // Sistemski čas prestavimo na 08:45 zjutraj (danes)
    // Prvi slot (08:00 - 09:00) je že v teku/preteklosti + buffer (08:45 + 30min = 09:15)
    vi.setSystemTime(new Date('2026-05-25T08:45:00'));

    const slots = generateSlotsForDate('2026-05-25', mockAvailability, [], []);

    // Prvi slot mora biti izpuščen, na voljo je samo še tisti ob 09:15
    expect(slots).toHaveLength(1);
    expect(slots[0].startTime).toBe('09:15');
  });
});