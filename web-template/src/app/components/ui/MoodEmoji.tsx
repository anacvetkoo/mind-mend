import React from 'react';
import { motion } from 'motion/react';

interface MoodEmojiProps {
  emoji: string;
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  color?: string;
}

export function MoodEmoji({ emoji, label, isSelected, onClick, color = 'var(--lavender)' }: MoodEmojiProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all ${
        isSelected
          ? 'bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] shadow-xl scale-105'
          : 'bg-card shadow-md hover:shadow-lg'
      }`}
    >
      <span className="text-4xl">{emoji}</span>
      <span className={`text-sm ${isSelected ? 'text-white' : 'text-foreground'}`}>
        {label}
      </span>
    </motion.button>
  );
}
