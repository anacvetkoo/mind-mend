import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Bookmark, BookmarkPlus, Play, Pause, Star, ChevronRight, Wind, Volume2, Brain, Heart, Calendar, Maximize2 } from 'lucide-react';
import { toggleLike, toggleBookmark, isLiked, isBookmarked, getLikeCount } from '../../utils/contentInteractions';
import {
  getLibraryContent,
  getMoreContentFromTherapist,
  type LibraryContentItem
} from '../../services/content';

type ContentItem = LibraryContentItem;

interface ContentDetailProps {
  content: ContentItem;
  onClose: () => void;
  onOpenContent?: (content: ContentItem) => void | Promise<void>;
  onViewTherapist?: (therapistId: string) => void;
  moreFromTherapist?: ContentItem[];
}

export function ContentDetail({
  content,
  onClose,
  onOpenContent,
  onViewTherapist,
  moreFromTherapist = []
}: ContentDetailProps) {
  const [, forceUpdate] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasFinishedSteps, setHasFinishedSteps] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [mediaDuration, setMediaDuration] = useState('');
  const [therapistContent, setTherapistContent] = useState<ContentItem[]>(moreFromTherapist);
  const [youMightLikeContent, setYouMightLikeContent] = useState<ContentItem[]>([]);

  

  const audioRef = useRef<HTMLAudioElement | null>(null);
const videoRef = useRef<HTMLVideoElement | null>(null);
const audioContextRef = useRef<AudioContext | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
const animationFrameRef = useRef<number | null>(null);
const [waveformBars, setWaveformBars] = useState<number[]>(Array(40).fill(20));
const [currentAudioTime, setCurrentAudioTime] = useState(0);
const [audioDuration, setAudioDuration] = useState(0);

  const itemIsLiked = isLiked(content.id);
  const itemIsBookmarked = isBookmarked(content.id);
  const likeCount = getLikeCount(content.id);

  const getContentType = () => {
  if (content.contentType) return content.contentType;
  if (content.category === 'sound') return 'audio';
  if (content.category === 'breathing' || content.category === 'relaxation') return 'steps';
  return 'steps';
};

