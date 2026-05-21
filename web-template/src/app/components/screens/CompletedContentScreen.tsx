import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getCompletedContent } from '../../services/contentInteractions';

interface CompletedContentScreenProps {
  onBack: () => void;
  onSelectContent?: (content: any) => void;
}

export function CompletedContentScreen({ onBack, onSelectContent }: CompletedContentScreenProps) {
  const [completedContent, setCompletedContent] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadCompletedContent = async () => {
      const content = await getCompletedContent();

      if (!isMounted) return;

      setCompletedContent(content);
    };

    loadCompletedContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center hover:border-[var(--lavender)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl text-foreground">Completed Content</h1>
            <p className="text-sm text-muted-foreground">{completedContent.length} items</p>
          </div>
        </div>

        {completedContent.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <CheckCircle className="w-16 h-16 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h3 className="text-lg text-foreground mb-2">No completed content yet</h3>
            <p className="text-sm text-muted-foreground">
              Finish a video, audio session, or step-by-step exercise to see it here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {completedContent.map((item, idx) => (
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
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.thumbnailGradient }}
                  >
                    {item.icon && <item.icon className="w-8 h-8 text-white/90" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)] text-xs mb-2">
                      {item.categoryLabel}
                    </span>
                    <h3 className="text-foreground mb-1 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.duration}</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-[var(--soft-mint)]" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}