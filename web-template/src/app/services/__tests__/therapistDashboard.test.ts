import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTherapistDashboardStats } from '../therapistDashboard';
import type { Appointment } from '../../types/appointments';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, where } from 'firebase/firestore';
 
/**
 * Unit under test: getTherapistDashboardStats (services/therapistDashboard.ts).
 *
 * Expected behaviour:
 * - totalSessions: CONFIRMED appointments whose end time is already in the past (strictly before now).
 * - activeClients: number of client files of the therapist with status "active".
 * - contentPublished: content of the therapist that is not a draft.
 * - rating: the therapist's rating when it is a number, otherwise null.
 *
 * Naming convention: describe('<function> - <statistic>') > it('<counts/returns ...> <result> when <condition>').
 * Mocks: Firestore is replaced with vi.fn() doubles that answer by collection name (so the tests do not
 * depend on the order of the queries); the clock is replaced with fake timers.
 * "Now" is 2026-05-27 12:00 (local time).
 */
 
vi.mock('../firebaseConfig', () => ({
  db: {},
}));
 
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    // A "query" is represented by the name of its collection, so getDocs can answer by name
    collection: vi.fn((_db: unknown, name: string) => name),
    query: vi.fn((collectionName: string) => collectionName),
    where: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
  };
});
 
const buildAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: 'apt_1',
  therapistId: 'therapist_1',
  therapistName: 'Dr. Novak',
  userId: 'user_1',
  userName: 'Ana',
  appointmentType: 'Chat',
  date: '2026-05-26',
  startTime: '10:00',
  endTime: '11:00',
  status: 'CONFIRMED',
  price: 50,
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
  ...overrides,
});
 
interface FirestoreFixture {
  clientFileCount?: number;
  content?: { isDraft?: boolean }[];
  therapist?: Record<string, unknown> | null;
}
 
/** Makes the mocked Firestore return the given client files, content documents and therapist profile. */
const givenFirestore = ({ clientFileCount = 0, content = [], therapist = null }: FirestoreFixture = {}) => {
  vi.mocked(getDocs).mockImplementation((async (queryName: string) => {
    if (queryName === 'clientFiles') return { size: clientFileCount, docs: [] };
    if (queryName === 'content') return { size: content.length, docs: content.map((data) => ({ data: () => data })) };
    throw new Error(`unexpected query ${queryName}`);
  }) as never);
 
  vi.mocked(getDoc).mockResolvedValue({
    exists: () => therapist !== null,
    data: () => therapist,
  } as never);
};
 
