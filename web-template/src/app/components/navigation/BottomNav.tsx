import React from 'react';
import { Home, Book, MessageCircle, User, Heart, Compass, FileText, Plus, Users, Briefcase, Settings, Video } from 'lucide-react';
import { motion } from 'motion/react';
import otterImage from '../../../imports/vidra.png';
import type { UserRole } from '../screens/AuthScreen';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: UserRole;
}

export function BottomNav({ activeTab, onTabChange, role }: BottomNavProps) {
  // User tabs
  const userTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'journal', label: 'Journal', icon: Book },
    { id: 'aichat', label: '', icon: Heart, special: true },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  // Therapist tabs
  const therapistTabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'mycontent', label: 'My Content', icon: Video },
    { id: 'addcontent', label: '', icon: Plus, special: true },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  // Admin tabs
  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'therapists', label: 'Therapists', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const tabs = role === 'user' ? userTabs : role === 'therapist' ? therapistTabs : adminTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-[var(--border)] px-4 py-2 safe-area-pb z-50">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.special) {
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(tab.id)}
                className="w-16 h-16 -mt-8 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] shadow-xl flex items-center justify-center p-2"
                data-tutorial={role === 'user' && tab.id === 'aichat' ? 'ai-chat-button' : role === 'therapist' && tab.id === 'addcontent' ? 'content-center' : undefined}
              >
                {role === 'user' ? (
                  <img
                    src={otterImage}
                    alt="Otto AI"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Icon className="w-7 h-7 text-white" />
                )}
              </motion.button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-4 transition-all"
              data-tutorial={
                tab.id === 'home' || tab.id === 'dashboard' ? (role === 'therapist' ? 'dashboard-tab' : 'home-tab') :
                tab.id === 'explore' ? 'explore-tab' :
                tab.id === 'messages' ? 'messages-tab' :
                tab.id === 'profile' ? 'profile-tab' :
                undefined
              }
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? 'text-[var(--lavender)]' : 'text-[var(--muted-foreground)]'
                }`}
              />
              <span
                className={`text-xs transition-colors ${
                  isActive ? 'text-[var(--lavender)]' : 'text-[var(--muted-foreground)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
