import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { ProgressGraph } from '../ui/ProgressGraph';
import { Calendar, Flame, Trophy, ChevronLeft, ChevronRight, Sparkles, Smile } from 'lucide-react';
import { getAllCheckIns, getStreakData, getCompletedDays, generateAIInsights, getRecentCheckIns, getWeeklyTrend, type CheckInData } from '../../utils/checkInUtils';

interface JournalHistoryProps {
  onSelectCheckIn?: (checkIn: CheckInData) => void;
}

export function JournalHistory({ onSelectCheckIn }: JournalHistoryProps = {}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState('Stable');

  useEffect(() => {
    // Load all check-ins and sort by date descending
    const allCheckIns = getAllCheckIns().sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setCheckIns(allCheckIns);
    setStreakData(getStreakData());
    setCompletedDays(getCompletedDays(currentMonth, currentYear));
    setWeeklyTrend(getWeeklyTrend());
  }, [currentMonth, currentYear]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-foreground">Journal</h1>
          <p className="text-muted-foreground mt-1">Track your emotional journey</p>
        </motion.div>

        {/* This Week's Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl text-foreground">This Week's Progress</h3>
          </div>
          <Card variant="glass">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground">Check-in Completion</span>
                  <span className="text-muted-foreground">{getRecentCheckIns(7).length}/7</span>
                </div>
                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] rounded-full transition-all"
                    style={{ width: `${(getRecentCheckIns(7).length / 7) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground">Emotional Trend</span>
                  <span className="text-muted-foreground">{weeklyTrend}</span>
                </div>
                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--soft-mint)] to-[var(--muted-blue)] rounded-full w-[70%]" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                <Smile className="w-5 h-5 text-[var(--lavender)]" />
                <p className="text-sm text-muted-foreground">
                  Keep building your emotional awareness habits 💜
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Streak Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <Card className="text-center bg-gradient-to-br from-[var(--soft-pink)]/10 to-[var(--soft-pink)]/5 border-2 border-[var(--soft-pink)]/20">
            <Flame className="w-8 h-8 text-[var(--soft-pink)] mx-auto mb-2" />
            <div className="text-3xl text-foreground mb-1">{streakData.current}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </Card>
          <Card className="text-center bg-gradient-to-br from-[var(--lavender)]/10 to-[var(--soft-purple)]/5 border-2 border-[var(--lavender)]/20">
            <Trophy className="w-8 h-8 text-[var(--lavender)] mx-auto mb-2" />
            <div className="text-3xl text-foreground mb-1">{streakData.longest}</div>
            <div className="text-xs text-muted-foreground">Longest Streak</div>
          </Card>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <button onClick={handlePrevMonth} className="w-8 h-8 rounded-full hover:bg-[var(--muted)] flex items-center justify-center transition-colors">
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h3 className="text-lg text-foreground">{monthNames[currentMonth]} {currentYear}</h3>
              <button onClick={handleNextMonth} className="w-8 h-8 rounded-full hover:bg-[var(--muted)] flex items-center justify-center transition-colors">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} className="text-center text-xs text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isCompleted = completedDays.includes(day);
                const isToday = new Date().getDate() === day &&
                               new Date().getMonth() === currentMonth &&
                               new Date().getFullYear() === currentYear;

                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${
                      isCompleted
                        ? 'bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-md font-medium'
                        : isToday
                        ? 'bg-[var(--muted)] text-foreground border-2 border-[var(--lavender)]'
                        : 'bg-[var(--muted)]/30 text-muted-foreground'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)]" />
              <span className="text-xs text-muted-foreground">Completed check-in</span>
            </div>
          </Card>
        </motion.div>

        {/* Stress Level Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <ProgressGraph />
        </motion.div>

        {/* Check-in History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl text-foreground mb-4">Check-In History</h3>

          {checkIns.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">No check-ins yet</p>
              <p className="text-sm text-muted-foreground">Complete your first daily check-in to start tracking your emotional journey</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {checkIns.map((checkIn, idx) => {
                const insights = generateAIInsights(checkIn);
                const preview = insights[0] || 'Thank you for checking in today.';

                return (
                  <motion.div
                    key={checkIn.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-xl transition-all border-l-4 border-[var(--lavender)]"
                      onClick={() => onSelectCheckIn?.(checkIn)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Emoji & Date */}
                        <div className="text-center">
                          <div className="text-4xl mb-1">{getEmotionEmoji(checkIn.emotionalState)}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(checkIn.date)}</div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {checkIn.dominantEmotion && (
                            <div className="mb-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)]">
                                {checkIn.dominantEmotion}
                              </span>
                            </div>
                          )}

                          {checkIn.stressLevel !== undefined && (
                            <div className="mb-2">
                              <div className="text-xs text-muted-foreground mb-1">Stress Level</div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[var(--soft-mint)] to-[var(--soft-pink)] rounded-full"
                                    style={{ width: `${(checkIn.stressLevel / 10) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-foreground font-medium">{checkIn.stressLevel}/10</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                            <Sparkles className="w-4 h-4 text-[var(--lavender)] flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground line-clamp-2">{preview}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
