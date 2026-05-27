import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStreakDataFromFirestore } from '../StreakCalculator.js';
import { auth, db } from '../../services/firebaseConfig';
import { getDocs } from 'firebase/firestore';

vi.mock('../../services/firebaseConfig', () => ({
  auth: { currentUser: null },
  db: {}
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    getDocs: vi.fn(),
  };
});

describe('getStreakDataFromFirestore', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return {0, 0} if user is not authenticated', async () => {
    vi.spyOn(auth, 'currentUser', 'get').mockReturnValue(null);

    const result = await getStreakDataFromFirestore();
    expect(result).toEqual({ current: 0, longest: 0 });
  });

  it('should return {0, 0} if user has no diary entries', async () => {
    vi.spyOn(auth, 'currentUser', 'get').mockReturnValue({ uid: 'user123' } as any);

    vi.mocked(getDocs).mockResolvedValueOnce({
      forEach: (callback: any) => {},
      empty: true,
      docs: []
    } as any);

    const result = await getStreakDataFromFirestore();
    expect(result).toEqual({ current: 0, longest: 0 });
  });

  it('should correctly calculate active streak if user posted today and yesterday', async () => {
    vi.spyOn(auth, 'currentUser', 'get').mockReturnValue({ uid: 'user123' } as any);

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const mockDocs = [
      { data: () => ({ date: todayStr }) },
      { data: () => ({ date: yesterdayStr }) }
    ];

    vi.mocked(getDocs).mockResolvedValueOnce({
      forEach: (callback: any) => mockDocs.forEach(callback),
    } as any);

    const result = await getStreakDataFromFirestore();
    expect(result).toEqual({ current: 2, longest: 2 });
  });

  it('should calculate longest streak even if current streak is broken', async () => {
    vi.spyOn(auth, 'currentUser', 'get').mockReturnValue({ uid: 'user123' } as any);

    const mockDocs = [
      { data: () => ({ date: '2026-05-20' }) },
      { data: () => ({ date: '2026-05-19' }) },
      { data: () => ({ date: '2026-05-18' }) }
    ];

    vi.mocked(getDocs).mockResolvedValueOnce({
      forEach: (callback: any) => mockDocs.forEach(callback),
    } as any);

    const result = await getStreakDataFromFirestore();
    
    expect(result.current).toBe(0);
    expect(result.longest).toBe(3);
  });
});