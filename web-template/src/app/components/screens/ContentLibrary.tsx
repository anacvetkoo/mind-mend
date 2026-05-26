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
  Wind,
  X
} from 'lucide-react';
import { ContentDetail } from './ContentDetail';
import {
  getLibraryContent,
  type LibraryContentItem
} from '../../services/content';
import {
  getUserContentInteractions,
  toggleLikedContent,
  toggleSavedContent,
  getUserContentProgress,
  type ContentProgressItem,
  removeContentProgress
} from '../../services/contentInteractions';
import { db } from '../../services/firebaseConfig';

type ContentType = 'all' | 'relaxation' | 'breathing' | 'sound';
type SortOption = 'newest' | 'likes' | 'views';

interface ContentLibraryProps {
  userId?: string;
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
  userId,
  onSelectContent,
  onViewTherapist
}: ContentLibraryProps = {}) {
  const [contentItems, setContentItems] = useState<LibraryContentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ContentType>('all');
  const [selectedContent, setSelectedContent] = useState<LibraryContentItem | null>(null);
  const [selectedContentProgress, setSelectedContentProgress] = useState<ContentProgressItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaDurations, setMediaDurations] = useState<Record<string, string>>({});
  const [likedContentIds, setLikedContentIds] = useState<string[]>([]);
  const [savedContentIds, setSavedContentIds] = useState<string[]>([]);
  const [contentProgressItems, setContentProgressItems] = useState<ContentProgressItem[]>([]);
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

    const progressItems = await getUserContentProgress();

    setLikedContentIds(interactions.likedContentIds);
    setSavedContentIds(interactions.savedContentIds);
    setContentProgressItems(progressItems);

    
  };

  loadInteractions();

  return () => {
    isMounted = false;
  };
}, []);

// 🔥 NOVO: Stanji za shranjevanje AI priporočil na Explore strani
const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
const [isAiLoading, setIsAiLoading] = useState(true);

