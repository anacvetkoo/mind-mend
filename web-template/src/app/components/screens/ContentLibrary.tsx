import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Bookmark,
  BookmarkPlus,
  Brain,
  ChevronLeft,
  ChevronRight,
  Heart,
  Play,
  Search,
  Sparkles,
  TrendingUp,
  Volume2,
  Wind
} from 'lucide-react';
import { ContentDetail } from './ContentDetail';
import {
  getLibraryContent,
  incrementContentViews,
  type LibraryContentItem
} from '../../services/content';
import {
  getUserContentInteractions,
  toggleLikedContent,
  toggleSavedContent
} from '../../services/contentInteractions';

type ContentType = 'all' | 'relaxation' | 'breathing' | 'sound';
type SortOption = 'newest' | 'likes' | 'views';

interface ContentLibraryProps {
  onSelectContent?: (content: LibraryContentItem) => void;
  onViewTherapist?: (therapistId: string) => void;
}

const itemsPerPage = 5;

const categories: Array<{ id: ContentType; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'relaxation', label: 'Relaxation Exercises' },
  { id: 'breathing', label: 'Breathing Techniques' },
  { id: 'sound', label: 'Sound Therapy' }
];

const getCategoryIcon = (category: ContentType) => {
  if (category === 'breathing') return Wind;
  if (category === 'sound') return Volume2;
  return Brain;
};

const getCreatedAtDate = (createdAt: any): Date | null => {
  if (!createdAt) return null;

  if (createdAt.toDate) {
    return createdAt.toDate();
  }

  const date = new Date(createdAt);

  return Number.isNaN(date.getTime()) ? null : date;
};

const isCreatedToday = (createdAt: any) => {
  const createdDate = getCreatedAtDate(createdAt);

  if (!createdDate) return false;

  const today = new Date();

  return (
    createdDate.getDate() === today.getDate() &&
    createdDate.getMonth() === today.getMonth() &&
    createdDate.getFullYear() === today.getFullYear()
  );
};

const getContentLikes = (content: LibraryContentItem) => {
  return content.likes || 0;
};

const getEngagementScore = (content: LibraryContentItem) => {
  return getContentLikes(content) + (content.views || 0);
};

const formatDurationFromSeconds = (durationInSeconds: number) => {
  if (!Number.isFinite(durationInSeconds) || durationInSeconds <= 0) return '';

  const minutes = Math.max(1, Math.ceil(durationInSeconds / 60));

  return `${minutes} min`;
};

const formatStoredDuration = (duration?: string | number) => {
  if (!duration) return '';

  const durationText = String(duration).trim();

  if (!durationText) return '';

  if (durationText.toLowerCase().includes('min')) {
    return durationText;
  }

  return `${durationText} min`;
};

const getMediaUrl = (content: LibraryContentItem) => {
  if (content.contentType === 'video') return content.videoUrl;
  if (content.contentType === 'audio') return content.audioUrl;

  return '';
};

export function ContentLibrary({
  onSelectContent,
  onViewTherapist
}: ContentLibraryProps = {}) {
  const [contentItems, setContentItems] = useState<LibraryContentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ContentType>('all');
  const [selectedContent, setSelectedContent] = useState<LibraryContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaDurations, setMediaDurations] = useState<Record<string, string>>({});
  const [, forceUpdate] = useState({});
  const [likedContentIds, setLikedContentIds] = useState<string[]>([]);
const [savedContentIds, setSavedContentIds] = useState<string[]>([]);
  const resultsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);

        const libraryContent = await getLibraryContent();

        setContentItems(libraryContent);
      } catch (error) {
        console.error('Error loading content library:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
  let isMounted = true;

  contentItems.forEach((content) => {
    const mediaUrl = getMediaUrl(content);

    if (!mediaUrl || mediaDurations[content.id]) return;

    const mediaElement = document.createElement(
      content.contentType === 'video' ? 'video' : 'audio'
    );

    mediaElement.preload = 'metadata';
    mediaElement.src = mediaUrl;

    mediaElement.onloadedmetadata = () => {
      const durationLabel = formatDurationFromSeconds(mediaElement.duration);

      if (!durationLabel || !isMounted) return;

      setMediaDurations((previousDurations) => ({
        ...previousDurations,
        [content.id]: durationLabel
      }));
    };
  });

  return () => {
    isMounted = false;
  };
}, [contentItems, mediaDurations]);

