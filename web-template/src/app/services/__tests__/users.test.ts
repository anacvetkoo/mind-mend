import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createUserDocument,
  getUserDocument,
  getTherapistById,
  updateUserDarkMode
} from '../users';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

vi.mock('../firebaseConfig', () => ({
  db: {},
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    serverTimestamp: vi.fn(() => 'mocked-timestamp'),
  };
});

describe('Users Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserDocument', () => {
    it('should create a user document with default values', async () => {
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await createUserDocument('user_999', {
        email: 'test@mindmend.com',
        displayName: 'Janez Novak',
      });

      expect(setDoc).toHaveBeenCalledWith(
        undefined, // docRef, ki ga mock vrne kot undefined
        expect.objectContaining({
          email: 'test@mindmend.com',
          displayName: 'Janez Novak',
          role: 'user',
          hasCompletedOnboarding: false,
        })
      );
    });
  });

  describe('getUserDocument', () => {
    it('should return null if user does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await getUserDocument('non_existent');
      expect(result).toBeNull();
    });

    it('should return user data if user exists', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'user_123',
        data: () => ({
          email: 'user@test.com',
          role: 'user',
        }),
      } as any);

      const result = await getUserDocument('user_123');
      expect(result).toEqual({
        uid: 'user_123',
        email: 'user@test.com',
        role: 'user',
      });
    });
  });

  describe('mapTherapistData & getTherapistById', () => {
    it('should fallback gracefully and construct name from first/last name if displayName is missing', async () => {
      // Simuliramo terapevta, ki nima nastavljenega displayName, ampak samo ime in priimek
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'therapist_77',
        data: () => ({
          firstName: 'Maja',
          lastName: 'Kralj',
          role: 'therapist',
          title: 'Psihoterapevtka',
        }),
      } as any);

      // Simuliramo, da nima objavljenih vsebin (prazen snapshot)
      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
      } as any);

      const therapist = await getTherapistById('therapist_77');

      expect(therapist).not.toBeNull();
      // Testirava tvojo kompleksno "getStringValue" logiko spajanja imena:
      expect(therapist?.name).toBe('Maja Kralj');
      expect(therapist?.title).toBe('Psihoterapevtka');
      expect(therapist?.rating).toBe(0); // Default je 0 — terapevti brez ocen
    });
  });

  describe('updateUserDarkMode', () => {
    it('should call setDoc with merge option', async () => {
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await updateUserDarkMode('user_123', true);

      expect(setDoc).toHaveBeenCalledWith(
        undefined,
        { darkMode: true },
        { merge: true }
      );
    });
  });
});