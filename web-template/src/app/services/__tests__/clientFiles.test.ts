import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  upsertClientFileForAppointment,
  getClientFileDetails,
  updateClientAppointmentNotes
} from '../clientFiles';
import { db } from '../firebaseConfig';
import { setDoc, getDoc, getDocs, updateDoc, deleteField } from 'firebase/firestore';

vi.mock('../firebaseConfig', () => ({
  db: {},
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    deleteField: vi.fn(() => '__delete_field_trigger__'),
    serverTimestamp: vi.fn(() => 'mocked-timestamp'),
  };
});

describe('Client Files Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-27T12:00:00'));//27. maj 2026 ob 12:00
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('upsertClientFileForAppointment', () => {
    it('should create a new client file with totalSessions=0 if it does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => false } as any);
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await upsertClientFileForAppointment({
        therapistId: 'therapist_1',
        userId: 'user_1',
        userName: 'Anže Uporabnik',
        userEmail: 'anze@test.com'
      });

      expect(setDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          totalSessions: 0,
          userName: 'Anže Uporabnik',
          status: 'active'
        })
      );
    });
  });

  describe('getClientFileDetails - Data aggregation', () => {
    it('should calculate average stress level and dominant emotion from last 30 days of check-ins', async () => {
      // mock za osnovno datoteko kartoteke (obstaja)
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'therapist_1_user_1',
        data: () => ({ therapistId: 'therapist_1', userId: 'user_1', userName: 'Anže Uporabnik' })
      } as any);

      // mock za sestanke (vrnemo prazen seznam)
      vi.mocked(getDocs).mockImplementationOnce(async () => ({ docs: [] } as any));

      // Mock za wellbeing summary (Zbirka "dnevniki")
      const mockCheckIns = [
        { data: () => ({ date: '2026-05-26', stressLevel: 4, dominantEmotion: 'Happy' }) },
        { data: () => ({ date: '2026-05-25', stressLevel: 6, dominantEmotion: 'Happy' }) },
        { data: () => ({ date: '2026-04-10', stressLevel: 10, dominantEmotion: 'Anxious' }) } // Starejši od 30 dni
      ];
      vi.mocked(getDocs).mockImplementationOnce(async () => ({ docs: mockCheckIns } as any));

      //Mock za uporabniški profil (Zbirka "users")
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ gender: 'Male', age: 25, symptoms: ['Insomnia'] })
      } as any);

      // Mock za zadnji check-in summary (Zbirka "dnevniki" ponovni klic v kodi)
      vi.mocked(getDocs).mockImplementationOnce(async () => ({ docs: [mockCheckIns[0]] } as any));

      const details = await getClientFileDetails('therapist_1', 'user_1');

      expect(details).not.toBeNull();
      // Preverimo agregacijo dobrega počutja (wellbeingSummary)
      expect(details?.wellbeingSummary.totalCheckIns).toBe(3);
      expect(details?.wellbeingSummary.recentCheckIns).toBe(2); // Samo 2 sta znotraj zadnjih 30 dni
      expect(details?.wellbeingSummary.averageStressLevel).toBe(5); // Povprečje (4 + 6) / 2 = 5
      expect(details?.wellbeingSummary.dominantEmotion).toBe('Happy'); // Najpogostejše čustvo v 30 dneh
    });
  });

  describe('updateClientAppointmentNotes', () => {
    it('should use deleteField() if notes or next steps are empty strings', async () => {
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

      // Pošljemo prazne opombe in prazne naslednje korake
      await updateClientAppointmentNotes('appointment_123', '', '   ');

      expect(updateDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          therapistNotes: '__delete_field_trigger__',
          nextSteps: '__delete_field_trigger__'
        })
      );
    });
  });
});