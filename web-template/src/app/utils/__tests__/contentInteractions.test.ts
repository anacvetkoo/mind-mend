import { describe, it, expect, beforeEach } from 'vitest';
import {
  getContentInteractions,
  toggleLike,
  toggleBookmark,
  isLiked,
  isBookmarked,
  getLikeCount,
  getLikedContentIds,
  getBookmarkedContentIds
} from '../contentInteractions';

describe('Content Interactions Utility', () => {
  
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getContentInteractions', () => {
    it('should initialize with default like counts if localStorage is empty', () => {
      const { likedContent, bookmarkedContent, likeCounts } = getContentInteractions();

      expect(likedContent.size).toBe(0);
      expect(bookmarkedContent.size).toBe(0);
      expect(likeCounts.get('1')).toBe(234);
      expect(likeCounts.get('3')).toBe(412);
    });
  });

  describe('toggleLike', () => {
    it('should successfully like a content and increment count', () => {
      // Prvi klik (všečkam id '1'): 234 -> 235 všečkov
      const result = toggleLike('1');
      
      expect(result.liked).toBe(true);
      expect(result.newCount).toBe(235);
      expect(isLiked('1')).toBe(true);
      expect(getLikeCount('1')).toBe(235);
    });

    it('should successfully unlike a content and decrement count', () => {
      // Najprej všečkamo (234 -> 235)
      toggleLike('1');
      // Drugi klik (odvšečkamo id '1'): 235 -> 234 všečkov
      const result = toggleLike('1');

      expect(result.liked).toBe(false);
      expect(result.newCount).toBe(234);
      expect(isLiked('1')).toBe(false);
    });
  });

  describe('toggleBookmark', () => {
    it('should add and remove content from bookmarks', () => {
      // Dodajanje zaznamka
      const isAdded = toggleBookmark('abc');
      expect(isAdded).toBe(true);
      expect(isBookmarked('abc')).toBe(true);
      expect(getBookmarkedContentIds()).toContain('abc');

      // Odstranjevanje zaznamka
      const isRemoved = toggleBookmark('abc');
      expect(isRemoved).toBe(false);
      expect(isBookmarked('abc')).toBe(false);
    });
  });

  describe('Id normalization', () => {
    it('should treat number IDs and string IDs identically', () => {
      // Všečkamo s številko 42
      toggleLike(42);
      
      // Preverimo s stringom '42'
      expect(isLiked('42')).toBe(true);
      expect(getLikedContentIds()).toContain('42');
    });
  });
});