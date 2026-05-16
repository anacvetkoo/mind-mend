import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Search, Wind, Brain, Volume2, BookmarkPlus, Bookmark, Play, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { ContentDetail } from './ContentDetail';
import { toggleLike, toggleBookmark, isLiked, isBookmarked, getLikeCount } from '../../utils/contentInteractions';
import { getRecentCheckIns } from '../../utils/checkInUtils';

type ContentType = 'relaxation' | 'breathing' | 'sound';

interface ContentItem {
  id: number;
  title: string;
  category: ContentType;
  categoryLabel: string;
  duration: string;
  description: string;
  therapistName: string;
  therapistAvatar: string;
  therapistTitle: string;
  therapistBio: string;
  therapistRating: number;
  therapistReviews: number;
  thumbnailGradient: string;
  icon: typeof Wind;
  bookmarked: boolean;
  steps?: Array<{ title: string; description: string }>;
  difficulty?: string;
}

interface ContentLibraryProps {
  onSelectContent?: (content: ContentItem) => void;
}

export function ContentLibrary({ onSelectContent }: ContentLibraryProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<ContentType>('relaxation');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [, forceUpdate] = useState({});

  const categories: Array<{ id: ContentType; label: string }> = [
    { id: 'relaxation', label: 'Relaxation Exercises' },
    { id: 'breathing', label: 'Breathing Techniques' },
    { id: 'sound', label: 'Sound Therapy' }
  ];

  const content: ContentItem[] = [
    {
      id: 1,
      title: 'Progressive Muscle Relaxation',
      category: 'relaxation',
      categoryLabel: 'Relaxation Exercise',
      duration: '12 min',
      description: 'Release tension through systematic muscle relaxation',
      therapistName: 'Dr. Sarah Mitchell',
      therapistAvatar: 'https://images.unsplash.com/photo-1594744803145-a7bf00e71852?w=100&h=100&fit=crop',
      therapistTitle: 'Licensed Therapist',
      therapistBio: 'Specializes in stress management and anxiety relief with over 10 years of clinical experience.',
      therapistRating: 4.9,
      therapistReviews: 342,
      thumbnailGradient: 'linear-gradient(135deg, #B8E0D2 0%, #C4B5FD 100%)',
      icon: Brain,
      bookmarked: true,
      difficulty: 'Beginner',
      steps: [
        { title: 'Find a comfortable position', description: 'Sit or lie down in a quiet space' },
        { title: 'Start with your feet', description: 'Tense and release each muscle group' },
        { title: 'Move up your body', description: 'Work through legs, torso, arms, and face' },
        { title: 'Breathe deeply', description: 'Notice the difference between tension and relaxation' },
        { title: 'Complete the cycle', description: 'Enjoy the feeling of total body relaxation' }
      ]
    },
    {
      id: 2,
      title: '4-7-8 Breathing Technique',
      category: 'breathing',
      categoryLabel: 'Breathing Technique',
      duration: '10 min',
      description: 'Calm your nervous system with rhythmic breathing',
      therapistName: 'Dr. Michael Chen',
      therapistAvatar: 'https://images.unsplash.com/photo-1594743794994-8f1e30bfa1d5?w=100&h=100&fit=crop',
      therapistTitle: 'Licensed Therapist',
      therapistBio: 'Mindfulness expert focusing on breathing techniques and meditation for mental wellness.',
      therapistRating: 4.8,
      therapistReviews: 289,
      thumbnailGradient: 'linear-gradient(135deg, #93C5FD 0%, #B8E0D2 100%)',
      icon: Wind,
      bookmarked: false,
      difficulty: 'Beginner'
    },
    {
      id: 3,
      title: 'Ocean Waves Soundscape',
      category: 'sound',
      categoryLabel: 'Sound Therapy',
      duration: '20 min',
      description: 'Gentle ocean sounds to promote deep relaxation',
      therapistName: 'Emma Rodriguez',
      therapistAvatar: 'https://images.unsplash.com/photo-1621255612554-440c5e7b21b3?w=100&h=100&fit=crop',
      therapistTitle: 'Licensed Therapist',
      therapistBio: 'Sound therapy specialist with expertise in nature-based healing and stress reduction.',
      therapistRating: 5.0,
      therapistReviews: 421,
      thumbnailGradient: 'linear-gradient(135deg, #C4B5FD 0%, #F5D6E3 100%)',
      icon: Volume2,
      bookmarked: true,
      difficulty: 'All Levels'
    },
    {
      id: 4,
      title: 'Body Scan Meditation',
      category: 'relaxation',
      categoryLabel: 'Relaxation Exercise',
      duration: '15 min',
      description: 'Mindful awareness through your entire body',
      therapistName: 'Dr. Sarah Mitchell',
      therapistAvatar: 'https://images.unsplash.com/photo-1594744803145-a7bf00e71852?w=100&h=100&fit=crop',
      therapistTitle: 'Licensed Therapist',
      therapistBio: 'Specializes in stress management and anxiety relief with over 10 years of clinical experience.',
      therapistRating: 4.9,
      therapistReviews: 342,
      thumbnailGradient: 'linear-gradient(135deg, #B8E0D2 0%, #C4B5FD 100%)',
      icon: Brain,
      bookmarked: false,
      difficulty: 'Intermediate',
      steps: [
        { title: 'Get comfortable', description: 'Lie down in a quiet, comfortable space' },
        { title: 'Focus on your breath', description: 'Take a few deep, centering breaths' },
        { title: 'Scan from head to toe', description: 'Notice sensations without judgment' }
      ]
    },
    {
      id: 5,
      title: 'Box Breathing Method',
      category: 'breathing',
      categoryLabel: 'Breathing Technique',
      duration: '8 min',
      description: 'Four-count breathing used by Navy SEALs',
      therapistName: 'Dr. Michael Chen',
      therapistAvatar: 'https://images.unsplash.com/photo-1594743794994-8f1e30bfa1d5?w=100&h=100&fit=crop',
      therapistTitle: 'Licensed Therapist',
      therapistBio: 'Mindfulness expert focusing on breathing techniques and meditation for mental wellness.',
      therapistRating: 4.8,
      therapistReviews: 289,
      thumbnailGradient: 'linear-gradient(135deg, #93C5FD 0%, #B8E0D2 100%)',
      icon: Wind,
      bookmarked: false,
      difficulty: 'Beginner'
    },
    {
      id: 6,
      title: 'Forest Rain Ambience',
      category: 'sound',
      categoryLabel: 'Sound Therapy',
      duration: '30 min',
      description: 'Peaceful rain sounds with distant thunder',
      therapistName: 'Emma Rodriguez',
      therapistAvatar: 'https://images.unsplash.com/photo-1621255612554-440c5e7b21b3?w=100&h=100&fit=crop',
      therapistTitle: 'Licensed Therapist',
      therapistBio: 'Sound therapy specialist with expertise in nature-based healing and stress reduction.',
      therapistRating: 5.0,
      therapistReviews: 421,
      thumbnailGradient: 'linear-gradient(135deg, #C4B5FD 0%, #F5D6E3 100%)',
      icon: Volume2,
      bookmarked: false,
      difficulty: 'All Levels'
    }
  ];

  const filteredContent = content.filter(item => item.category === selectedCategory);
  const featuredContent = content.filter(item => item.id <= 3);

  // Personalized recommendations based on recent check-ins
  const getPersonalizedRecommendations = () => {
    const recentCheckIns = getRecentCheckIns(7);

    if (recentCheckIns.length === 0) {
      // Default recommendations for new users
      return {
        reason: 'Perfect for getting started',
        items: content.filter(item => item.difficulty === 'Beginner').slice(0, 3)
      };
    }

    // Calculate average stress level
    const stressLevels = recentCheckIns
      .map(c => c.stressLevel)
      .filter(s => s !== undefined) as number[];

    const avgStress = stressLevels.length > 0
      ? stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length
      : 5;

    // Recommend based on stress level
    if (avgStress >= 7) {
      return {
        reason: 'Based on your recent stress levels',
        items: content.filter(item =>
          item.category === 'breathing' || item.category === 'relaxation'
        ).slice(0, 3)
      };
    } else if (avgStress <= 3) {
      return {
        reason: 'Keep your calm with these',
        items: content.filter(item => item.category === 'sound').slice(0, 3)
      };
    } else {
      return {
        reason: 'Recommended for you',
        items: content.slice(0, 3)
      };
    }
  };

  const personalizedContent = getPersonalizedRecommendations();

  const handleToggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(id);
    forceUpdate({});
  };

  const handleToggleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(id);
    forceUpdate({});
  };

  const handleContentClick = (item: ContentItem) => {
    if (onSelectContent) {
      onSelectContent(item);
    } else {
      setSelectedContent(item);
    }
  };

  if (selectedContent && !onSelectContent) {
    return <ContentDetail content={selectedContent} onClose={() => setSelectedContent(null)} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-foreground">Explore</h1>
          <p className="text-muted-foreground mt-1">Find what helps you today</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exercises, sounds..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all shadow-md"
            />
          </div>
        </motion.div>

        {/* For You Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[var(--lavender)]" />
            <h3 className="text-xl text-foreground">For You</h3>
          </div>
          <div className="bg-gradient-to-br from-[var(--lavender)]/5 to-[var(--soft-purple)]/5 rounded-3xl p-4 border-2 border-[var(--lavender)]/20 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[var(--lavender)]" />
              <p className="text-sm text-muted-foreground">{personalizedContent.reason}</p>
            </div>
            <div className="space-y-3">
              {personalizedContent.items.map((item) => {
                const Icon = item.icon;
                const itemIsBookmarked = isBookmarked(item.id);
                const itemIsLiked = isLiked(item.id);

                return (
                  <motion.div
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleContentClick(item)}
                    className="bg-card rounded-2xl p-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex gap-3 items-center">
                      {/* Thumbnail */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: item.thumbnailGradient }}
                      >
                        <Icon className="w-6 h-6 text-white/90" />
                      </div>

                      {/* Content info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-foreground mb-0.5 line-clamp-1">{item.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.duration}</span>
                          <span>•</span>
                          <span>{item.categoryLabel}</span>
                        </div>
                      </div>

                      {/* Action icons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleToggleLike(item.id, e)}
                          className="p-1"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              itemIsLiked
                                ? 'text-red-500 fill-red-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleToggleBookmark(item.id, e)}
                          className="p-1"
                        >
                          {itemIsBookmarked ? (
                            <Bookmark className="w-4 h-4 text-[var(--lavender)] fill-[var(--lavender)]" />
                          ) : (
                            <BookmarkPlus className="w-4 h-4 text-muted-foreground" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Featured Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl text-foreground">Featured Today</h3>
            <button className="text-sm text-[var(--lavender)]">See all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-6 px-6">
            {featuredContent.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContentClick(item)}
                  className="flex-shrink-0 w-[280px] h-[140px] rounded-2xl p-5 cursor-pointer shadow-lg relative overflow-hidden"
                  style={{ background: item.thumbnailGradient }}
                >
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-white text-xs mb-2">
                      {item.categoryLabel}
                    </span>
                    <h4 className="text-white text-lg mb-1">{item.title}</h4>
                    <div className="flex items-center gap-2 text-white/90 text-xs">
                      <span>{item.duration}</span>
                      <span>•</span>
                      <span>{item.therapistName}</span>
                    </div>
                  </div>
                  <Icon className="absolute bottom-4 right-4 w-8 h-8 text-white/30" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap transition-all text-sm ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-lg'
                    : 'border-2 border-[var(--border)] text-foreground bg-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {filteredContent.map((item, idx) => {
            const Icon = item.icon;
            const itemIsBookmarked = isBookmarked(item.id);
            const itemIsLiked = isLiked(item.id);
            const likeCount = getLikeCount(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleContentClick(item)}
                className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer relative"
              >
                <div className="flex gap-4">
                  {/* Thumbnail with gradient */}
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                    style={{ background: item.thumbnailGradient }}
                  >
                    <Icon className="w-8 h-8 text-white/90" />
                  </div>

                  {/* Content info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)] text-xs">
                        {item.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleToggleLike(item.id, e)}
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
                          onClick={(e) => handleToggleBookmark(item.id, e)}
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

                    <h4 className="text-foreground mb-1 line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>

                    {/* Therapist info */}
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={item.therapistAvatar}
                        alt={item.therapistName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-muted-foreground">{item.therapistName}</span>
                    </div>

                    {/* Duration badge and play button */}
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-3 py-1 rounded-full bg-[var(--muted)] text-foreground text-xs">
                        {item.duration}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.95 }} // Micro-interaction: button press
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
          })}
        </motion.div>
      </div>
    </div>
  );
}
