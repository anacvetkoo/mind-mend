import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { Flame, Calendar, Target, TrendingUp, Sparkles, Brain, Heart, UserRound, ChevronRight, Bell, Check, Activity, Moon } from 'lucide-react';
import { isTodayCompleted, getStreakData, getWeeklyTrend } from '../../utils/checkInUtils';

interface HomeDashboardProps {
  userName: string;
  onCheckIn: () => void;
  onFindTherapist?: () => void;
  onViewAppointments?: () => void;
  onViewNotifications?: () => void;
}

export function HomeDashboard({ userName, onCheckIn, onFindTherapist, onViewAppointments, onViewNotifications }: HomeDashboardProps) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const [todayCompleted, setTodayCompleted] = useState(false);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });
  const [weeklyTrend, setWeeklyTrend] = useState('Stable');

  useEffect(() => {
    setTodayCompleted(isTodayCompleted());
    setStreakData(getStreakData());
    setWeeklyTrend(getWeeklyTrend());
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl text-foreground">
              {greeting}, {userName}!
            </h1>
            {onViewNotifications && (
              <button
                onClick={onViewNotifications}
                className="relative w-10 h-10 rounded-full bg-card flex items-center justify-center"
              >
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            )}
          </div>
          <p className="text-muted-foreground mt-1">How are you feeling today?</p>
        </motion.div>

        {/* Daily Check-in CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {!todayCompleted ? (
            <Card variant="gradient" className="mb-6 text-white cursor-pointer" onClick={onCheckIn} data-tutorial="mood-checkin">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl mb-2">Daily Check-in</h3>
                  <p className="text-sm text-white/90">Take a moment to reflect on your emotions</p>
                </div>
                <Heart className="w-12 h-12" />
              </div>
              <Button variant="secondary" className="w-full mt-4">
                Start
              </Button>
            </Card>
          ) : (
            <Card className="mb-6 bg-gradient-to-r from-[var(--soft-mint)]/10 to-[var(--muted-blue)]/10 border-2 border-[var(--soft-mint)]" data-tutorial="mood-checkin">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--soft-mint)] to-[var(--muted-blue)] flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl text-foreground">Done</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">You've checked in today. Great job! 💜</p>
                </div>
                <Heart className="w-12 h-12 text-[var(--soft-mint)]" />
              </div>
            </Card>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <StatCard icon={<Flame className="w-6 h-6" />} value={streakData.current.toString()} label="Day Streak" color="var(--soft-pink)" />
          <StatCard icon={<Activity className="w-6 h-6" />} value={weeklyTrend} label="Weekly Trend" color="var(--muted-blue)" />
        </motion.div>

        {/* Find a Therapist Card */}
        {onFindTherapist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <Card
              className="cursor-pointer hover:shadow-xl transition-shadow border-l-4 border-[var(--lavender)]"
              onClick={onFindTherapist}
              data-tutorial="therapist-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center flex-shrink-0">
                  <UserRound className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1">Talk to a Professional</h4>
                  <p className="text-sm text-muted-foreground">Find a licensed therapist that fits your needs</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* My Appointments Card */}
        {onViewAppointments && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27 }}
            className="mb-6"
          >
            <Card
              className="cursor-pointer hover:shadow-xl transition-shadow border-l-4 border-[var(--soft-mint)]"
              onClick={onViewAppointments}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--soft-mint)] to-[var(--muted-blue)] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1">My Appointments</h4>
                  <p className="text-sm text-muted-foreground">View and manage your upcoming sessions</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* AI Wellness Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl text-foreground">AI wellness tips just for you</h3>
          </div>
          <div className="space-y-3">
            <Card variant="glass">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {streakData.current > 0
                      ? `You've maintained a ${streakData.current}-day check-in streak 💜 Keep up the great work!`
                      : "Starting a daily check-in routine can help you track your emotional patterns and build self-awareness."}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="glass">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--soft-mint)] to-[var(--muted-blue)] flex items-center justify-center flex-shrink-0">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Quality sleep is essential for emotional wellbeing. Try establishing a calming bedtime routine.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Recommended Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl text-foreground">Recommended Content</h3>
            <button className="text-sm text-[var(--lavender)]">See all</button>
          </div>

          <div className="mb-2">
            <span className="text-xs text-[var(--lavender)] bg-[var(--lavender)]/10 px-3 py-1 rounded-full">
              Based on your recent check-ins
            </span>
          </div>

          <div className="space-y-3 mt-3">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--muted-blue)] to-[var(--soft-mint)] flex items-center justify-center flex-shrink-0">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="secondary">5 min</Badge>
                  <h4 className="mt-2">Grounding Exercise</h4>
                  <p className="text-sm text-muted-foreground">Return to the present moment</p>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--soft-purple)] to-[var(--soft-pink)] flex items-center justify-center flex-shrink-0">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="primary">10 min</Badge>
                  <h4 className="mt-2">Deep Breathing</h4>
                  <p className="text-sm text-muted-foreground">Calm your nervous system</p>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center flex-shrink-0">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="secondary">8 min</Badge>
                  <h4 className="mt-2">Better Sleep Guide</h4>
                  <p className="text-sm text-muted-foreground">Improve your sleep quality</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
