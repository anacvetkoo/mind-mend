import React from 'react';
import { motion } from 'motion/react';

interface ChatBubbleProps {
  message: string;
  sender: 'user' | 'ai' | 'therapist';
  timestamp?: string;
  typing?: boolean;
}

export function ChatBubble({ message, sender, timestamp, typing }: ChatBubbleProps) {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-3xl px-5 py-3 ${
            isUser
              ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white rounded-br-md'
              : 'bg-card shadow-md text-foreground rounded-bl-md'
          }`}
        >
          {typing ? (
            <div className="flex gap-1 py-2">
              <motion.div
                className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message}</p>
          )}
        </div>
        {timestamp && !typing && (
          <p className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </motion.div>
  );
}
