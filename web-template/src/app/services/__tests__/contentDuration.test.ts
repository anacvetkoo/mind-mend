import { describe, it, expect, vi } from 'vitest';
import { formatContentDuration, formatContentDurationFromSeconds } from '../content';
 
/**
 * Unit under test: formatContentDuration and formatContentDurationFromSeconds (services/content.ts).
 *
 * Both functions turn a loosely typed duration into the label shown on content cards ("12 min").
 * Naming convention: describe('<function>') > it('returns <result> when <condition>').
 * Mock: only the Firebase config is replaced, so importing content.ts does not start Firebase.
 */
 
vi.mock('../firebaseConfig', () => ({
  db: {},
  storage: {},
  auth: { currentUser: null },
}));
 
describe('formatContentDuration', () => {
  describe('valid input', () => {
    it.each([
      [10, '10 min'],
      ['10', '10 min'],
      ['10 min', '10 min'],
      [' 15 ', '15 min'],
      ['120', '120 min'],
    ])('returns the number of minutes for %j', (input, expected) => {
      expect(formatContentDuration(input)).toBe(expected);
    });
 
    it.each([
      ['12.2', '13 min'],
      ['12.9', '13 min'],
      [0.2, '1 min'],
    ])('rounds the fractional duration %j up to whole minutes', (input, expected) => {
      expect(formatContentDuration(input)).toBe(expected);
    });
 
    it('keeps an exact whole number of minutes unchanged', () => {
      expect(formatContentDuration('12.0')).toBe('12 min');
    });
  });
 
  describe('missing or empty input', () => {
    it('returns the 1 min default when the duration is undefined', () => {
      expect(formatContentDuration(undefined)).toBe('1 min');
    });
 
    it('returns the 1 min default when the duration is null', () => {
      expect(formatContentDuration(null as unknown as string)).toBe('1 min');
    });
 
    it.each(['', '   '])('returns the 1 min default for the blank string %j', (input) => {
      expect(formatContentDuration(input)).toBe('1 min');
    });
  });
 
  describe('invalid input', () => {
    it.each([
      ['abc'],
      ['min'],
      ['1.5.2'],
      [0],
      ['0'],
      [NaN],
      [Infinity],
    ])('returns the 1 min default for the unusable value %j', (input) => {
      expect(formatContentDuration(input as string | number)).toBe('1 min');
    });
 
    // Known bug: the minus sign is stripped together with the other non-digit characters,
    // so -5 becomes "5 min". Remove `.fails` once negative values are rejected.
    it.fails('returns the 1 min default for a negative duration', () => {
      expect(formatContentDuration(-5)).toBe('1 min');
    });
  });
});
 
describe('formatContentDurationFromSeconds', () => {
  it.each([
    [600, '10 min'],
    [3599, '60 min'],
    [3600, '60 min'],
  ])('converts %d seconds to whole minutes', (seconds, expected) => {
    expect(formatContentDurationFromSeconds(seconds)).toBe(expected);
  });
 
  it.each([
    [60, '1 min'],
    [61, '2 min'],
    [90, '2 min'],
    [119, '2 min'],
    [120, '2 min'],
    [121, '3 min'],
  ])('rounds %d seconds up to the next full minute', (seconds, expected) => {
    expect(formatContentDurationFromSeconds(seconds)).toBe(expected);
  });
 
  it.each([[1], [30], [59]])('returns 1 min for the very short duration of %d seconds', (seconds) => {
    expect(formatContentDurationFromSeconds(seconds)).toBe('1 min');
  });
 
  it.each([
    ['undefined', undefined],
    ['zero', 0],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['-Infinity', -Infinity],
    ['a negative number', -30],
  ])('returns the 1 min default when the input is %s', (_label, seconds) => {
    expect(formatContentDurationFromSeconds(seconds as number | undefined)).toBe('1 min');
  });
});