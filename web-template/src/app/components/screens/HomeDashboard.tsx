import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/Button';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/badge';
import { ShieldCheck, ClipboardList } from 'lucide-react';
import { Flame, Calendar, Target, TrendingUp, Sparkles, Brain, Heart, UserRound, ChevronRight, Bell, Check, Activity, Moon } from 'lucide-react';
import { isTodayCompleted, getStreakData, getWeeklyTrend, getFirebaseCheckIns } from '../../utils/checkInUtils';
import { getStreakDataFromFirestore } from '../../utils/StreakCalculator';
import { generateAIWellnessTips } from '../../services/gemini';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig.js';
import { ContentDetail } from './ContentDetail';

interface HomeDashboardProps {
  userId: string;
  userName: string;
  onCheckIn: () => void;
  onViewAiInsights: () => void;
  onFindTherapist?: () => void;
  onViewAppointments?: () => void;
  onViewNotifications?: () => void;
  onTabChange: (tab: string) => void;
}

export function HomeDashboard({ userId, userName, onCheckIn, onViewAiInsights, onFindTherapist, onViewAppointments, onViewNotifications, onTabChange }: HomeDashboardProps) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const [todayCompleted, setTodayCompleted] = useState(false);
  const [streakData, setStreakData] = useState(() => {
    const savedStreak = localStorage.getItem('mindmend_current_streak');
    return {
      current: savedStreak ? parseInt(savedStreak, 10) : 0,
      longest: 0 
    };
  });
  const [weeklyTrend, setWeeklyTrend] = useState('Stable');
  const [isLoading, setIsLoading] = useState(true);

  const [aiTips, setAiTips] = useState<string[]>([]);

  const [recommendedContent, setRecommendedContent] = useState<{ 
    id?: string; 
    category: 'relaxation' | 'breathing' | 'sound therapy'; 
    difficulty: 'easy' | 'medium' | 'hard'; 
    duration: string; 
    title: string; 
    description: string; 
  }[]>([]);

  const [dashboardSelectedContent, setDashboardSelectedContent] = useState<any | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
     setIsLoading(true);
     
     try {
       const completedToday = await isTodayCompleted();
       setTodayCompleted(completedToday);

       const allCheckIns = await getFirebaseCheckIns();
       setWeeklyTrend(getWeeklyTrend(allCheckIns));

       const incomingStreak = await getStreakDataFromFirestore();
       setStreakData(incomingStreak);
       if (incomingStreak && typeof incomingStreak.current === 'number') {
        localStorage.setItem('mindmend_current_streak', String(incomingStreak.current));
      }

      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          //latestAIWellnessTip
          if (completedToday && userData.latestAIWellnessTip) {
            setAiTips(userData.latestAIWellnessTip);
          } else if (completedToday) {
            setAiTips([
              "Take a deep breath and give yourself credit for tracking your mood today. Every step counts! 💜",
              "Establishing a consistent sleep pattern supports your brain's emotional processing and recovery."
            ]);
          } else {
            setAiTips([
              "Starting a daily check-in routine can help you track your emotional patterns and build self-awareness.",
              "Quality sleep is essential for emotional wellbeing. Try establishing a calming bedtime routine."
            ]);
          }

          //latestAIRecommendations
          if (userData.latestAIRecommendations && userData.latestAIRecommendations.length > 0) {
            setRecommendedContent(userData.latestAIRecommendations as any);
          } else {
            setRecommendedContent([ //TODO fallback bodo realni contenti iz baze - tudi na gemini.ts
              { id: "default-1", category: 'breathing', difficulty: 'easy', duration: '5 min', title: 'Box Breathing Technique', description: 'Calm your nervous system instantly.' },
              { id: "default-2", category: 'relaxation', difficulty: 'medium', duration: '10 min', title: 'Progressive Muscle Relaxation', description: 'Release physical tension from head to toe.' },
              { id: "default-3", category: 'sound therapy', difficulty: 'easy', duration: '15 min', title: 'Tibetan Singing Bowls', description: 'Deep alpha waves for mental clarity.' }
            ]);
          }
        }
      }

     } catch (error) {
        console.error("Napaka pri osveževanju nadzorne plošče:", error);
        setAiTips([
          "Take a deep breath and give yourself credit for tracking your mood today. Every step counts! 💜",
          "Establishing a consistent sleep pattern supports your brain's emotional processing and recovery."
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [userId, todayCompleted]);

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
          <StatCard 
            icon={<Flame className="w-6 h-6" />} 
            value={String(streakData.current)}
            label="Day Streak" 
            color="var(--soft-pink)" 
          />
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
            <h3 className="text-xl text-foreground">Otto's wellness tips just for you</h3>
          </div>
          <div className="space-y-3">
            {isLoading || aiTips.length === 0 ? (
              <Card variant="glass" className="py-6 text-center text-sm text-muted-foreground animate-pulse">
                ✨ Gemini is analyzing your journals to generate personalized tips...
              </Card>
            ) : (
              aiTips.map((tip, idx) => (
                <Card variant="glass" key={idx}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${
                      idx === 0 
                        ? 'from-[var(--lavender)] to-[var(--soft-purple)]' 
                        : 'from-[var(--soft-mint)] to-[var(--muted-blue)]'
                    }`}>
                      {idx === 0 ? (
                        <Sparkles className="w-5 h-5 text-white" />
                      ) : (
                        <Moon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}

                <Card 
                  onClick={onViewAiInsights}
                  className="mt-2 cursor-pointer border border-[var(--lavender)]/30 bg-gradient-to-r from-[var(--lavender)]/5 to-transparent hover:from-[var(--lavender)]/10 transition-all p-3 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--lavender)]/10 flex items-center justify-center text-[var(--lavender)]">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground group-hover:text-[var(--lavender)] transition-colors">
                        Deep Cognitive Analysis
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Explore core triggers, trends and full analysis across 10 logs
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
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
            <button className="text-sm text-[var(--lavender)]"
            onClick={() => onTabChange('explore')}>See all</button>
          </div>

          <div className="mb-2">
            <span className="text-xs text-[var(--lavender)] bg-[var(--lavender)]/10 px-3 py-1 rounded-full">
              Based on your recent check-ins
            </span>
          </div>

          <div className="space-y-3 mt-3">
            {isLoading || !recommendedContent || recommendedContent.length === 0 ? (
              <Card variant="glass" className="py-6 text-center text-sm text-muted-foreground animate-pulse">
                ✨ Tailoring exercises to your emotional patterns...
              </Card>
            ) : (
              recommendedContent.map((item, idx) => {
                let IconComponent = Brain; 
                let gradientClass = "from-[var(--muted-blue)] to-[var(--soft-mint)]";

                if (item.category === 'breathing') {
                  IconComponent = Heart;
                  gradientClass = "from-[var(--soft-purple)] to-[var(--soft-pink)]";
                } else if (item.category === 'sound therapy' || item.category === 'relaxation') {
                  IconComponent = Moon;
                  gradientClass = "from-[var(--lavender)] to-[var(--soft-purple)]";
                }

                const difficultyColor = 
                  item.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border-none' :
                  item.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500 border-none' : 
                  'bg-rose-500/10 text-rose-500 border-none';

                return (
                  <Card 
                    key={item.id || idx}
                    className="hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={async () => {
                      try {
                        const { getLibraryContent } = await import('../../services/content');
                        const vsaVsebina = await getLibraryContent();
                        
                        const ujemajocaVsebina = vsaVsebina.find(
                          (c: any) => c.title.toLowerCase().trim() === item.title.toLowerCase().trim()
                        );

                        if (ujemajocaVsebina) {
                          setDashboardSelectedContent(ujemajocaVsebina);
                        } else {
                          if (vsaVsebina.length > 0) {
                            setDashboardSelectedContent(vsaVsebina[0]);
                          }
                        }
                      } catch (err) {
                        console.error("Napaka pri preusmeritvi na vsebino iz Dashboarda:", err);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)] text-xs font-medium">
                              {item.duration || '5 min'}
                            </span>
                          </div>
                        <h4 className="mt-1.5 text-sm font-medium text-foreground truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
      {dashboardSelectedContent && (
        <ContentDetail
          content={dashboardSelectedContent}
          onClose={() => setDashboardSelectedContent(null)}
          moreFromTherapist={[]} // Pustimo prazno ali naložimo naknadno
          onOpenContent={(novaVsebina) => setDashboardSelectedContent(novaVsebina)}
        />
      )}
    </div>
  );
}
