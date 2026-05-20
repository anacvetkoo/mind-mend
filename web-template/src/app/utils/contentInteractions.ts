// Content interaction utilities for likes and bookmarks

const LIKES_KEY = 'content_likes';
const BOOKMARKS_KEY = 'content_bookmarks';
const LIKE_COUNTS_KEY = 'content_like_counts';

type ContentId = string | number;

export interface ContentInteractions {
  likedContent: Set<string>;
  bookmarkedContent: Set<string>;
  likeCounts: Map<string, number>;
}

// Initialize default like counts for demo content
const defaultLikeCounts: Record<string, number> = {
  '1': 234,
  '2': 189,
  '3': 412,
  '4': 156,
  '5': 298,
  '6': 345
};

export function getContentInteractions(): ContentInteractions {
  const likesStr = localStorage.getItem(LIKES_KEY);
  const bookmarksStr = localStorage.getItem(BOOKMARKS_KEY);
  const likeCountsStr = localStorage.getItem(LIKE_COUNTS_KEY);

  const likedContent = likesStr
    ? new Set<string>(JSON.parse(likesStr))
    : new Set<string>();

  const bookmarkedContent = bookmarksStr
    ? new Set<string>(JSON.parse(bookmarksStr))
    : new Set<string>();

  let likeCounts: Map<string, number>;

  if (likeCountsStr) {
    likeCounts = new Map(JSON.parse(likeCountsStr));
  } else {
    // Initialize with defaults
    likeCounts = new Map(Object.entries(defaultLikeCounts));

    localStorage.setItem(
      LIKE_COUNTS_KEY,
      JSON.stringify(Array.from(likeCounts.entries()))
    );
  }

  return { likedContent, bookmarkedContent, likeCounts };
}

export function toggleLike(contentId: ContentId): { liked: boolean; newCount: number } {
  const normalizedId = String(contentId);

  const { likedContent, likeCounts } = getContentInteractions();

  const liked = likedContent.has(normalizedId);

  if (liked) {
    likedContent.delete(normalizedId);

    const currentCount = likeCounts.get(normalizedId) || 0;

    likeCounts.set(normalizedId, Math.max(0, currentCount - 1));
  } else {
    likedContent.add(normalizedId);

    const currentCount = likeCounts.get(normalizedId) || 0;

    likeCounts.set(normalizedId, currentCount + 1);
  }

  // Save to localStorage
  localStorage.setItem(
    LIKES_KEY,
    JSON.stringify(Array.from(likedContent))
  );

  localStorage.setItem(
    LIKE_COUNTS_KEY,
    JSON.stringify(Array.from(likeCounts.entries()))
  );

  return {
    liked: !liked,
    newCount: likeCounts.get(normalizedId) || 0
  };
}

export function toggleBookmark(contentId: ContentId): boolean {
  const normalizedId = String(contentId);

  const { bookmarkedContent } = getContentInteractions();

  const bookmarked = bookmarkedContent.has(normalizedId);

  if (bookmarked) {
    bookmarkedContent.delete(normalizedId);
  } else {
    bookmarkedContent.add(normalizedId);
  }

  // Save to localStorage
  localStorage.setItem(
    BOOKMARKS_KEY,
    JSON.stringify(Array.from(bookmarkedContent))
  );

  return !bookmarked;
}

export function isLiked(contentId: ContentId): boolean {
  const normalizedId = String(contentId);

  const { likedContent } = getContentInteractions();

  return likedContent.has(normalizedId);
}

export function isBookmarked(contentId: ContentId): boolean {
  const normalizedId = String(contentId);

  const { bookmarkedContent } = getContentInteractions();

  return bookmarkedContent.has(normalizedId);
}

export function getLikeCount(contentId: ContentId): number {
  const normalizedId = String(contentId);

  const { likeCounts } = getContentInteractions();

  return likeCounts.get(normalizedId) || 0;
}

export function getLikedContentIds(): string[] {
  const { likedContent } = getContentInteractions();

  return Array.from(likedContent);
}

export function getBookmarkedContentIds(): string[] {
  const { bookmarkedContent } = getContentInteractions();

  return Array.from(bookmarkedContent);
}