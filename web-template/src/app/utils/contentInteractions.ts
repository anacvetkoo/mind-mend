// Content interaction utilities for likes and bookmarks

const LIKES_KEY = 'content_likes';
const BOOKMARKS_KEY = 'content_bookmarks';
const LIKE_COUNTS_KEY = 'content_like_counts';

export interface ContentInteractions {
  likedContent: Set<number>;
  bookmarkedContent: Set<number>;
  likeCounts: Map<number, number>;
}

// Initialize default like counts for demo content
const defaultLikeCounts: Record<number, number> = {
  1: 234,
  2: 189,
  3: 412,
  4: 156,
  5: 298,
  6: 345
};

export function getContentInteractions(): ContentInteractions {
  const likesStr = localStorage.getItem(LIKES_KEY);
  const bookmarksStr = localStorage.getItem(BOOKMARKS_KEY);
  const likeCountsStr = localStorage.getItem(LIKE_COUNTS_KEY);

  const likedContent = likesStr ? new Set<number>(JSON.parse(likesStr)) : new Set<number>();
  const bookmarkedContent = bookmarksStr ? new Set<number>(JSON.parse(bookmarksStr)) : new Set<number>();

  let likeCounts: Map<number, number>;
  if (likeCountsStr) {
    likeCounts = new Map(JSON.parse(likeCountsStr));
  } else {
    // Initialize with defaults
    likeCounts = new Map(Object.entries(defaultLikeCounts).map(([k, v]) => [Number(k), v]));
    localStorage.setItem(LIKE_COUNTS_KEY, JSON.stringify(Array.from(likeCounts.entries())));
  }

  return { likedContent, bookmarkedContent, likeCounts };
}

export function toggleLike(contentId: number): { liked: boolean; newCount: number } {
  const { likedContent, likeCounts } = getContentInteractions();

  const isLiked = likedContent.has(contentId);

  if (isLiked) {
    likedContent.delete(contentId);
    const currentCount = likeCounts.get(contentId) || 0;
    likeCounts.set(contentId, Math.max(0, currentCount - 1));
  } else {
    likedContent.add(contentId);
    const currentCount = likeCounts.get(contentId) || 0;
    likeCounts.set(contentId, currentCount + 1);
  }

  // Save to localStorage
  localStorage.setItem(LIKES_KEY, JSON.stringify(Array.from(likedContent)));
  localStorage.setItem(LIKE_COUNTS_KEY, JSON.stringify(Array.from(likeCounts.entries())));

  return {
    liked: !isLiked,
    newCount: likeCounts.get(contentId) || 0
  };
}

export function toggleBookmark(contentId: number): boolean {
  const { bookmarkedContent } = getContentInteractions();

  const isBookmarked = bookmarkedContent.has(contentId);

  if (isBookmarked) {
    bookmarkedContent.delete(contentId);
  } else {
    bookmarkedContent.add(contentId);
  }

  // Save to localStorage
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(bookmarkedContent)));

  return !isBookmarked;
}

export function isLiked(contentId: number): boolean {
  const { likedContent } = getContentInteractions();
  return likedContent.has(contentId);
}

export function isBookmarked(contentId: number): boolean {
  const { bookmarkedContent } = getContentInteractions();
  return bookmarkedContent.has(contentId);
}

export function getLikeCount(contentId: number): number {
  const { likeCounts } = getContentInteractions();
  return likeCounts.get(contentId) || 0;
}

export function getLikedContentIds(): number[] {
  const { likedContent } = getContentInteractions();
  return Array.from(likedContent);
}

export function getBookmarkedContentIds(): number[] {
  const { bookmarkedContent } = getContentInteractions();
  return Array.from(bookmarkedContent);
}
