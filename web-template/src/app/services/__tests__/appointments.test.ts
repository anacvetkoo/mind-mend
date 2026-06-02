import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createAppointment,
  getAppointmentsForUser,
  updateAppointmentStatus,
  isAppointmentUpcoming,
  isAppointmentPast,
} from '../appointments';
import { db } from '../firebaseConfig';
import { addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { upsertClientFileForAppointment } from '../clientFiles';

vi.mock('../firebaseConfig', () => ({
  db: {},
}));

vi.mock('../clientFiles', () => ({
  upsertClientFileForAppointment: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    serverTimestamp: vi.fn(() => 'mocked-timestamp'),
    increment: vi.fn((val: number) => ({ type: 'increment', value: val })),
  };
});

describe('Appointments Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('should create an appointment and trigger client file upsert', async () => {
      //lažni odziv za ustvarjen dokument
      vi.mocked(addDoc).mockResolvedValueOnce({ id: 'new_apt_123' } as any);

      const mockData = {
        therapistId: 't1',
        therapistName: 'Dr. Novak',
        userId: 'u1',
        userName: 'Anže',
        date: '2026-06-01',
        startTime: '10:00',
        endTime: '11:00',
        appointmentType: 'video' as any,
        price: 60,
        status: 'CONFIRMED' as any,
      };

      const result = await createAppointment(mockData);

      expect(result).toBe('new_apt_123');
      expect(addDoc).toHaveBeenCalled();
      expect(upsertClientFileForAppointment).toHaveBeenCalledWith({
        therapistId: 't1',
        userId: 'u1',
        userName: 'Anže',
        appointmentType: 'video',
        appointmentDate: '2026-06-01',
      });
    });
  });

  describe('getAppointmentsForUser', () => {
    it('should fetch appointments and map Firestore timestamps correctly', async () => {
      const mockToDate = vi.fn(() => new Date('2026-05-27T12:00:00.000Z'));
      const mockDoc = {
        id: 'apt_99',
        data: () => ({
          therapistId: 't1',
          userId: 'u1',
          date: '2026-06-01',
          createdAt: { toDate: mockToDate },
          updatedAt: { toDate: mockToDate },
        }),
      };

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [mockDoc],
      } as any);

      const appointments = await getAppointmentsForUser('u1');

      expect(appointments).toHaveLength(1);
      expect(appointments[0].id).toBe('apt_99');
      //preverimo pravilno mapiranje v ISO String
      expect(appointments[0].createdAt).toBe('2026-05-27T12:00:00.000Z');
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should call updateDoc with the correct status', async () => {
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined as any);

      await updateAppointmentStatus('apt_123', 'COMPLETED');

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('Helpers (isAppointmentUpcoming & isAppointmentPast)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      //27. maj 2026 ob 12:00
      vi.setSystemTime(new Date('2026-05-27T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should identify upcoming appointment correctly', () => {
      const upcomingApt = {
        date: '2026-05-27',
        endTime: '13:00',
        status: 'CONFIRMED',
      } as any;

      expect(isAppointmentUpcoming(upcomingApt)).toBe(true);
      expect(isAppointmentPast(upcomingApt)).toBe(false);
    });

    it('should identify past or completed appointment correctly', () => {
      const pastApt = {
        date: '2026-05-27',
        endTime: '11:00', // Že mimo (ura je 12:00)
        status: 'CONFIRMED',
      } as any;

      const completedApt = {
        date: '2026-05-27',
        endTime: '15:00',
        status: 'COMPLETED', // Končan, čeprav je ura šele 12:00
      } as any;

      expect(isAppointmentPast(pastApt)).toBe(true);
      expect(isAppointmentPast(completedApt)).toBe(true);
      expect(isAppointmentUpcoming(pastApt)).toBe(false);
    });
  });
});