useEffect(() => {
  const fetchExploreRecommendations = async () => {
    if (!userId) {
      setIsAiLoading(false);
      return;
    }
    
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        if (userData.latestAIRecommendations && userData.latestAIRecommendations.length > 0) {
          console.log("Explore stran uspešno prebrala priporočila iz baze!");
          const formatted = userData.latestAIRecommendations.map((item: any, idx: number) => ({
            id: item.id || `explore-rec-${idx}`,
            ...item
          }));
          setAiRecommendations(formatted);
        } else {
          setAiRecommendations([
            { id: "default-1", category: 'breathing', difficulty: 'easy', duration: '5 min', title: 'Box Breathing Technique', description: 'Calm your nervous system instantly.' },
            { id: "default-2", category: 'relaxation', difficulty: 'medium', duration: '10 min', title: 'Progressive Muscle Relaxation', description: 'Release physical tension from head to toe.' },
            { id: "default-3", category: 'sound therapy', difficulty: 'easy', duration: '15 min', title: 'Tibetan Singing Bowls', description: 'Deep alpha waves for mental clarity.' }
          ]);
        }
      }
    } catch (err) {
      console.error("Napaka pri branju priporočil na Explore strani:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  fetchExploreRecommendations();
}, [userId, contentItems]);

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

  const continueContentItems = useMemo(() => {
  return contentProgressItems
    .map((progressItem) => {
      const content = contentItems.find((item) => item.id === progressItem.contentId);

      if (!content) return null;

      return {
        content,
        progressItem
      };
    })
    .filter(Boolean) as Array<{
    content: LibraryContentItem;
    progressItem: ContentProgressItem;
  }>;
}, [contentItems, contentProgressItems]);

  const totalPages = Math.max(1, Math.ceil(filteredContent.length / itemsPerPage));

  const paginatedContent = filteredContent.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenContent = (
  content: LibraryContentItem,
  progressItem: ContentProgressItem | null = null
) => {
  setSelectedContent(content);
  setSelectedContentProgress(progressItem);
  onSelectContent?.(content);
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
  const likesChange = isCurrentlyLiked ? -1 : 1;

  setLikedContentIds((previousIds) =>
    isCurrentlyLiked
      ? previousIds.filter((id) => id !== contentId)
      : [...previousIds, contentId]
  );

  setContentItems((previousItems) =>
    previousItems.map((item) =>
      item.id === contentId
        ? {
            ...item,
            likes: Math.max((item.likes || 0) + likesChange, 0)
          }
        : item
    )
  );

  try {
    await toggleLikedContent(contentId, isCurrentlyLiked);
  } catch (error) {
    setLikedContentIds((previousIds) =>
      isCurrentlyLiked
        ? [...previousIds, contentId]
        : previousIds.filter((id) => id !== contentId)
    );

    setContentItems((previousItems) =>
      previousItems.map((item) =>
        item.id === contentId
          ? {
              ...item,
              likes: Math.max((item.likes || 0) - likesChange, 0)
            }
          : item
      )
    );
  }
};

const handleRemoveProgress = async (contentId: string) => {
  await removeContentProgress(contentId);

  setContentProgressItems((previousItems) =>
    previousItems.filter((item) => item.contentId !== contentId)
  );
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

const renderContinueContentCard = ({
  content,
  progressItem
}: {
  content: LibraryContentItem;
  progressItem: ContentProgressItem;
}) => {
  const Icon = getCategoryIcon(content.category);

  return (
    <motion.div
      key={content.id}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleOpenContent(content, progressItem)}
      className="flex-shrink-0 w-[220px] rounded-2xl bg-card shadow-md cursor-pointer overflow-hidden relative"
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          handleRemoveProgress(content.id);
        }}
        className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      <div
        className="h-28 flex items-center justify-center relative overflow-hidden"
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
          <Icon className="w-9 h-9 text-white/90" />
        )}
      </div>

      <div className="p-3">
        <h4 className="text-sm text-foreground mb-1 line-clamp-1">
          {content.title}
        </h4>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
          {content.categoryLabel}
        </p>

        <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] rounded-full"
            style={{ width: `${progressItem.progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

  if (selectedContent) {
  return (
    <ContentDetail
      content={selectedContent}
      onClose={() => {
        setSelectedContent(null);
        setSelectedContentProgress(null);
      }}
      moreFromTherapist={moreFromTherapist}
      onOpenContent={handleOpenContent}
      onViewTherapist={(therapistId) => {
        onViewTherapist?.(therapistId);
      }}
      initialProgress={selectedContentProgress}
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

        {continueContentItems.length > 0 && (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <Play className="w-5 h-5 text-[var(--lavender)]" />
      <h2 className="text-xl text-foreground">Continue your session</h2>
    </div>

    <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6">
      {continueContentItems.map(renderContinueContentCard)}
    </div>
  </div>
)}

       {/* AI Recommendations - For You */}
       <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[var(--lavender)]" />
            <h2 className="text-xl text-foreground">For you</h2>
          </div>
          {isAiLoading ? (
            <div className="rounded-3xl bg-gradient-to-br from-[var(--lavender)]/15 to-[var(--soft-purple)]/15 border border-[var(--lavender)]/20 p-5 animate-pulse text-center text-sm text-muted-foreground">
              ✨ Gemini is gathering your personalized content...
            </div>
          ) :
          aiRecommendations.length > 0 ? (
            <div className="space-y-3">
              {aiRecommendations.map((item, idx) => {
                let IconComponent = Brain;
                let gradientClass = "from-[var(--muted-blue)] to-[var(--soft-mint)]";

                if (item.category === 'breathing') {
                  IconComponent = Heart;
                  gradientClass = "from-[var(--soft-purple)] to-[var(--soft-pink)]";
                } else if (item.category === 'sound therapy' || item.category === 'relaxation') {
                  IconComponent = getCategoryIcon(item.category as any) || Volume2;
                  gradientClass = "from-[var(--lavender)] to-[var(--soft-purple)]";
                }

                const difficultyColor = 
                  item.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border-none' :
                  item.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500 border-none' : 
                  'bg-rose-500/10 text-rose-500 border-none';

                return (
                  <motion.div
                    key={item.id || idx}
                    whileTap={{ scale: 0.98 }}
                    className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer relative"
                    onClick={() => {
                      // Poiščemo pravo vsebino v knjižnici po naslovu (odstranimo presledke in ignoriramo velike/male črke)
                      const pravaVsebina = contentItems.find(
                        (c) => c.title.toLowerCase().trim() === item.title.toLowerCase().trim()
                      );

                      if (pravaVsebina) {
                        handleOpenContent(pravaVsebina);
                      } else {
                        if (contentItems.length > 0) {
                          console.log("Ujemanja ni v knjižnici, odpiram prvo razpoložljivo vsebino kot zasilni izhod.");
                          handleOpenContent(contentItems[0]);
                        }
                      }
                    }}
                  >
                    <div className="flex gap-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-7 h-7 text-white/90" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)] text-xs">
                            {item.duration || '5 min'}
                          </span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${difficultyColor}`}>
                            {item.difficulty}
                          </span>
                        </div>
                        <h4 className="mt-1 text-foreground font-medium truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl bg-gradient-to-br from-[var(--lavender)]/15 to-[var(--soft-purple)]/15 border border-[var(--lavender)]/20 p-5">
              <p className="text-sm text-muted-foreground">
                AI recommendations will appear here after we connect your check-ins with personalized content suggestions.
              </p>
            </div>
          )}
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