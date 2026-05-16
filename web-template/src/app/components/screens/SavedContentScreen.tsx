import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bookmark, Wind, Brain, Volume2 } from 'lucide-react';
import { getBookmarkedContentIds, getLikeCount } from '../../utils/contentInteractions';

interface SavedContentScreenProps {
  onBack: () => void;
  onSelectContent?: (content: any) => void;
}

export function SavedContentScreen({ onBack, onSelectContent }: SavedContentScreenProps) {
  const bookmarkedIds = getBookmarkedContentIds();

  // Mock content data (in a real app, this would be fetched from a service)
  const allContent = [
    {
      id: 1,
      title: 'Progressive Muscle Relaxation',
      categoryLabel: 'Relaxation Exercise',
      duration: '12 min',
      thumbnailGradient: 'linear-gradient(135deg, #B8E0D2 0%, #C4B5FD 100%)',
      icon: Brain
    },
    {
      id: 2,
      title: '4-7-8 Breathing Technique',
      categoryLabel: 'Breathing Technique',
      duration: '10 min',
      thumbnailGradient: 'linear-gradient(135deg, #93C5FD 0%, #B8E0D2 100%)',
      icon: Wind
    },
    {
      id: 3,
      title: 'Ocean Waves Soundscape',
      categoryLabel: 'Sound Therapy',
      duration: '20 min',
      thumbnailGradient: 'linear-gradient(135deg, #C4B5FD 0%, #F5D6E3 100%)',
      icon: Volume2
    },
    {
      id: 4,
      title: 'Guided Visualization',
      categoryLabel: 'Relaxation Exercise',
      duration: '15 min',
      thumbnailGradient: 'linear-gradient(135deg, #F5D6E3 0%, #B8E0D2 100%)',
      icon: Brain
    },
    {
      id: 5,
      title: 'Box Breathing',
      categoryLabel: 'Breathing Technique',
      duration: '8 min',
      thumbnailGradient: 'linear-gradient(135deg, #93C5FD 0%, #B8E0D2 100%)',
      icon: Wind
    },
    {
      id: 6,
      title: 'Forest Rain Ambience',
      categoryLabel: 'Sound Therapy',
      duration: '30 min',
      thumbnailGradient: 'linear-gradient(135deg, #C4B5FD 0%, #F5D6E3 100%)',
      icon: Volume2
    }
  ];

  const savedContent = allContent.filter(item => bookmarkedIds.includes(item.id));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center hover:border-[var(--lavender)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl text-foreground">Saved Content</h1>
            <p className="text-sm text-muted-foreground">{savedContent.length} items</p>
          </div>
        </div>

        {/* Content */}
        {savedContent.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Bookmark className="w-16 h-16 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h3 className="text-lg text-foreground mb-2">No saved content yet</h3>
            <p className="text-sm text-muted-foreground">
              Bookmark content to save it for later
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {savedContent.map((item, idx) => {
              const Icon = item.icon;
              const likeCount = getLikeCount(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectContent?.(item)}
                  className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: item.thumbnailGradient }}
                    >
                      <Icon className="w-8 h-8 text-white/90" />
                    </div>

                    {/* Content info */}
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)] text-xs mb-2">
                        {item.categoryLabel}
                      </span>
                      <h3 className="text-foreground mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{item.duration}</span>
                        <span className="flex items-center gap-1">
                          <Bookmark className="w-3.5 h-3.5 text-[var(--lavender)] fill-[var(--lavender)]" />
                          Saved
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
