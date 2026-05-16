import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Button } from '../ui/Button';
import { MoodEmoji } from '../ui/MoodEmoji';
import { ChatBubble } from '../ui/ChatBubble';
import { Badge } from '../ui/Badge';
import { X } from 'lucide-react';

interface MoodCheckInProps {
  onComplete: (data: any) => void;
  onClose: () => void;
}

export function MoodCheckIn({ onComplete, onClose }: MoodCheckInProps) {
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [showTyping, setShowTyping] = useState(false);

  const moods = [
    { id: 'terrible', emoji: '😢', label: 'Terrible', color: '#E89AA0' },
    { id: 'bad', emoji: '😟', label: 'Not Great', color: '#F5D6E3' },
    { id: 'okay', emoji: '😐', label: 'Okay', color: '#D4C5F9' },
    { id: 'good', emoji: '😊', label: 'Good', color: '#B8E0D2' },
    { id: 'amazing', emoji: '🥳', label: 'Amazing', color: '#B8A4D9' }
  ];

  const emotionTags = [
    'Anxious', 'Stressed', 'Calm', 'Happy', 'Sad', 'Energetic',
    'Tired', 'Grateful', 'Frustrated', 'Hopeful', 'Lonely', 'Content'
  ];

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    setTimeout(() => setStep(1), 500);
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const handleContinue = () => {
    if (step < 2) {
      setStep(step + 1);
      if (step === 1) {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
        }, 2000);
      }
    } else {
      onComplete({ mood: selectedMood, emotions: selectedEmotions, journal: journalEntry });
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">

      {/* HEADER - isolated, never overlapped */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 bg-background">
        <button
          onClick={onClose}
          type="button"
          className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center text-foreground hover:border-[var(--lavender)] transition-colors touch-manipulation z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-foreground">Daily Check-in</h2>
        <div className="w-10" />
      </div>

      {/* CONTENT - scrollable, completely below header */}
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="mood-select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
              <div className="text-center mb-8">
                <OtterMascot size="md" emotion="supportive" />
                <h3 className="text-xl mt-4">How are you feeling right now?</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {moods.map((mood) => (
                  <MoodEmoji
                    key={mood.id}
                    emoji={mood.emoji}
                    label={mood.label}
                    isSelected={selectedMood === mood.id}
                    onClick={() => handleMoodSelect(mood.id)}
                    color={mood.color}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="emotion-tags"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <ChatBubble
                sender="ai"
                message="I hear you. Can you tell me more about what you're feeling?"
              />

              <div className="flex flex-wrap gap-2 mt-4">
                {emotionTags.map((emotion) => (
                  <motion.button
                    key={emotion}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleEmotion(emotion)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedEmotions.includes(emotion)
                        ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-md'
                        : 'bg-card text-foreground shadow-sm hover:shadow-md'
                    }`}
                  >
                    {emotion}
                  </motion.button>
                ))}
              </div>

              <Button onClick={handleContinue} className="w-full mt-6" disabled={selectedEmotions.length === 0}>
                Continue
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {showTyping ? (
                <ChatBubble sender="ai" message="" typing />
              ) : (
                <ChatBubble
                  sender="ai"
                  message="Would you like to share what's on your mind? This is a safe, private space just for you. 💙"
                />
              )}

              <div className="bg-card rounded-3xl p-6 shadow-lg min-h-[200px]">
                <textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="Start writing..."
                  className="w-full min-h-[160px] bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleContinue} className="flex-1">
                  Skip
                </Button>
                <Button onClick={handleContinue} className="flex-1" disabled={!journalEntry.trim()}>
                  Complete Check-in
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}