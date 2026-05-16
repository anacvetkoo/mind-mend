import React from 'react';
import { motion } from 'motion/react';
import otterImage from '../../../imports/vidra.png';

interface ChatScreenProps {
  onOpenChat?: (target: { name: string; avatar: string; isAI: boolean }) => void;
  userRole?: 'user' | 'therapist';
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isAI: boolean;
}

export function ChatScreen({ onOpenChat, userRole = 'user' }: ChatScreenProps = {}) {
  const conversations: Conversation[] = [
    {
      id: 1,
      name: 'Otto — AI Companion',
      avatar: otterImage,
      lastMessage: "I'm here whenever you need to talk 💙",
      timestamp: 'Now',
      unreadCount: 0,
      isAI: true
    },
    {
      id: 2,
      name: 'Dr. Sarah Mitchell',
      avatar: 'https://images.unsplash.com/photo-1594744803145-a7bf00e71852?w=100&h=100&fit=crop',
      lastMessage: 'Our session tomorrow is confirmed for 2pm',
      timestamp: '1h ago',
      unreadCount: 2,
      isAI: false
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1621255612554-440c5e7b21b3?w=100&h=100&fit=crop',
      lastMessage: 'Thanks for sharing that with me today',
      timestamp: 'Yesterday',
      unreadCount: 0,
      isAI: false
    }
  ];

  const handleChatClick = (conversation: Conversation) => {
    if (onOpenChat) {
      onOpenChat({
        name: conversation.name,
        avatar: conversation.avatar,
        isAI: conversation.isAI
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">Your conversations</p>
        </motion.div>

        {/* Conversations List */}
        {userRole === 'therapist' ? (
          /* Therapist view - Professional clean list */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {conversations.map((conversation, idx) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                onClick={() => handleChatClick(conversation)}
                className={`flex items-center gap-4 py-4 cursor-pointer hover:bg-[var(--muted)] transition-colors ${
                  idx !== conversations.length - 1 ? 'border-b border-[var(--border)]' : ''
                }`}
              >
                {/* Avatar */}
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-foreground">{conversation.name}</h3>
                    <div className="flex items-center gap-2">
                      {conversation.unreadCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-[var(--lavender)] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">{conversation.unreadCount}</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {conversation.timestamp}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* User view - Original card design */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            {conversations.map((conversation, idx) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                onClick={() => handleChatClick(conversation)}
                className={`bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer ${
                  conversation.isAI ? 'bg-gradient-to-r from-[var(--lavender)]/5 to-[var(--soft-purple)]/5 border-2 border-[var(--lavender)]/20' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-14 h-14 rounded-full object-cover shadow-md flex-shrink-0"
                  />

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-foreground truncate">{conversation.name}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">{conversation.unreadCount}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
