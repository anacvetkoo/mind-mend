import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Sparkles, TrendingUp, AlertCircle, Heart, Wind, Music } from 'lucide-react';

interface AIAnalysisProps {
  moodData: any;
  onClose: () => void;
}

export function AIAnalysis({ moodData, onClose }: AIAnalysisProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <OtterMascot size="lg" emotion="thinking" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <h3 className="text-xl text-foreground mb-2">Analyzing your emotions...</h3>
          <p className="text-muted-foreground">Generating personalized insights</p>
        </motion.div>

        <motion.div
          className="mt-8 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="w-3 h-3 bg-[var(--lavender)] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-3 h-3 bg-[var(--lavender)] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-3 h-3 bg-[var(--lavender)] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <OtterMascot size="md" emotion="supportive" />
          <h2 className="text-2xl text-foreground mt-4">Your Wellness Insights</h2>
          <p className="text-muted-foreground mt-2">Here's what I noticed today</p>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-6"
        >
          <Card variant="glass">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Emotional Pattern</h4>
                <p className="text-sm text-muted-foreground">
                  You've been experiencing stress in the afternoons. This might be related to work deadlines. Taking short breaks could help.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--soft-mint)] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Progress Update</h4>
                <p className="text-sm text-muted-foreground">
                  Your overall mood has improved by 18% this week compared to last week. Keep up the great work!
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--soft-pink)] flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Gentle Reminder</h4>
                <p className="text-sm text-muted-foreground">
                  You mentioned feeling tired frequently. Consider adjusting your sleep schedule or trying a bedtime meditation.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h3 className="text-xl text-foreground mb-4">Recommended for You</h3>

          <div className="space-y-3">
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--muted-blue)] to-[var(--soft-mint)] flex items-center justify-center">
                  <Wind className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="secondary">5 min</Badge>
                  <h4 className="mt-2">4-7-8 Breathing</h4>
                  <p className="text-sm text-muted-foreground">Reduce stress instantly</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--soft-purple)] to-[var(--soft-pink)] flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="primary">10 min</Badge>
                  <h4 className="mt-2">Loving Kindness</h4>
                  <p className="text-sm text-muted-foreground">Build self-compassion</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--lavender)] to-[var(--muted-blue)] flex items-center justify-center">
                  <Music className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="success">15 min</Badge>
                  <h4 className="mt-2">Calming Soundscape</h4>
                  <p className="text-sm text-muted-foreground">Peaceful nature sounds</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3"
        >
          <Button variant="outline" onClick={onClose} className="flex-1">
            View History
          </Button>
          <Button onClick={onClose} className="flex-1">
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
