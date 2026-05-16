import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Bookmark, BookmarkPlus, Play, Pause, Star, ChevronRight, Wind, Volume2, Brain, Heart, Calendar } from 'lucide-react';
import { toggleLike, toggleBookmark, isLiked, isBookmarked, getLikeCount } from '../../utils/contentInteractions';

interface ContentItem {
  id: number;
  title: string;
  category: string;
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
  difficulty?: string;
  steps?: Array<{ title: string; description: string }>;
}

interface ContentDetailProps {
  content: ContentItem;
  onClose: () => void;
}

export function ContentDetail({ content, onClose }: ContentDetailProps) {
  const [, forceUpdate] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(4);

  const itemIsLiked = isLiked(content.id);
  const itemIsBookmarked = isBookmarked(content.id);
  const likeCount = getLikeCount(content.id);

  // Breathing animation logic
  useEffect(() => {
    if (isPlaying && content.category === 'breathing') {
      const phases = [
        { phase: 'inhale' as const, duration: 4000, count: 4 },
        { phase: 'hold' as const, duration: 7000, count: 7 },
        { phase: 'exhale' as const, duration: 8000, count: 8 }
      ];

      let currentPhaseIndex = 0;

      const cyclePhases = () => {
        const { phase, duration, count } = phases[currentPhaseIndex];
        setBreathPhase(phase);
        setBreathCount(count);

        setTimeout(() => {
          currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
          cyclePhases();
        }, duration);
      };

      cyclePhases();
    }
  }, [isPlaying, content.category]);

  // Progress bar simulation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleBookmark = () => {
    toggleBookmark(content.id);
    forceUpdate({});
  };

  const handleLike = () => {
    toggleLike(content.id);
    forceUpdate({});
  };

  const renderDynamicContent = () => {
    if (content.category === 'breathing') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-lg mb-4"
        >
          {/* Breathing Circle Animation */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              className="w-40 h-40 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center shadow-2xl relative"
              animate={{
                scale: breathPhase === 'inhale' ? 1.3 : breathPhase === 'exhale' ? 0.7 : 1,
              }}
              transition={{
                duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 0 : 8,
                ease: 'easeInOut'
              }}
            >
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
              <Wind className="w-16 h-16 text-white" />
            </motion.div>

            <motion.div
              className="mt-6 text-center"
              key={breathPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-2xl text-foreground capitalize mb-1">{breathPhase}...</p>
              <p className="text-lg text-muted-foreground">{breathCount}s</p>
            </motion.div>
          </div>

          <p className="text-center text-sm text-muted-foreground mb-4">4-7-8 Breathing Technique</p>

          {/* Play/Pause Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 shadow-lg"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Breathing</span>
              </>
            )}
          </motion.button>
        </motion.div>
      );
    }

    if (content.category === 'sound') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-lg mb-4"
        >
          {/* Waveform Visualization */}
          <div className="flex items-center justify-center gap-1 h-32 mb-6">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-[var(--lavender)] to-[var(--soft-purple)] rounded-full"
                animate={{
                  height: isPlaying
                    ? `${Math.random() * 80 + 20}%`
                    : '20%'
                }}
                transition={{
                  duration: 0.3,
                  repeat: isPlaying ? Infinity : 0,
                  delay: i * 0.05
                }}
              />
            ))}
          </div>

          {/* Audio Player */}
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{Math.floor(progress / 5)}:00</span>
              <span>{content.duration}</span>
            </div>
            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Play/Pause Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 shadow-lg"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause Sound</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Play Sound</span>
              </>
            )}
          </motion.button>
        </motion.div>
      );
    }

    // Relaxation exercises - Step by step
    if (content.category === 'relaxation' && content.steps) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-lg mb-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {content.steps.length}
            </p>
            <div className="flex gap-1">
              {content.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-1 rounded-full ${
                    idx < currentStep ? 'bg-[var(--lavender)]' : 'bg-[var(--muted)]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Step Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-4"
            >
              <div className="bg-gradient-to-br from-[var(--soft-purple)]/10 to-[var(--soft-mint)]/10 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center mb-4">
                  {currentStep}
                </div>
                <h4 className="text-lg mb-2 text-foreground">
                  {content.steps[currentStep - 1].title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {content.steps[currentStep - 1].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex-1 py-3 rounded-2xl border-2 border-[var(--border)] text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(content.steps!.length, currentStep + 1))}
              disabled={currentStep === content.steps.length}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  const moreFromTherapist = [
    { title: 'Box Breathing', duration: '8 min' },
    { title: 'Morning Mindfulness', duration: '10 min' }
  ];

  const youMightLike = [
    { title: 'Ocean Waves', category: 'Sound Therapy', duration: '20 min' },
    { title: 'Body Scan', category: 'Relaxation', duration: '15 min' }
  ];

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      {/* Mobile screen container - 390x844px */}
      <div className="max-w-[390px] mx-auto min-h-screen pb-24">
        {/* Top Section - Fullscreen Gradient Header */}
        <div
          className="relative h-[320px] flex flex-col items-center justify-center px-6 pt-12"
          style={{ background: content.thumbnailGradient }}
        >
          {/* Back button, Like, and Bookmark buttons */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="absolute top-6 right-6 flex items-center gap-2">
            {/* Like button with count */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex items-center gap-1.5 px-3 h-10 rounded-full bg-white/20 backdrop-blur-xl"
            >
              <motion.div
                animate={itemIsLiked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-5 h-5 ${
                    itemIsLiked ? 'text-red-500 fill-red-500' : 'text-white'
                  }`}
                />
              </motion.div>
              <span className="text-sm text-white font-medium">{likeCount}</span>
            </motion.button>

            {/* Bookmark button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
            >
              {itemIsBookmarked ? (
                <Bookmark className="w-5 h-5 text-white fill-white" />
              ) : (
                <BookmarkPlus className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </div>

          {/* Content Info */}
          <div className="text-center text-white mt-auto mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-xs mb-3">
              {content.categoryLabel}
            </span>
            <h1 className="text-3xl mb-3">{content.title}</h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src={content.therapistAvatar}
                alt={content.therapistName}
                className="w-8 h-8 rounded-full border-2 border-white/50"
              />
              <div className="text-left">
                <p className="text-sm">{content.therapistName}</p>
                <p className="text-xs text-white/80">{content.therapistTitle}</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center gap-3 text-sm text-white/90">
                <span>{content.duration}</span>
                {content.difficulty && (
                  <>
                    <span>•</span>
                    <span>{content.difficulty}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Calendar className="w-3.5 h-3.5" />
                <span>Posted 2 weeks ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Scrollable below header */}
        <div className="px-4 mt-4 relative z-0">
          {/* Dynamic Interactive Player - Primary focus */}
          {renderDynamicContent()}

          {/* How it works / Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-6 shadow-lg mb-4"
          >
            <h3 className="text-lg mb-4 text-foreground">
              {content.category === 'breathing' ? 'How it works' : 'About this session'}
            </h3>
            {content.category === 'breathing' ? (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--lavender)] text-white flex items-center justify-center flex-shrink-0 text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="mb-1 text-foreground">Breathe in for 4 seconds</h4>
                    <p className="text-sm text-muted-foreground">
                      Inhale quietly through your nose
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--soft-mint)] text-white flex items-center justify-center flex-shrink-0 text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="mb-1 text-foreground">Hold for 7 seconds</h4>
                    <p className="text-sm text-muted-foreground">
                      Hold your breath and count to seven
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--muted-blue)] text-white flex items-center justify-center flex-shrink-0 text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="mb-1 text-foreground">Breathe out for 8 seconds</h4>
                    <p className="text-sm text-muted-foreground">
                      Exhale completely through your mouth
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{content.description}</p>
            )}
          </motion.div>

          {/* Benefits (for breathing) or description continuation */}
          {content.category === 'breathing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl p-6 shadow-lg mb-4"
            >
              <h3 className="text-lg mb-4 text-foreground">Benefits</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soft-mint)] text-lg">✓</span>
                  <span className="text-sm">Reduces anxiety and stress</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soft-mint)] text-lg">✓</span>
                  <span className="text-sm">Helps you fall asleep faster</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soft-mint)] text-lg">✓</span>
                  <span className="text-sm">Manages emotional responses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soft-mint)] text-lg">✓</span>
                  <span className="text-sm">Improves focus and concentration</span>
                </li>
              </ul>
            </motion.div>
          )}

          {/* About the Therapist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-lg mb-4"
          >
            <h3 className="text-lg mb-4 text-foreground">About the Therapist</h3>
            <div className="flex gap-4 mb-4">
              <img
                src={content.therapistAvatar}
                alt={content.therapistName}
                className="w-16 h-16 rounded-full object-cover shadow-md"
              />
              <div className="flex-1">
                <h4 className="text-foreground mb-1">{content.therapistName}</h4>
                <p className="text-sm text-muted-foreground mb-2">{content.therapistTitle}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{content.therapistRating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({content.therapistReviews} reviews)
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{content.therapistBio}</p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-2xl border-2 border-[var(--lavender)] text-[var(--lavender)] flex items-center justify-center gap-2 transition-all hover:bg-[var(--lavender)]/5"
            >
              View Profile
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* More from this therapist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-4"
          >
            <h3 className="text-lg mb-3 text-foreground">More from this therapist</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {moreFromTherapist.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  className="flex-shrink-0 w-[160px] bg-card rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="w-full h-20 bg-gradient-to-br from-[var(--soft-purple)]/20 to-[var(--soft-mint)]/20 rounded-xl mb-3 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-[var(--lavender)]" />
                  </div>
                  <h4 className="text-sm mb-1 text-foreground line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.duration}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* You might also like */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-4"
          >
            <h3 className="text-lg mb-3 text-foreground">You might also like</h3>
            <div className="space-y-3">
              {youMightLike.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card rounded-2xl p-4 shadow-md flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--muted-blue)]/20 to-[var(--soft-pink)]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Volume2 className="w-6 h-6 text-[var(--lavender)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm mb-1 text-foreground line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                    <span className="text-xs text-muted-foreground">{item.duration}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}