const formatMediaDuration = (seconds: number) => {
  if (!seconds || Number.isNaN(seconds)) return '';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes} min ${remainingSeconds} sec`;
  }

  if (minutes > 0) {
    return `${minutes} min`;
  }

  return `${remainingSeconds} sec`;
};

const formatPlayerTime = (seconds: number) => {
  if (!seconds || Number.isNaN(seconds)) return '00:00';

  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
};

const getDuration = () => {
  if (getContentType() === 'steps') {
    return content.duration || '';
  }

  return mediaDuration || content.duration || '';
};

const getCreatedAtText = () => {
  if (!content.createdAt) return '';

  const date = content.createdAt?.toDate ? content.createdAt.toDate() : new Date(content.createdAt);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const therapistName = content.therapistName || 'Therapist';
const therapistTitle = content.therapistTitle || 'Wellness Coach';
const therapistBio = content.therapistBio || 'A trusted guide for your wellness journey.';

const headerBackground = content.thumbnailImage && content.thumbnailType === 'image'
  ? {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.75)), url(${content.thumbnailImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  : {
      background: content.thumbnailGradient || content.gradient || 'linear-gradient(135deg, var(--lavender), var(--soft-purple))'
    };

const getCategoryIcon = (category: ContentItem['category']) => {
  if (category === 'breathing') return Wind;
  if (category === 'sound') return Volume2;
  return Brain;
};

const getContentScore = (item: ContentItem) => {
  return Math.max(item.likes || 0, getLikeCount(item.id)) + (item.views || 0);
};    


 useEffect(() => {
  let isMounted = true;

  const fetchMoreFromTherapist = async () => {
    if (!content.therapistId) {
      if (isMounted) setTherapistContent([]);
      return;
    }

    if (moreFromTherapist.length > 0) {
      if (isMounted) setTherapistContent(moreFromTherapist);
      return;
    }

    try {
      const contentFromTherapist = await getMoreContentFromTherapist(
        content.therapistId,
        content.id
      );

      if (isMounted) {
        setTherapistContent(contentFromTherapist);
      }
    } catch (error) {
      console.error('Error loading more content from therapist:', error);

      if (isMounted) {
        setTherapistContent([]);
      }
    }
  };

  fetchMoreFromTherapist();

  return () => {
    isMounted = false;
  };
}, [content.id, content.therapistId]);

useEffect(() => {
  let isMounted = true;

  const fetchYouMightLikeContent = async () => {
    try {
      const libraryContent = await getLibraryContent();
      const therapistContentIds = therapistContent.map((item) => item.id);

      const sameCategoryContent = libraryContent
        .filter((item) => {
          return (
            item.id !== content.id &&
            item.category === content.category &&
            item.therapistId !== content.therapistId &&
            !therapistContentIds.includes(item.id)
          );
        })
        .sort((firstItem, secondItem) => getContentScore(secondItem) - getContentScore(firstItem));

      const fallbackContent = libraryContent
        .filter((item) => {
          return (
            item.id !== content.id &&
            item.category !== content.category &&
            !therapistContentIds.includes(item.id) &&
            !sameCategoryContent.some((sameCategoryItem) => sameCategoryItem.id === item.id)
          );
        })
        .sort((firstItem, secondItem) => getContentScore(secondItem) - getContentScore(firstItem));

      if (isMounted) {
        setYouMightLikeContent([...sameCategoryContent, ...fallbackContent].slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading recommended content:', error);

      if (isMounted) {
        setYouMightLikeContent([]);
      }
    }
  };

  fetchYouMightLikeContent();

  return () => {
    isMounted = false;
  };
}, [content.id, content.category, content.therapistId, therapistContent]);

useEffect(() => {
  audioRef.current?.pause();
  videoRef.current?.pause();
  stopAudioVisualization();

  setCurrentStep(1);
  setHasFinishedSteps(false);
  setIsPlaying(false);
  setProgress(0);
  setMediaDuration('');
  setWaveformBars(Array(40).fill(20));
  setCurrentAudioTime(0);
setAudioDuration(0);
}, [content.id]);

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

 

  const handleBookmark = () => {
    toggleBookmark(content.id);
    forceUpdate({});
  };

  const handleLike = () => {
    toggleLike(content.id);
    forceUpdate({});
  };

  const handleMediaProgress = (currentTime: number, duration: number) => {
  if (!duration || Number.isNaN(duration)) return;

  setProgress((currentTime / duration) * 100);
};

const handleMediaLoadedMetadata = (duration: number) => {
  if (Number.isFinite(duration)) {
    setMediaDuration(formatMediaDuration(duration));
  }
};

const stopAudioVisualization = () => {
  if (animationFrameRef.current) {
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }
};

const startAudioVisualization = () => {
  stopAudioVisualization();

  const updateWaveform = () => {
    const audioElement = audioRef.current;
    const currentTime = audioElement?.currentTime || 0;

    const bars = Array.from({ length: 40 }).map((_, index) => {
      const wave = Math.sin(currentTime * 8 + index * 0.7);
      const pulse = Math.sin(currentTime * 4 + index * 0.35);
      return 18 + Math.abs(wave * pulse) * 75;
    });

    setWaveformBars(bars);
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  };

  updateWaveform();
};

const handlePlayAudio = async () => {
  const audioElement = audioRef.current;

  if (!audioElement || !content.audioUrl) return;

  if (isPlaying) {
    audioElement.pause();
    setIsPlaying(false);
    stopAudioVisualization();
    return;
  }

  try {
    audioElement.volume = 1;
    audioElement.muted = false;

    await audioElement.play();

    setIsPlaying(true);
    startAudioVisualization();
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

const handlePlayVideo = async () => {
  const videoElement = videoRef.current;

  if (!videoElement) return;

  if (isPlaying) {
    videoElement.pause();
    setIsPlaying(false);
    return;
  }

  await videoElement.play();
  setIsPlaying(true);
};

const handleOpenFullscreen = () => {
  const videoElement = videoRef.current;

  if (videoElement?.requestFullscreen) {
    videoElement.requestFullscreen();
  }
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

  if (getContentType() === 'video') {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-6 shadow-lg mb-4"
    >
      {content.videoUrl ? (
        <>
          <div className="overflow-hidden rounded-3xl bg-[var(--muted)] mb-4 relative">
            <video
              ref={videoRef}
              src={content.videoUrl}
              controls
              playsInline
              className="w-full rounded-3xl bg-black"
              onLoadedMetadata={(event) => {
  const duration = event.currentTarget.duration;

  if (Number.isFinite(duration)) {
    setAudioDuration(duration);
    handleMediaLoadedMetadata(duration);
  }
}}
onTimeUpdate={(event) => {
  const currentTime = event.currentTarget.currentTime;
  const duration = event.currentTarget.duration;

  setCurrentAudioTime(currentTime);
  handleMediaProgress(currentTime, duration);
}}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                setProgress(100);
              }}
            />

            <button
              onClick={handleOpenFullscreen}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{getDuration()}</span>
              <span>{Math.round(progress)}%</span>
            </div>

            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayVideo}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 shadow-lg"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause Video</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Play Video</span>
              </>
            )}
          </motion.button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Video file is not available.
        </p>
      )}
    </motion.div>
  );
}

if (getContentType() === 'audio') {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-6 shadow-lg mb-4"
    >
      {content.audioUrl ? (
        <>
          <audio
            ref={audioRef}
            src={content.audioUrl}
            preload="metadata"
            className="hidden"
            onLoadedMetadata={(event) => {
              const duration = event.currentTarget.duration;

              if (Number.isFinite(duration)) {
                setAudioDuration(duration);
                handleMediaLoadedMetadata(duration);
              }
            }}
            onTimeUpdate={(event) => {
              const currentTime = event.currentTarget.currentTime;
              const duration = event.currentTarget.duration;

              setCurrentAudioTime(currentTime);
              handleMediaProgress(currentTime, duration);
            }}
            onEnded={() => {
              setIsPlaying(false);
              setProgress(100);
              stopAudioVisualization();
            }}
          />

          <div className="flex items-center justify-center gap-1 h-32 mb-6">
            {waveformBars.map((height, index) => (
              <motion.div
                key={index}
                className="w-1 bg-gradient-to-t from-[var(--lavender)] to-[var(--soft-purple)] rounded-full"
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.12 }}
              />
            ))}
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatPlayerTime(currentAudioTime)}</span>
              <span>{formatPlayerTime(audioDuration)}</span>
            </div>

            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAudio}
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
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Audio file is not available.
        </p>
      )}
    </motion.div>
  );
}

    // Relaxation exercises - Step by step
    // Step by step content
if (getContentType() === 'steps' && content.steps && content.steps.length > 0) {
  const isLastStep = currentStep === content.steps.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-6 shadow-lg mb-4"
    >
      {hasFinishedSteps ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center mx-auto mb-4">
            ✓
          </div>

          <h3 className="text-xl text-foreground mb-2">
            You finished this session
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Great job. You reached the end of this exercise. Take a moment to notice how you feel.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {content.steps.length}
            </p>

            <div className="flex gap-1">
              {content.steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-1 rounded-full ${
                    index < currentStep ? 'bg-[var(--lavender)]' : 'bg-[var(--muted)]'
                  }`}
                />
              ))}
            </div>
          </div>

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

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
                className="flex-1 py-3 rounded-2xl border-2 border-[var(--border)] text-foreground"
              >
                Previous
              </button>
            )}

            <button
              onClick={() => {
                if (isLastStep) {
                  setHasFinishedSteps(true);
                  return;
                }

                setCurrentStep((step) => Math.min(content.steps!.length, step + 1));
              }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

    return null;
  };




  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      {/* Mobile screen container - 390x844px */}
      <div className="max-w-[390px] mx-auto min-h-screen pb-24">
        {/* Top Section - Fullscreen Gradient Header */}
        <div
          className="relative h-[320px] flex flex-col items-center justify-center px-6 pt-12"
          style={headerBackground}
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
              {content.therapistAvatar ? (
                <img
                  src={content.therapistAvatar}
                  alt={therapistName}
                  className="w-8 h-8 rounded-full border-2 border-white/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-white/50 bg-white/20 flex items-center justify-center text-xs text-white">
                  {therapistName.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <p className="text-sm">{therapistName}</p>
                <p className="text-xs text-white/80">{therapistTitle}</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center gap-3 text-sm text-white/90">
                {getDuration() && <span>{getDuration()}</span>}
                {content.difficulty && (
                  <>
                    <span>•</span>
                    <span>{content.difficulty}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Calendar className="w-3.5 h-3.5" />
                <span>{getCreatedAtText() || 'Recently posted'}</span>
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
              {content.therapistAvatar ? (
                <img
                  src={content.therapistAvatar}
                  alt={therapistName}
                  className="w-16 h-16 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--muted)] shadow-md flex items-center justify-center text-xl text-white">
                  {therapistName.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-foreground mb-1">{therapistName}</h4>
                <p className="text-sm text-muted-foreground mb-2">{therapistTitle}</p>
                <div className="flex items-center gap-2">
  {(content.therapistReviews ?? 0) > 0 ? (
    <>
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <span className="text-sm">
          {content.therapistRating ?? '5.0'}
        </span>
      </div>

      <span className="text-xs text-muted-foreground">
        ({content.therapistReviews} reviews)
      </span>
    </>
  ) : (
    <span className="text-xs text-muted-foreground">
      0 reviews
    </span>
  )}
</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{therapistBio}</p>
            <motion.button
  whileTap={{ scale: 0.98 }}
  onClick={() => {
    if (content.therapistId) {
      onViewTherapist?.(content.therapistId);
    }
  }}
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
    {therapistContent.slice(0, 5).map((item) => {
      const Icon = getCategoryIcon(item.category);

      return (
        <motion.div
          key={item.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => onOpenContent?.(item)}
          className="flex-shrink-0 w-[160px] bg-card rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="w-full h-20 rounded-xl overflow-hidden mb-3">
            {item.thumbnailType === 'image' && item.thumbnailImage ? (
              <img
                src={item.thumbnailImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: item.thumbnailGradient || 'linear-gradient(135deg, var(--lavender), var(--soft-purple))'
                }}
              >
                <Icon className="w-8 h-8 text-white/90" />
              </div>
            )}
          </div>

          <h4 className="text-sm mb-2 text-foreground line-clamp-1">{item.title}</h4>

          <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)] text-xs">
            {item.categoryLabel}
          </span>
        </motion.div>
      );
    })}
  </div>
</motion.div>

          {/* You might also like */}
{youMightLikeContent.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7 }}
    className="mb-4"
  >
    <h3 className="text-lg mb-3 text-foreground">You might also like</h3>
    <div className="space-y-3">
      {youMightLikeContent.map((item) => {
        const Icon = getCategoryIcon(item.category);

        return (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenContent?.(item)}
            className="bg-card rounded-2xl p-4 shadow-md flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{
                background:
                  item.thumbnailType === 'image' && item.thumbnailImage
                    ? `url(${item.thumbnailImage}) center/cover`
                    : item.thumbnailGradient || 'linear-gradient(135deg, var(--lavender), var(--soft-purple))'
              }}
            >
              {item.thumbnailType !== 'image' && (
                <Icon className="w-6 h-6 text-white/90" />
              )}
            </div>

            <div className="flex-1 min-w-0">
  <h4 className="text-sm mb-2 text-foreground line-clamp-1">{item.title}</h4>

  <div className="flex items-center gap-2">
    {item.therapistAvatar ? (
      <img
        src={item.therapistAvatar}
        alt={item.therapistName}
        className="w-5 h-5 rounded-full object-cover"
      />
    ) : (
      <div className="w-5 h-5 rounded-full bg-[var(--lavender)]/20 flex items-center justify-center">
        <span className="text-[10px] text-[var(--lavender)]">
          {item.therapistName?.charAt(0) || 'T'}
        </span>
      </div>
    )}

    <span className="text-xs text-muted-foreground line-clamp-1">
      {item.therapistName}
    </span>
  </div>
</div>

            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </motion.div>
        );
      })}
    </div>
  </motion.div>
)}
        </div>
      </div>
    </div>
  );
}