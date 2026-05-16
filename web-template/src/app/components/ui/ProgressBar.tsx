import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  progress: number;
  total: number;
}

export function ProgressBar({ progress, total }: ProgressBarProps) {
  const percentage = (progress / total) * 100;

  return (
    <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] rounded-full"
      />
    </div>
  );
}
