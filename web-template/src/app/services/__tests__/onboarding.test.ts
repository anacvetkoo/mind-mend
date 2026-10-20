import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { completeUserOnboarding } from '../onboarding';
import type { OnboardingData } from '../onboarding';
import { db } from '../firebaseConfig';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
 
/**
 * Unit under test: completeUserOnboarding (services/onboarding.ts).
 *
 * Saves the questionnaire answers: the user document gets only meaningful answers
 * (empty, "no" and "skip" answers are dropped) and a journal entry of type "onboarding" is added.
 * Naming convention: describe('<function> - <topic>') > it('<saves/skips/...> <result> when <condition>').
 * Mocks: Firestore functions are vi.fn() test doubles, the clock is replaced with fake timers.
 * "Now" is 2026-05-27 12:00 UTC.
 */
 
vi.mock('../firebaseConfig', () => ({
  db: {},
}));
 
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    doc: vi.fn(),
    collection: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mocked-timestamp'),
  };
});
 
const BASE_FLAGS = { hasCompletedOnboarding: true, hasCompletedQuestionnaire: true };
 
/** The data written to the user document (second argument of the first setDoc call). */
const savedUserData = () => vi.mocked(setDoc).mock.calls[0][1] as Record<string, unknown>;
 
/** The data written to the journal (second argument of the first addDoc call). */
const savedJournalData = () => vi.mocked(addDoc).mock.calls[0][1] as Record<string, unknown>;
 
describe('completeUserOnboarding', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-27T12:00:00Z'));
    vi.clearAllMocks();
    vi.mocked(doc).mockReturnValue('user-ref' as never);
    vi.mocked(collection).mockReturnValue('journal-ref' as never);
    vi.mocked(setDoc).mockResolvedValue(undefined);
    vi.mocked(addDoc).mockResolvedValue({ id: 'journal_1' } as never);
  });
 
  afterEach(() => {
    vi.useRealTimers();
  });
 
  describe('completeUserOnboarding - user document', () => {
    it('merges the onboarding flags and the trimmed name into users/<uid>', async () => {
      await completeUserOnboarding('user_1', { name: '  Ana  ' });
 
      expect(doc).toHaveBeenCalledWith(db, 'users', 'user_1');
      expect(setDoc).toHaveBeenCalledWith(
        'user-ref',
        { ...BASE_FLAGS, displayName: 'Ana' },
        { merge: true }
      );
    });
 
    it('saves every answer that has a meaningful value', async () => {
      const data: OnboardingData = {
        name: 'Ana',
        gender: 'Female',
        age: 29,
        professionalHelp: 'yes',
        physicalDistress: 'sometimes',
        medications: 'yes',
        medicationSpec: ['Sertraline'],
        symptoms: ['Insomnia', 'Fatigue'],
        checkInTime: 'evening',
      };
 
      await completeUserOnboarding('user_1', data);
 
      expect(savedUserData()).toEqual({
        ...BASE_FLAGS,
        displayName: 'Ana',
        gender: 'Female',
        age: 29,
        professionalHelp: 'yes',
        physicalDistress: 'sometimes',
        medications: 'yes',
        medicationSpec: ['Sertraline'],
        symptoms: ['Insomnia', 'Fatigue'],
        checkInTime: 'evening',
      });
    });
 
    it.each([
      ['professionalHelp', 'no'],
      ['physicalDistress', 'no'],
      ['medications', 'no'],
      ['gender', 'skip'],
      ['professionalHelp', 'skip'],
      ['checkInTime', 'skip'],
    ])('does not save %s when the answer is "%s"', async (field, answer) => {
      await completeUserOnboarding('user_1', { name: 'Ana', [field]: answer } as OnboardingData);
 
      expect(savedUserData()).not.toHaveProperty(field);
    });
 
    it.each(['symptoms', 'medicationSpec'])('does not save %s when the list is empty', async (field) => {
      await completeUserOnboarding('user_1', { name: 'Ana', [field]: [] } as OnboardingData);
 
      expect(savedUserData()).not.toHaveProperty(field);
    });
 
    it('does not save answers that are undefined or null', async () => {
      await completeUserOnboarding('user_1', {
        name: 'Ana',
        gender: undefined,
        age: null as unknown as number,
      });
 
      expect(savedUserData()).toEqual({ ...BASE_FLAGS, displayName: 'Ana' });
    });
 
    it('keeps an age of 0 because it is a real number and not a missing answer', async () => {
      await completeUserOnboarding('user_1', { name: 'Ana', age: 0 });
 
      expect(savedUserData()).toHaveProperty('age', 0);
    });
 
    it('does not store the journal-only answers healthGoal and mood on the user document', async () => {
      await completeUserOnboarding('user_1', { name: 'Ana', healthGoal: 'Sleep better', mood: 'Calm' });
 
      expect(savedUserData()).not.toHaveProperty('healthGoal');
      expect(savedUserData()).not.toHaveProperty('mood');
    });
 
    // Known weakness: a blank name is saved as an empty displayName and overwrites the existing one.
    // Remove `.fails` once a blank name is skipped.
    it.fails('does not overwrite the display name with an empty string', async () => {
      await completeUserOnboarding('user_1', { name: '   ' });
 
      expect(savedUserData()).not.toHaveProperty('displayName');
    });
  });
 
  describe('completeUserOnboarding - journal entry', () => {
    it('adds an onboarding entry with the user id and today\'s date to the dnevniki collection', async () => {
      await completeUserOnboarding('user_1', { name: 'Ana' });
 
      expect(collection).toHaveBeenCalledWith(db, 'dnevniki');
      expect(addDoc).toHaveBeenCalledWith('journal-ref', {
        userId: 'user_1',
        datum: '2026-05-27',
        type: 'onboarding',
      });
    });
 
    it('includes the health goal and the mood when they are answered', async () => {
      await completeUserOnboarding('user_1', { name: 'Ana', healthGoal: 'Sleep better', mood: 'Calm' });
 
      expect(savedJournalData()).toMatchObject({ healthGoal: 'Sleep better', mood: 'Calm' });
    });
 
    it.each([
      ['healthGoal', 'skip'],
      ['mood', 'skip'],
      ['healthGoal', 'no'],
    ])('leaves out %s when the answer is "%s"', async (field, answer) => {
      await completeUserOnboarding('user_1', { name: 'Ana', [field]: answer } as OnboardingData);
 
      expect(savedJournalData()).not.toHaveProperty(field);
    });
  });
 
  describe('completeUserOnboarding - failures', () => {
    it('rejects with the Firestore error and writes no journal entry when saving the user fails', async () => {
      vi.mocked(setDoc).mockRejectedValueOnce(new Error('permission denied'));
 
      await expect(completeUserOnboarding('user_1', { name: 'Ana' })).rejects.toThrow('permission denied');
      expect(addDoc).not.toHaveBeenCalled();
    });
 
    it('rejects with the Firestore error when adding the journal entry fails', async () => {
      vi.mocked(addDoc).mockRejectedValueOnce(new Error('quota exceeded'));
 
      await expect(completeUserOnboarding('user_1', { name: 'Ana' })).rejects.toThrow('quota exceeded');
    });
  });
});
 