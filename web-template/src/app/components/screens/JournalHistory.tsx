import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { ProgressGraph } from '../ui/ProgressGraph';
import { Calendar, Flame, Trophy, ChevronLeft, ChevronRight, Sparkles, Smile, AlertTriangle } from 'lucide-react';
import { countRecentCheckIns, getAllCheckIns, getStreakData, getCompletedDays, generateAIInsights, getRecentCheckIns, getWeeklyTrend, type CheckInData } from '../../utils/checkInUtils';
import { getStreakDataFromFirestore } from '../../utils/StreakCalculator';
import { Button } from '../ui/Button';
import { getFirebaseCheckIns } from '../../utils/checkInUtils.js';
import { generateAITriggers } from '../../services/gemini';

interface JournalHistoryProps {
  onSelectCheckIn?: (checkIn: CheckInData) => void;
}

interface TriggerItem {
  trigger: string;
  frequency: number;
  stressImpact: 'High' | 'Medium' | 'Low';
  context: string;
}

export function JournalHistory({ onSelectCheckIn }: JournalHistoryProps = {}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState('Stable');
  const [completedThisWeek, setCompletedThisWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(true); // Poseben loader za AI
  const [visibleCheckInCount, setVisibleCheckInCount] = useState(4);
  const [detectedTriggers, setDetectedTriggers] = useState<TriggerItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setIsAiLoading(true);

        const firebaseCheckIns = await getFirebaseCheckIns(); // pridobi vse check-ine
        setCheckIns(firebaseCheckIns);

        const count7Days = countRecentCheckIns(firebaseCheckIns, 7); // izračunan tedenski napredek
        setCompletedThisWeek(count7Days);

        const realStreak = await getStreakDataFromFirestore(); // funkcija za izračun streaka
        setStreakData(realStreak);

        const filteredDays = firebaseCheckIns // označenje dni na koledarju
          .filter(checkIn => {
            const checkInDate = new Date(checkIn.date);
            return checkInDate.getMonth() === currentMonth && checkInDate.getFullYear() === currentYear;
          })
          .map(checkIn => new Date(checkIn.date).getDate());

        setCompletedDays([...new Set(filteredDays)]);
        setWeeklyTrend(getWeeklyTrend(firebaseCheckIns));

        if (firebaseCheckIns && firebaseCheckIns.length > 0) {//hidden triggerji
          const todayDateStr = new Date().toISOString().split('T')[0]; //pridobimo današnji datum
          const cacheDataKey = `mindmend_triggers_data_${todayDateStr}`;
          const cacheTimeKey = `mindmend_triggers_last_run`;

          const cachedData = localStorage.getItem(cacheDataKey);
          const lastRunDate = localStorage.getItem(cacheTimeKey);

          if (cachedData && lastRunDate === todayDateStr) { //shranjeni podatki v local storage
            setDetectedTriggers(JSON.parse(cachedData));
          } else {
            const aiTriggers = await generateAITriggers(firebaseCheckIns);
            const safeTriggers = aiTriggers || [];
            
            setDetectedTriggers(safeTriggers);

            //shranimo podatke v cache za naslednjič
            localStorage.setItem(cacheDataKey, JSON.stringify(safeTriggers));
            localStorage.setItem(cacheTimeKey, todayDateStr);

            Object.keys(localStorage).forEach(key => { //počisti stari cache
              if (key.startsWith('mindmend_triggers_data_') && key !== cacheDataKey) {
                localStorage.removeItem(key);
              }
            });
          }
        }

      } catch (error) {
        console.error("Napaka pri nalaganju podatkov za JournalHistory:", error);
      } {
        setIsLoading(false);
        setIsAiLoading(false);
      }
    };

    loadData();
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

  const getImpactColor = (impact: 'High' | 'Medium' | 'Low') => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
      case 'Low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl text-foreground">Journal</h1>
          <p className="text-muted-foreground mt-1">Track your emotional journey</p>
        </motion.div>

        {/* This Week's Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl text-foreground">This Week's Progress</h3>
          </div>
          <Card variant="glass">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground">Check-in Completion</span>
                  <span className="text-muted-foreground">{isLoading ? "..." : `${completedThisWeek}/7`}</span>
                </div>
                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] rounded-full transition-all"
                    style={{ width: `${(completedThisWeek / 7) * 100}%` }}
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
                <p className="text-sm text-muted-foreground">Keep building your emotional awareness habits</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Streak Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4 mb-6">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
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

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} className="text-center text-xs text-muted-foreground font-medium">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isCompleted = completedDays.includes(day);
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${isCompleted
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
          <ProgressGraph firebaseCheckIns={checkIns} />
        </motion.div>

        {/* AI Trigger Tracker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6">
          <Card className="p-5 border border-[var(--border)] bg-card shadow-md rounded-3xl">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg text-foreground font-medium leading-none">Hidden Trigger Detector</h3>
                <p className="text-xs text-muted-foreground mt-1">AI correlation of journal patterns with stress levels</p>
              </div>
            </div>

            {isAiLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-[var(--lavender)] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground italic">Otto is searching for hidden triggers...</p>
              </div>
            ) : detectedTriggers.length === 0 ? (
              <div className="text-center py-6 px-4 border-2 border-dashed border-[var(--border)] rounded-2xl bg-background/30">
                <p className="text-xs text-muted-foreground leading-relaxed">
                Log more details about your days in your check-ins so Otto can recognize hidden stress triggers.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden border border-[var(--border)] rounded-2xl bg-background/40">
                <div className="divide-y divide-[var(--border)]">
                  {detectedTriggers.map((item, index) => (
                    <div key={index} className="p-3.5 flex flex-col gap-1 hover:bg-card/40 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm text-foreground truncate">{item.trigger}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getImpactColor(item.stressImpact)}`}>
                            {item.stressImpact} Impact
                          </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-muted-foreground bg-[var(--muted)] px-2 py-0.5 rounded-md">
                            {item.frequency}x detected
                          </span>
                          
                        </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 pl-1 border-l-2 border-[var(--lavender)]/30">
                        {item.context}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Check-in History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6">
          <h3 className="text-xl text-foreground mb-4">Check-In History</h3>

          {checkIns.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">No check-ins yet</p>
              <p className="text-sm text-muted-foreground">Complete your first daily check-in to start tracking your emotional journey</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {checkIns.slice(0, visibleCheckInCount).map((checkIn, idx) => {
                const insights = generateAIInsights(checkIn);
                const preview = insights[0] || 'Thank you for checking in today.';

                return (
                  <motion.div key={checkIn.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * idx }}>
                    <Card className="cursor-pointer hover:shadow-xl transition-all border-l-4 border-[var(--lavender)]" onClick={() => onSelectCheckIn?.(checkIn)}>
                      <div className="flex items-start gap-4">
                        <div className="text-center">
                          <div className="text-4xl mb-1">{getEmotionEmoji(checkIn.emotionalState)}</div>
                        </div>

                        <div className="flex-1 min-w-0">
                          {checkIn.date && (
                            <div className="mb-2 flex flex-wrap gap-1">
                              <div className="text-s font-medium px-2.5 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)]">{formatDate(checkIn.date)}</div>
                            </div>
                          )}

                          {checkIn.stressLevel !== undefined && (
                            <div className="mb-2">
                              <div className="text-xs text-muted-foreground mb-1">Stress Level</div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-[var(--soft-mint)] to-[var(--soft-pink)] rounded-full" style={{ width: `${(checkIn.stressLevel / 10) * 100}%` }} />
                                </div>
                                <span className="text-xs text-foreground font-medium">{checkIn.stressLevel}/10</span>
                              </div>
                            </div>
                          )}

                          <span className="inline-block text-muted-foreground text-xs font-medium">
                            {Array.isArray(checkIn.dominantEmotion) ? checkIn.dominantEmotion.join(', ') : checkIn.dominantEmotion}
                          </span>

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
              {checkIns.length > visibleCheckInCount && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 text-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setVisibleCheckInCount(prev => prev + 4)}
                    className="w-full text-xs font-medium py-2 border border-[var(--lavender)]/20 text-[var(--lavender)] hover:bg-[var(--lavender)]/5 transition-all"
                  >
                    Load More ({checkIns.length - visibleCheckInCount} remaining)
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}