useEffect(() => {
  let isMounted = true;

  const loadInteractions = async () => {
    const interactions = await getUserContentInteractions();

    if (!isMounted) return;

    setLikedContentIds(interactions.likedContentIds);
    setSavedContentIds(interactions.savedContentIds);
  };

  loadInteractions();

  return () => {
    isMounted = false;
  };
}, []);

  const scrollToResults = () => {
  setTimeout(() => {
    resultsSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 100);
};

  const featuredToday = useMemo(() => {
    return contentItems
      .filter((item) => isCreatedToday(item.createdAt))
      .sort((firstItem, secondItem) => getEngagementScore(secondItem) - getEngagementScore(firstItem))
      .slice(0, 3);
  }, [contentItems]);

  const moreFromTherapist = useMemo(() => {
    if (!selectedContent?.therapistId) return [];

    return contentItems
      .filter((item) => item.therapistId === selectedContent.therapistId && item.id !== selectedContent.id)
      .slice(0, 4);
  }, [contentItems, selectedContent]);

  const filteredContent = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    let items = contentItems;

    if (showTodayOnly) {
      items = items.filter((item) => isCreatedToday(item.createdAt));
    } else if (!normalizedSearch && selectedCategory !== 'all') {
  items = items.filter((item) => item.category === selectedCategory);
}

    if (normalizedSearch) {
      items = items.filter((item) => {
        return (
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.description.toLowerCase().includes(normalizedSearch) ||
          item.therapistName?.toLowerCase().includes(normalizedSearch) ||
          item.categoryLabel.toLowerCase().includes(normalizedSearch)
        );
      });
    }

    return [...items].sort((firstItem, secondItem) => {
      if (sortBy === 'likes') {
        return getContentLikes(secondItem) - getContentLikes(firstItem);
      }

      if (sortBy === 'views') {
        return (secondItem.views || 0) - (firstItem.views || 0);
      }

      const firstDate = getCreatedAtDate(firstItem.createdAt)?.getTime() || 0;
      const secondDate = getCreatedAtDate(secondItem.createdAt)?.getTime() || 0;

      return secondDate - firstDate;
    });
  }, [contentItems, searchTerm, selectedCategory, showTodayOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredContent.length / itemsPerPage));

  const paginatedContent = filteredContent.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenContent = async (content: LibraryContentItem) => {
    setSelectedContent(content);
    onSelectContent?.(content);

    try {
      await incrementContentViews(content.id);
    } catch (error) {
      console.error('Error incrementing content views:', error);
    }
  };

  const handleCategoryClick = (category: ContentType) => {
  setSelectedCategory(category);
  setSearchTerm('');
  setShowTodayOnly(false);
  setCurrentPage(1);

  scrollToResults();
};

  const handleSeeAllToday = () => {
  setShowTodayOnly(true);
  setSearchTerm('');
  setCurrentPage(1);

  scrollToResults();
};

  const handleBookmark = async (contentId: string) => {
  const isCurrentlySaved = savedContentIds.includes(contentId);

  await toggleSavedContent(contentId, isCurrentlySaved);

  setSavedContentIds((previousIds) =>
    isCurrentlySaved
      ? previousIds.filter((id) => id !== contentId)
      : [...previousIds, contentId]
  );
};

const handleLike = async (contentId: string) => {
  const isCurrentlyLiked = likedContentIds.includes(contentId);

  await toggleLikedContent(contentId, isCurrentlyLiked);

  setLikedContentIds((previousIds) =>
    isCurrentlyLiked
      ? previousIds.filter((id) => id !== contentId)
      : [...previousIds, contentId]
  );

  forceUpdate({});
};

  const getContentDuration = (content: LibraryContentItem) => {
  if (content.contentType === 'video' || content.contentType === 'audio') {
    return mediaDurations[content.id] || '';
  }

  return formatStoredDuration(content.duration);
};

  const renderFeaturedContentCard = (content: LibraryContentItem) => {
  const Icon = getCategoryIcon(content.category);

  return (
    <motion.div
      key={content.id}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleOpenContent(content)}
      className="flex-shrink-0 w-[280px] h-[140px] rounded-2xl p-5 cursor-pointer shadow-lg relative overflow-hidden"
      style={{
        background:
          content.thumbnailType === 'image' && content.thumbnailImage
            ? `linear-gradient(135deg, rgba(196, 181, 253, 0.55), rgba(124, 58, 237, 0.55)), url(${content.thumbnailImage}) center/cover`
            : content.thumbnailGradient
      }}
    >
      <div className="relative z-10">
        <span className="inline-block px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-white text-xs mb-2">
          {content.categoryLabel}
        </span>
        <h4 className="text-white text-lg mb-1 line-clamp-2">{content.title}</h4>
        <div className="flex items-center gap-2 text-white/90 text-xs">
          <span>{getContentDuration(content)}</span>
          <span>•</span>
          <span className="line-clamp-1">{content.therapistName}</span>
        </div>
      </div>

      <Icon className="absolute bottom-4 right-4 w-8 h-8 text-white/30" />
    </motion.div>
  );
};

