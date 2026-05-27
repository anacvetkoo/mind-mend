import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPaymentIntent } from '../payments';
import { getAuth } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
}));

describe('Payments Service', () => {
  // Shranimo si originalni globalni fetch, da ga po testih vrnemo nazaj
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    // Nastavimo lažno okoljsko spremenljivko za URL funkcij
    import.meta.env.VITE_FUNCTIONS_BASE_URL = 'https://mock-functions-url.com';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockPaymentData = {
    amount: 5000, // 50.00 EUR
    therapistId: 'therapist_xyz',
    therapistName: 'Dr. Novak',
    appointmentType: 'video',
    date: '2026-06-01',
    startTime: '14:00',
  };

  describe('Authentication guard', () => {
    it('should throw an error if user is not authenticated', async () => {
      // Simuliramo da nihče ni vpisan
      vi.mocked(getAuth).mockReturnValue({ currentUser: null } as any);

      await expect(createPaymentIntent(mockPaymentData))
        .rejects
        .toThrow('User must be authenticated before payment.');
    });
  });

  describe('createPaymentIntent success', () => {
    it('should successfully fetch clientSecret from Cloud Functions', async () => {
      // Simuliramo prijavljenega uporabnika, ki uspešno vrne Firebase ID Token
      const mockGetIdToken = vi.fn().mockResolvedValue('mock-firebase-id-token');
      vi.mocked(getAuth).mockReturnValue({
        currentUser: {
          uid: 'user_123',
          getIdToken: mockGetIdToken,
        },
      } as any);

      // Lažiramo uspešen odziv zalednega API-ja (fetch)
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ clientSecret: 'pi_123_secret_xyz' }),
      } as any);

      const clientSecret = await createPaymentIntent(mockPaymentData);

      expect(clientSecret).toBe('pi_123_secret_xyz');
      expect(mockGetIdToken).toHaveBeenCalled();
      
      // Preverimo, če je fetch poslal pravilne glave (Headers) in žeton
      expect(global.fetch).toHaveBeenCalledWith(
        'https://mock-functions-url.com/createPaymentIntent',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-firebase-id-token',
          },
          body: JSON.stringify(mockPaymentData),
        })
      );
    });
  });

  describe('createPaymentIntent error handling', () => {
    it('should throw an error if the server response is not ok', async () => {
      vi.mocked(getAuth).mockReturnValue({
        currentUser: {
          getIdToken: vi.fn().mockResolvedValue('token'),
        },
      } as any);

      // Simuliramo, da je strežnik vrnil napako
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Stripe Card Declined' }),
      } as any);

      await expect(createPaymentIntent(mockPaymentData))
        .rejects
        .toThrow('Stripe Card Declined');
    });
  });
});