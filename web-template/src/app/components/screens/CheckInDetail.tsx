import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { X, Sparkles, Heart, Moon, Users, Sun, Cloud, Brain, Activity } from 'lucide-react';
import { generateAIInsights, type CheckInData } from '../../utils/checkInUtils';
import { BottomNav } from '../navigation/BottomNav';
import type { UserRole } from './AuthScreen';

interface CheckInDetailProps {
  checkIn: CheckInData;
  onClose: () => void;
  onTabChange?: (tab: string) => void;
  userRole?: UserRole;
  activeTab?: string;
}

export function CheckInDetail({ checkIn, onClose, onTabChange, userRole = 'user', activeTab = 'journal' }: CheckInDetailProps) {
  const insights = generateAIInsights(checkIn);

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) {
      onClose(); // Close the detail view
      if (onTabChange) {
        onTabChange(tab);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEmotionEmoji = (emotionalState?: string) => {
    const emojiMap: Record<string, string> = {
      'very-happy': '😄',
      'happy': '🙂',
      'neutral': '😐',
      'sad': '😢',
      'anxious': '😰',
      'stressed': '😫'
    };
    return emotionalState ? emojiMap[emotionalState] || '😐' : '😐';
  };

  const getSleepQualityLabel = (quality?: string) => {
    const labels: Record<string, string> = {
      'excellent': 'Excellent',
      'good': 'Good',
      'okay': 'Okay',
      'poor': 'Poor',
      'very-poor': 'Very Poor'
    };
    return quality ? labels[quality] || quality : 'Not recorded';
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 overflow-hidden">

        {/* HEADER - isolated, never overlapped */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 bg-background">
          <button
            onClick={onClose}
            type="button"
            className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center text-foreground hover:border-[var(--lavender)] transition-colors touch-manipulation z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-xl text-foreground">Check-In Details</h1>
          <div className="w-10" />
        </div>

        {/* CONTENT - scrollable, completely below header */}
        <div className="flex-1 overflow-y-auto px-6 pb-24">

        {/* Date & Mood Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card variant="gradient" className="text-white text-center">
            <div className="text-6xl mb-4">{getEmotionEmoji(checkIn.emotionalState)}</div>
            <h2 className="text-2xl mb-2">{formatDate(checkIn.date)}</h2>
            {checkIn.dominantEmotion && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {checkIn.dominantEmotion}
              </Badge>
            )}
          </Card>
        </motion.div>

        {/* AI Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-lg text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--lavender)]" />
            AI Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <Card key={idx} variant="glass">
                <p className="text-sm text-foreground">{insight}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Stress & Social Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-lg text-foreground mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--lavender)]" />
            Your Metrics
          </h3>
          <Card>
            <div className="space-y-4">
              {/* Stress Level */}
              {checkIn.stressLevel !== undefined && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-foreground">Stress Level</span>
                    <span className="text-sm font-medium text-foreground">{checkIn.stressLevel}/10</span>
                  </div>
                  <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--soft-mint)] to-[var(--soft-pink)] rounded-full transition-all"
                      style={{ width: `${(checkIn.stressLevel / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Social Connection */}
              {checkIn.socialConnection !== undefined && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-foreground">Social Connection</span>
                    <span className="text-sm font-medium text-foreground">{checkIn.socialConnection}/10</span>
                  </div>
                  <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] rounded-full transition-all"
                      style={{ width: `${(checkIn.socialConnection / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Sleep Quality */}
              {checkIn.sleepQuality && (
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-[var(--muted-blue)]" />
                    <span className="text-sm text-foreground">Sleep Quality</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{getSleepQualityLabel(checkIn.sleepQuality)}</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Reflections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-lg text-foreground mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-[var(--lavender)]" />
            Your Reflections
          </h3>
          <div className="space-y-3">
            {checkIn.thoughtsToday && (
              <Card>
                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-[var(--lavender)] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">On Your Mind</h4>
                    <p className="text-sm text-muted-foreground">{checkIn.thoughtsToday}</p>
                  </div>
                </div>
              </Card>
            )}

            {checkIn.energySource && (
              <Card>
                <div className="flex items-start gap-3">
                  <Sun className="w-5 h-5 text-[var(--soft-mint)] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Energy Source</h4>
                    <p className="text-sm text-muted-foreground">{checkIn.energySource}</p>
                  </div>
                </div>
              </Card>
            )}

            {checkIn.difficulties && (
              <Card>
                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-[var(--soft-pink)] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Difficulties</h4>
                    <p className="text-sm text-muted-foreground">{checkIn.difficulties}</p>
                  </div>
                </div>
              </Card>
            )}

            {checkIn.gratitude && (
              <Card>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Gratitude</h4>
                    <p className="text-sm text-muted-foreground">{checkIn.gratitude}</p>
                  </div>
                </div>
              </Card>
            )}

            {checkIn.tomorrowHelp && (
              <Card>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[var(--lavender)] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">For Tomorrow</h4>
                    <p className="text-sm text-muted-foreground">{checkIn.tomorrowHelp}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Recommended Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h3 className="text-lg text-foreground mb-3">Recommended for You</h3>
          <div className="space-y-3">
            <Card className="cursor-pointer hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--muted-blue)] to-[var(--soft-mint)] flex items-center justify-center flex-shrink-0">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="secondary">5 min</Badge>
                  <h4 className="mt-1 text-sm">Grounding Exercise</h4>
                  <p className="text-xs text-muted-foreground">Return to the present</p>
                </div>
              </div>
            </Card>

            <Card className="cursor-pointer hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center flex-shrink-0">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="primary">8 min</Badge>
                  <h4 className="mt-1 text-sm">Self-Compassion Practice</h4>
                  <p className="text-xs text-muted-foreground">Be kind to yourself</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          role={userRole}
        />
      </div>
    </div>
  );
}
