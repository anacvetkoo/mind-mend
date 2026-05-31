import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/Button';
import { Brain, ChevronLeft, Sparkles, ShieldAlert, FileDown, Lock } from 'lucide-react';
import { getFirebaseCheckIns, isTodayCompleted } from '../../utils/checkInUtils';
import { generateAIAnalysis } from '../../services/gemini';

interface AiInsightsScreenProps {
  userId: string;
  onBack: () => void;
  onCheckIn: () => void;
}

export function AiInsightsScreen({ userId, onBack, onCheckIn }: AiInsightsScreenProps) {
  const [deepAnalysis, setDeepAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLogs, setHasLogs] = useState(true);
  const [allowedToday, setAllowedToday] = useState(false);

  useEffect(() => {
    const runDeepMentalAnalysis = async () => {
      setIsLoading(true);
      try {
        const completedToday = await isTodayCompleted(); //preverimo če je uporabnik že danes opravil check-in

        if (!completedToday) {
          setAllowedToday(false);
          setIsLoading(false);
          return;
        }

        setAllowedToday(true);

        const allCheckIns = await getFirebaseCheckIns();
        const userLogs = (allCheckIns || []).filter(c => c.userId === userId);

        if (userLogs.length === 0) {
          setHasLogs(false);
          setIsLoading(false);
          return;
        }
        
        //zadnjih 10 dnevnikov
        const last10Logs = userLogs.slice(0, 10).map(c => ({
          date: c.date,
          mood: c.emotionalState || 'neutral',
          emotions: Array.isArray(c.dominantEmotion) ? c.dominantEmotion.join(', ') : c.dominantEmotion || 'none',
          stressLevel: c.stressLevel ?? 'unknown',
          sleepQuality: c.sleepQuality || 'not specified',
          difficulties: c.difficulties || 'none reported',
          thoughtsToday: c.thoughtsToday || 'none reported',
          gratitude: c.gratitude || 'none reported',
          tomorrowHelp: c.tomorrowHelp || 'none reported'
        }));

        //preverimo, ali že imamo shranjeno današnjo analizo v localStorage - da ni večkrat dnevno
        const todayKey = `mindmend_analysis_${new Date().toISOString().split('T')[0]}_${userId}`;
        const cachedAnalysis = localStorage.getItem(todayKey);

        if (cachedAnalysis) {
          setDeepAnalysis(cachedAnalysis);
        } else {
          const rawAnalysis = await generateAIAnalysis(last10Logs);
          setDeepAnalysis(rawAnalysis);
          localStorage.setItem(todayKey, rawAnalysis);
        }

      } catch (error) {
        console.error("Napaka pri globoki AI analizi:", error);
        setDeepAnalysis("We encountered an issue analyzing your historical journals. Please ensure your internet connection is stable and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      runDeepMentalAnalysis();
    }
  }, [userId]);

    // Funkcija za preprost in čist izvoz poročila v PDF preko tiskalnika brskalnika
  const handleExportPDF = () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>MindMend Cognitive Report</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #2D3748;
              line-height: 1.6;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header {
              border-bottom: 2px solid #E2E8F0;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            h1 {
              color: #4C51BF;
              margin: 0;
              font-size: 26px;
              font-weight: 700;
            }
            .date {
              font-size: 14px;
              color: #718096;
            }
            .content {
              font-size: 15px;
              white-space: pre-wrap;
              color: #1A202C;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #E2E8F0;
              padding-top: 15px;
              font-size: 11px;
              color: #A0AEC0;
              text-align: center;
            }
              /* Avtomatsko sprožimo tiskalniški dialog takoj, ko se stran naloži */
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MindMend Cognitive Report</h1>
            <div class="date">Date: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="content">${deepAnalysis}</div>

          <div class="footer">
            Disclaimer: This is an automated AI mental wellness evaluation and does not replace professional medical or psychological advice.
          </div>

           <script>
            // Trik: Takoj ko se ta začasni dokument odpre, sprožimo print/PDF meni
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `.trim();

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        alert("Please allow pop-ups for MindMend to export your PDF.");
      }

      setTimeout(() => URL.revokeObjectURL(url), 100);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Could not generate the PDF report.");
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-24 pt-12 px-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="max-w-md mx-auto">
        {/* Nazaj gumb - skrijemo ga med tiskanjem */}
        <div className="no-print">
          <Button variant="secondary" size="sm" onClick={onBack} className="mb-6 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-8 h-8 text-[var(--lavender)]" />
            <h1 className="text-3xl text-foreground font-semibold">Cognitive Analysis</h1>
          </div>
          <p className="text-muted-foreground">Deep emotional evaluation, trigger tracking, and pattern identification across your last 10 journals.</p>
        </motion.div>

        {/* Izris analize in pogojev */}
        <div className="space-y-4">
          {isLoading ? (
            <Card variant="glass" className="py-16 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-[var(--lavender)] border-t-transparent animate-spin" />
              <div className="text-sm text-muted-foreground px-6 animate-pulse">
                ✨ Otto is looking through your last 10 journal entries, evaluating stress patterns, and mapping emotional triggers...
              </div>
            </Card>
          ) : !allowedToday ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="p-6 text-center border-2 border-dashed border-[var(--lavender)]/40 bg-[var(--lavender)]/5">
                <Lock className="w-12 h-12 text-[var(--lavender)] mx-auto mb-3" />
                <h3 className="text-lg font-medium text-foreground mb-2">Analysis Locked</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To ensure highly accurate and fresh data, your daily cognitive report is unlocked **only after** you complete your Daily Check-in.
                </p>
                <Button onClick={onCheckIn} className="w-full bg-[var(--lavender)] text-white hover:bg-[var(--soft-purple)]">
                  Complete Today's Check-in
                </Button>
              </Card>
            </motion.div>
          ) : !hasLogs ? (
            <Card className="p-6 text-center text-muted-foreground">
              <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-sm">No journal history found. Please complete some daily check-ins first so the AI can find emotional patterns!</p>
            </Card>
          ) : (
             // USPEŠEN PRIKAZ GENERIRANE ANALIZE
             <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             {/* ID "printable-report" pove našemu CSS-u kaj točno naj izvozi v PDF */}
             <Card id="printable-report" variant="glass" className="p-6 border-t-4 border-[var(--lavender)] shadow-xl bg-card">
               <div className="flex items-center justify-between mb-4 border-b border-border pb-3 no-print-header">
                 <div className="flex items-center gap-2 text-[var(--lavender)] font-semibold">
                   <Sparkles className="w-5 h-5" />
                   <h3>Cognitive Report</h3>
                 </div>
                 <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                   {new Date().toLocaleDateString()}
                 </span>
               </div>
               
               <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap space-y-3">
                 {deepAnalysis}
               </div>
             </Card>

              <Button
                variant="secondary"
                onClick={handleExportPDF}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--lavender)]/30 text-[var(--lavender)] hover:bg-[var(--lavender)]/10"
              >
                <FileDown className="w-4 h-4" /> Save Report as PDF
              </Button>

              <p className="text-[10px] text-muted-foreground/50 text-center px-4 mt-2">
                AI Pattern Recognition is an automated educational evaluation tool. It does not replace psychological diagnosis, therapy, or medical evaluations.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}