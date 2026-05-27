import { describe, it, expect, vi } from 'vitest';
import { countRecentCheckIns } from '../checkInUtils';

vi.mock('../../services/firebaseConfig', () => ({
    db: {},
    auth: {},
    storage: {}
  }));

describe('checkInUtils - countRecentCheckIns', () => {
  it('should return 0 if check-ins list is empty', () => {
    const result = countRecentCheckIns([], 7);
    expect(result).toBe(0);
  });

  it('should correctly count check-ins within the last N days', () => {
    const today = new Date().toISOString().split('T')[0];
    const mockCheckIns = [{ date: today }];
    
    const result = countRecentCheckIns(mockCheckIns, 7);
    expect(result).toBe(1);
  });
});