import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { X, Sparkles, Heart, Moon, Users, Sun, Cloud, Brain, Activity } from 'lucide-react';
import { generateAIInsights, type CheckInData } from '../../utils/checkInUtils';
import { BottomNav } from '../navigation/BottomNav';
import type { UserRole } from './AuthScreen';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { ContentDetail } from './ContentDetail';

interface CheckInDetailProps {
  checkIn: CheckInData & { aiRecommendations?: any[]; aiInsights?: string[] };
  onClose: () => void;
  onTabChange?: (tab: string) => void;
  userRole?: UserRole;
  activeTab?: string;
  userId?: string;
}

export function CheckInDetail({ checkIn, onClose, onTabChange, userRole = 'user', activeTab = 'journal', userId }: CheckInDetailProps) {
  const insights = generateAIInsights(checkIn);

  const [singleRecommendations, setSingleRecommendations] = useState<any[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(true);
  const [singleInsights, setSingleInsights] = useState<string[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(true);

  const [dashboardSelectedContent, setDashboardSelectedContent] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSingleRecommendations = async () => {
      setIsRecsLoading(true);
      try {
        if (checkIn.aiRecommendations && checkIn.aiRecommendations.length > 0) {
          if (isMounted) {
            setSingleRecommendations(checkIn.aiRecommendations);
            setIsRecsLoading(false);
          }
          return;
        }

        const { generateAIRecommendations } = await import('../../services/gemini.js');
        const { getLibraryContent } = await import('../../services/content');

        const vsebine = await getLibraryContent().catch(() => []);
        const trenutenUid = userId || "";
        const result = await generateAIRecommendations([checkIn], trenutenUid, vsebine);

        if (isMounted) {
          let finalRecs = [];
          if (result && result.length > 0) {
            finalRecs = result;
          } else {
            finalRecs = [
              { id: "s-1", category: 'breathing', difficulty: 'easy', duration: '5 min', title: 'Grounding Breath', description: 'Return to the present moment.' },
              { id: "s-2", category: 'relaxation', difficulty: 'medium', duration: '10 min', title: 'Self-Compassion Practice', description: 'Be kind to your mind today.' }
            ];
          }

          setSingleRecommendations(finalRecs);

          if (checkIn.id) {
            try {
              const checkInDocRef = doc(db, "dnevniki", checkIn.id);
              await updateDoc(checkInDocRef, {
                aiRecommendations: finalRecs
              });

              checkIn.aiRecommendations = finalRecs;
            } catch (dbError) {
              console.error("Napaka pri shranjevanju priporočil v Firestore:", dbError);
            }
          }
        }
      } catch (error) {
        console.error("Napaka pri generiranju ali pridobivanju priporočil:", error);
        if (isMounted) {
          setSingleRecommendations([
            { id: "s-1", category: 'breathing', difficulty: 'easy', duration: '5 min', title: 'Grounding Breath', description: 'Return to the present moment.' },
            { id: "s-2", category: 'relaxation', difficulty: 'medium', duration: '10 min', title: 'Self-Compassion Practice', description: 'Be kind to your mind today.' }
          ]);
        }
      } finally {
        if (isMounted) setIsRecsLoading(false);
      }
    };

    fetchSingleRecommendations();

    return () => {
      isMounted = false;
    };
  }, [checkIn]);

  useEffect(() => {
    let isMounted = true;

    const fetchSingleInsights = async () => {
      setIsInsightsLoading(true);
      try {
        if (checkIn.aiInsights && checkIn.aiInsights.length > 0) {
          console.log("Najdeni obstoječi AI Insights v zbirki za dan:", checkIn.date);
          if (isMounted) {
            setSingleInsights(checkIn.aiInsights);
            setIsInsightsLoading(false);
          }
          return;
        }

        console.log("AI nasvetov ni v zbirki. Sprožam enkratni klic Geminija za:", checkIn.date);
        const { generateAIWellnessTips } = await import('../../services/gemini.js');

        const result = await generateAIWellnessTips([checkIn]);

        if (isMounted) {
          let finalInsights: string[] = [];
          if (result && result.length > 0) {
            finalInsights = result;
          } else {
            finalInsights = [
              "Take a deep breath and acknowledge your efforts today. Reflecting on your emotions is a powerful step toward healing.",
              "Consider taking a short 5-minute break to clear your mind and focus on gentle chest breathing."
            ];
          }

          setSingleInsights(finalInsights);

          if (checkIn.id) {
            try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('../../services/firebaseConfig');

              const journalDocRef = doc(db, "dnevniki", checkIn.id);
              await updateDoc(journalDocRef, {
                aiInsights: finalInsights
              });

              console.log("Nasveti trajno shranjeni v kolekcijo 'dnevniki' pod ID:", checkIn.id);

              checkIn.aiInsights = finalInsights;
            } catch (dbError) {
              console.error("Napaka pri shranjevanju AI nasvetov v Firestore zbirko 'dnevniki':", dbError);
            }
          }
        }
      } catch (error) {
        console.error("Napaka pri generiranju AI Insights za posamezen dnevnik:", error);
        if (isMounted) {
          setSingleInsights([
            "Focus on grounding yourself in the present moment today.",
            "Remember to treat yourself with patience and empathy."
          ]);
        }
      } finally {
        if (isMounted) setIsInsightsLoading(false);
      }
    };

    fetchSingleInsights();

    return () => {
      isMounted = false;
    };
  }, [checkIn]);

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
                  {Array.isArray(checkIn.dominantEmotion)
                    ? checkIn.dominantEmotion.join(', ')
                    : checkIn.dominantEmotion}
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
              {isInsightsLoading ? (
                <Card variant="glass" className="py-6 text-center text-sm text-muted-foreground animate-pulse">
                  ✨ Interpreting your reflections for this day...
                </Card>
              ) : (
                singleInsights.map((insight, idx) => (
                  <Card key={idx} variant="glass">
                    <p className="text-sm text-foreground">{insight}</p>
                  </Card>
                ))
              )}
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
              {isRecsLoading ? (
                <Card variant="glass" className="py-6 text-center text-sm text-muted-foreground animate-pulse">
                  ✨ Loading personalized suggestions...
                </Card>
              ) : (
                singleRecommendations.map((item, idx) => {
                  let IconComponent = Brain;
                  let gradientClass = "from-[var(--muted-blue)] to-[var(--soft-mint)]";

                  if (item.category === 'breathing') {
                    IconComponent = Heart;
                    gradientClass = "from-[var(--soft-purple)] to-[var(--soft-pink)]";
                  } else if (item.category === 'sound therapy' || item.category === 'relaxation') {
                    IconComponent = Moon;
                    gradientClass = "from-[var(--lavender)] to-[var(--soft-purple)]";
                  }

                  return (
                    <Card key={item.id || idx} className="cursor-pointer hover:shadow-xl transition-all"
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
                      }}>
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)] text-xs font-medium">
                              {item.duration || '5 min'}
                            </span>
                          </div>

                          <h4 className="mt-1 text-sm font-medium text-foreground truncate">{item.title}</h4>
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

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          role={userRole}
        />
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