const renderContentCard = (content: LibraryContentItem, index = 0) => {
  const Icon = getCategoryIcon(content.category);
  const itemIsBookmarked = savedContentIds.includes(content.id);
const itemIsLiked = likedContentIds.includes(content.id);
  const likeCount = getContentLikes(content);

  return (
    <motion.div
      key={content.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleOpenContent(content)}
      className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer relative"
    >
      <div className="flex gap-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
          style={{
            background:
              content.thumbnailType === 'image' && content.thumbnailImage
                ? `url(${content.thumbnailImage}) center/cover`
                : content.thumbnailGradient
          }}
        >
          {content.thumbnailType === 'image' && content.thumbnailImage ? (
            <div className="absolute inset-0 bg-black/10" />
          ) : (
            <Icon className="w-8 h-8 text-white/90" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)] text-xs">
              {content.categoryLabel}
            </span>

            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleLike(content.id);
                }}
                className="flex items-center gap-1 p-1"
              >
                <motion.div
                  animate={itemIsLiked ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      itemIsLiked
                        ? 'text-red-500 fill-red-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                </motion.div>
                <span className="text-xs text-muted-foreground">{likeCount}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleBookmark(content.id);
                }}
                className="flex-shrink-0 p-1"
              >
                {itemIsBookmarked ? (
                  <Bookmark className="w-5 h-5 text-[var(--lavender)] fill-[var(--lavender)]" />
                ) : (
                  <BookmarkPlus className="w-5 h-5 text-muted-foreground" />
                )}
              </motion.button>
            </div>
          </div>

          <h4 className="text-foreground mb-1 line-clamp-1">{content.title}</h4>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {content.description}
          </p>

          <div className="flex items-center gap-2 mb-2">
            {content.therapistAvatar ? (
              <img
                src={content.therapistAvatar}
                alt={content.therapistName}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[var(--lavender)]/20 flex items-center justify-center">
                <span className="text-[10px] text-[var(--lavender)]">
                  {content.therapistName?.charAt(0) || 'T'}
                </span>
              </div>
            )}

            <span className="text-xs text-muted-foreground line-clamp-1">
              {content.therapistName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--muted)] text-foreground text-xs">
              {getContentDuration(content)}
            </span>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(event) => {
                event.stopPropagation();
                handleOpenContent(content);
              }}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3 h-3" />
              Start
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

  if (selectedContent) {
    return (
      <ContentDetail
        content={selectedContent}
        onClose={() => setSelectedContent(null)}
        moreFromTherapist={moreFromTherapist}
        onOpenContent={handleOpenContent}
        onViewTherapist={(therapistId) => {
  onViewTherapist?.(therapistId);
}}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[390px] mx-auto px-6 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl text-foreground mb-2">Content Library</h1>
          <p className="text-muted-foreground">
            Explore therapist-created exercises for your wellness journey.
          </p>
        </div>

        

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[var(--lavender)]" />
            <h2 className="text-xl text-foreground">For you</h2>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-[var(--lavender)]/15 to-[var(--soft-purple)]/15 border border-[var(--lavender)]/20 p-5">
            <p className="text-sm text-muted-foreground">
              AI recommendations will appear here after we connect your check-ins with personalized content suggestions.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--lavender)]" />
              <h2 className="text-xl text-foreground">Featured today</h2>
            </div>

            <button
              onClick={handleSeeAllToday}
              className="text-sm text-[var(--lavender)]"
            >
              See all
            </button>
          </div>

          {featuredToday.length > 0 ? (
  <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-6 px-6">
    {featuredToday.map(renderFeaturedContentCard)}
  </div>
) : (
            <div className="rounded-2xl bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">
                No content has been published today yet.
              </p>
            </div>
          )}
        </div>

        <div className="mb-5">
          <h2 className="text-xl text-foreground mb-3">Categories</h2>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.id && !showTodayOnly && !searchTerm
                    ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                    : 'bg-card border-2 border-[var(--border)] text-foreground'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
  setSearchTerm(event.target.value);
  setShowTodayOnly(false);
  setCurrentPage(1);
}}
            placeholder="Search by title, therapist, category..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--lavender)] outline-none transition-colors"
          />
        </div>

        <div ref={resultsSectionRef}className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg text-foreground">
            {searchTerm
              ? 'Search results'
              : showTodayOnly
                ? 'All content from today'
                : categories.find((category) => category.id === selectedCategory)?.label}
          </h2>

          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as SortOption);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-card border-2 border-[var(--border)] text-sm text-foreground outline-none"
          >
            <option value="newest">Newest</option>
            <option value="likes">Most liked</option>
            <option value="views">Most viewed</option>
          </select>
        </div>

        {isLoading ? (
          <div className="rounded-2xl bg-card p-6 shadow-sm text-center">
            <p className="text-sm text-muted-foreground">Loading content...</p>
          </div>
        ) : paginatedContent.length > 0 ? (
          <div className="space-y-4 mb-6">
  {paginatedContent.map((content, index) => renderContentCard(content, index))}
</div>
        ) : (
          <div className="rounded-2xl bg-card p-6 shadow-sm text-center">
            <p className="text-sm text-muted-foreground">
              No content found.
            </p>
          </div>
        )}

        {filteredContent.length > itemsPerPage && (
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="w-11 h-11 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>

            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="w-11 h-11 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}