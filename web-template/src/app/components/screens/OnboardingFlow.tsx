import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ProgressBar } from '../ui/ProgressBar';
import { ChatBubble } from '../ui/ChatBubble';

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goals, setGoals] = useState<string[]>([]);

  const totalSteps = 4;

  const goalOptions = [
    { id: 'stress', label: 'Manage Stress', emoji: '😮‍💨' },
    { id: 'sleep', label: 'Better Sleep', emoji: '😴' },
    { id: 'anxiety', label: 'Reduce Anxiety', emoji: '😰' },
    { id: 'focus', label: 'Improve Focus', emoji: '🎯' },
    { id: 'burnout', label: 'Prevent Burnout', emoji: '🔥' },
    { id: 'relationships', label: 'Relationships', emoji: '💝' }
  ];

  const toggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete({ name, goals });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <OtterMascot size="lg" emotion="happy" />
            </div>
            <ChatBubble
              sender="ai"
              message="Hi there! I'm Otto, your AI companion. I'm here to support you on your mental wellness journey. 🌟"
            />
            <ChatBubble sender="ai" message="Let's get to know each other! What should I call you?" />
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-4"
            />
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <ChatBubble sender="ai" message="What would you like to focus on? You can select multiple goals! 🎯" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              {goalOptions.map((goal) => (
                <Button
                  key={goal.id}
                  variant={goals.includes(goal.id) ? 'primary' : 'outline'}
                  onClick={() => toggleGoal(goal.id)}
                  className="h-auto py-4"
                >
                  <span className="text-2xl mr-2">{goal.emoji}</span>
                  <span className="text-sm">{goal.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <ChatBubble
              sender="ai"
              message="Would you like gentle reminders to check in with yourself throughout the day? 🔔"
            />
            <div className="space-y-3 mt-4">
              <Button variant="primary" className="w-full">
                Yes, daily reminders
              </Button>
              <Button variant="outline" className="w-full">
                Maybe later
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <OtterMascot size="lg" emotion="excited" />
            </div>
            <ChatBubble
              sender="ai"
              message="You're all set! I'm excited to support you on this journey. Remember, I'm here whenever you need me. 💙"
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto pt-8">
        <ProgressBar progress={step + 1} total={totalSteps} />

        <div className="mt-8">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>

        <div className="mt-8">
          <Button onClick={handleNext} className="w-full" disabled={step === 0 && !name}>
            {step === totalSteps - 1 ? "Let's Begin!" : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