describe('getTherapistDashboardStats', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-27T12:00:00'));
    vi.clearAllMocks();
    vi.mocked(doc).mockReturnValue('therapist-ref' as never);
    givenFirestore();
  });
 
  afterEach(() => {
    vi.useRealTimers();
  });
 
  describe('getTherapistDashboardStats - empty dashboard', () => {
    it('returns zero counts and a null rating for a therapist without any data', async () => {
      const stats = await getTherapistDashboardStats('therapist_1', []);
 
      expect(stats).toEqual({ totalSessions: 0, activeClients: 0, contentPublished: 0, rating: null });
    });
  });
 
  describe('getTherapistDashboardStats - totalSessions', () => {
    it('counts a confirmed appointment that ended on an earlier day', async () => {
      const stats = await getTherapistDashboardStats('therapist_1', [buildAppointment({ date: '2026-05-26' })]);
 
      expect(stats.totalSessions).toBe(1);
    });
 
    it('counts a confirmed appointment that ended earlier today', async () => {
      const appointment = buildAppointment({ date: '2026-05-27', startTime: '10:00', endTime: '11:59' });
 
      expect((await getTherapistDashboardStats('therapist_1', [appointment])).totalSessions).toBe(1);
    });
 
    it('does not count an appointment that ends exactly now', async () => {
      const appointment = buildAppointment({ date: '2026-05-27', startTime: '11:00', endTime: '12:00' });
 
      expect((await getTherapistDashboardStats('therapist_1', [appointment])).totalSessions).toBe(0);
    });
 
    it('does not count a confirmed appointment that is still running or upcoming', async () => {
      const running = buildAppointment({ id: 'a', date: '2026-05-27', startTime: '11:30', endTime: '12:30' });
      const upcoming = buildAppointment({ id: 'b', date: '2026-05-28' });
 
      expect((await getTherapistDashboardStats('therapist_1', [running, upcoming])).totalSessions).toBe(0);
    });
 
    it.each(['REQUESTED', 'PENDING_PAYMENT', 'CANCELLED', 'CANCELLED_BY_THERAPIST', 'PAYMENT_FAILED'] as const)(
      'does not count a past appointment with the status %s',
      async (status) => {
        const stats = await getTherapistDashboardStats('therapist_1', [buildAppointment({ status })]);
 
        expect(stats.totalSessions).toBe(0);
      }
    );
 
    it('counts only the matching appointments from a mixed list', async () => {
      const appointments = [
        buildAppointment({ id: 'a', date: '2026-05-20' }),
        buildAppointment({ id: 'b', date: '2026-05-21' }),
        buildAppointment({ id: 'c', date: '2026-05-22', status: 'CANCELLED' }),
        buildAppointment({ id: 'd', date: '2026-06-01' }),
      ];
 
      expect((await getTherapistDashboardStats('therapist_1', appointments)).totalSessions).toBe(2);
    });
  });
 
  describe('getTherapistDashboardStats - activeClients', () => {
    it('returns the number of active client files of the therapist', async () => {
      givenFirestore({ clientFileCount: 4 });
 
      const stats = await getTherapistDashboardStats('therapist_1', []);
 
      expect(stats.activeClients).toBe(4);
    });
 
    it('queries the client files of this therapist that are active', async () => {
      await getTherapistDashboardStats('therapist_7', []);
 
      expect(collection).toHaveBeenCalledWith(db, 'clientFiles');
      expect(where).toHaveBeenCalledWith('therapistId', '==', 'therapist_7');
      expect(where).toHaveBeenCalledWith('status', '==', 'active');
    });
  });
 
  describe('getTherapistDashboardStats - contentPublished', () => {
    it('does not count drafts', async () => {
      givenFirestore({ content: [{ isDraft: true }, {}, {}, { isDraft: true }] });
 
      expect((await getTherapistDashboardStats('therapist_1', [])).contentPublished).toBe(2);
    });
 
    it('counts a content item without the isDraft field as published', async () => {
      givenFirestore({ content: [{}] });
 
      expect((await getTherapistDashboardStats('therapist_1', [])).contentPublished).toBe(1);
    });
 
    it('returns 0 when all content is still a draft', async () => {
      givenFirestore({ content: [{ isDraft: true }, { isDraft: true }] });
 
      expect((await getTherapistDashboardStats('therapist_1', [])).contentPublished).toBe(0);
    });
 
    it('queries the content of this therapist', async () => {
      await getTherapistDashboardStats('therapist_7', []);
 
      expect(collection).toHaveBeenCalledWith(db, 'content');
      expect(where).toHaveBeenCalledWith('therapistId', '==', 'therapist_7');
    });
  });
 
  describe('getTherapistDashboardStats - rating', () => {
    it('returns the rating stored on the therapist profile', async () => {
      givenFirestore({ therapist: { rating: 4.5 } });
 
      expect((await getTherapistDashboardStats('therapist_1', [])).rating).toBe(4.5);
    });
 
    it('keeps a rating of 0 instead of treating it as missing', async () => {
      givenFirestore({ therapist: { rating: 0 } });
 
      expect((await getTherapistDashboardStats('therapist_1', [])).rating).toBe(0);
    });
 
    it('returns null when the profile has no rating', async () => {
      givenFirestore({ therapist: { firstName: 'Maja' } });
 
      expect((await getTherapistDashboardStats('therapist_1', [])).rating).toBeNull();
    });
 
    it('returns null when the rating is not a number', async () => {
      givenFirestore({ therapist: { rating: '4.5' } });
 
      expect((await getTherapistDashboardStats('therapist_1', [])).rating).toBeNull();
    });
 
    it('returns null when the therapist document does not exist', async () => {
      givenFirestore({ therapist: null });
 
      expect((await getTherapistDashboardStats('therapist_1', [])).rating).toBeNull();
    });
 
    it('reads the profile from users/<therapistId>', async () => {
      await getTherapistDashboardStats('therapist_7', []);
 
      expect(doc).toHaveBeenCalledWith(db, 'users', 'therapist_7');
      expect(getDoc).toHaveBeenCalledWith('therapist-ref');
    });
  });
 
  describe('getTherapistDashboardStats - failures', () => {
    it('rejects with the Firestore error when a query fails', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('unavailable'));
 
      await expect(getTherapistDashboardStats('therapist_1', [])).rejects.toThrow('unavailable');
    });
  });
});
 