import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTypingAnimation } from '../../hooks/useTypingAnimation';
import { X, ChevronRight } from 'lucide-react';

interface DailyCheckInProps {
  onComplete: (data: any) => void;
  onClose: () => void;
}

export function DailyCheckIn({ onComplete, onClose }: DailyCheckInProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const questions = [
    {
      id: 'emotionalState',
      type: 'mood-wheel',
      question: 'How are you feeling emotionally today?',
      hint: 'Choose what feels right in this moment',
      options: [
        { value: 'very-happy', emoji: '😄', label: 'Very Happy' },
        { value: 'happy', emoji: '🙂', label: 'Happy' },
        { value: 'neutral', emoji: '😐', label: 'Neutral' },
        { value: 'sad', emoji: '😢', label: 'Sad' },
        { value: 'anxious', emoji: '😰', label: 'Anxious' },
        { value: 'stressed', emoji: '😫', label: 'Stressed' }
      ]
    },
    {
      id: 'dominantEmotion',
      type: 'multi-select-chips',
      question: 'What emotions best describe your day so far?',
      hint: 'Select all that apply',
      options: [
        { id: 'joy', label: 'Joy', emoji: '✨' },
        { id: 'calm', label: 'Calm', emoji: '🌊' },
        { id: 'happy', label: 'Happy', emoji: '😊' },
        { id: 'excited', label: 'Excited', emoji: '🎉' },
        { id: 'content', label: 'Content', emoji: '😌' },
        { id: 'peaceful', label: 'Peaceful', emoji: '☮️' },
        { id: 'grateful', label: 'Grateful', emoji: '🙏' },
        { id: 'hopeful', label: 'Hopeful', emoji: '🌟' },
        { id: 'proud', label: 'Proud', emoji: '💪' },
        { id: 'energetic', label: 'Energetic', emoji: '⚡' },
        { id: 'motivated', label: 'Motivated', emoji: '🔥' },
        { id: 'stressed', label: 'Stressed', emoji: '😓' },
        { id: 'anxious', label: 'Anxious', emoji: '😟' },
        { id: 'worried', label: 'Worried', emoji: '😰' },
        { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵' },
        { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
        { id: 'angry', label: 'Angry', emoji: '😠' },
        { id: 'sad', label: 'Sad', emoji: '😢' },
        { id: 'lonely', label: 'Lonely', emoji: '😔' },
        { id: 'tired', label: 'Tired', emoji: '😴' },
        { id: 'confused', label: 'Confused', emoji: '😕' },
        { id: 'numb', label: 'Numb', emoji: '😶' },
        { id: 'restless', label: 'Restless', emoji: '😣' },
        { id: 'guilty', label: 'Guilty', emoji: '😞' }
      ]
    },
    {
      id: 'thoughtsToday',
      type: 'text',
      question: 'What has been on your mind the most today?',
      hint: 'Share whatever feels important to you',
      placeholder: 'Type your thoughts here...'
    },
    {
      id: 'stressLevel',
      type: 'slider',
      question: 'How would you rate your stress level today?',
      hint: 'Move the slider to reflect how you feel',
      min: 0,
      max: 10,
      labels: ['No stress', 'Extremely stressed']
    },
    {
      id: 'sleepQuality',
      type: 'sleep-selector',
      question: 'How was your sleep last night?',
      hint: 'Your sleep affects your emotional wellness',
      options: [
        { id: 'excellent', label: 'Excellent', emoji: '😴' },
        { id: 'good', label: 'Good', emoji: '🙂' },
        { id: 'okay', label: 'Okay', emoji: '😐' },
        { id: 'poor', label: 'Poor', emoji: '😕' },
        { id: 'very-poor', label: 'Very Poor', emoji: '😫' }
      ]
    },
    {
      id: 'energySource',
      type: 'text',
      question: 'What gave you energy or comfort today?',
      hint: 'Even small moments matter',
      placeholder: 'It could be a person, activity, or moment...'
    },
    {
      id: 'difficulties',
      type: 'text',
      question: 'Did anything make today emotionally difficult?',
      hint: 'It\'s okay to share what\'s been hard',
      placeholder: 'Share if you feel comfortable...',
      optional: true
    },
    {
      id: 'socialConnection',
      type: 'slider',
      question: 'How socially connected did you feel today?',
      hint: 'Connection looks different for everyone',
      min: 0,
      max: 10,
      labels: ['Very isolated', 'Very connected']
    },
    {
      id: 'gratitude',
      type: 'text',
      question: 'What is one thing you\'re grateful for today?',
      hint: 'Gratitude can shift our perspective',
      placeholder: 'Even the smallest thing counts...'
    },
    {
      id: 'tomorrowHelp',
      type: 'text',
      question: 'What would help you feel better tomorrow?',
      hint: 'Think about what you need',
      placeholder: 'Rest, connection, movement, quiet time...'
    }
  ];

  const question = questions[currentQuestion];
  const { displayedText: typedQuestion, isComplete: questionComplete } = useTypingAnimation(
    question?.question || '',
    25
  );

  const handleAnswer = (value: any) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleNext = () => {
    // If current question is a slider and no answer was given, set default value of 5
    if (question.type === 'slider' && answers[question.id] === undefined) {
      setAnswers({ ...answers, [question.id]: 5 });
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const finalAnswers = { ...answers };
      // Ensure slider questions have a default value if not answered
      if (question.type === 'slider' && finalAnswers[question.id] === undefined) {
        finalAnswers[question.id] = 5;
      }

      const checkInData = {
        ...finalAnswers,
        date: new Date().toISOString(),
        timestamp: Date.now()
      };
      onComplete(checkInData);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const canProceed = () => {
    const answer = answers[question.id];
    if (question.optional) return true;
    if (question.type === 'multi-select-chips') {
      return Array.isArray(answer) && answer.length > 0;
    }
    // Slider questions can proceed with default value (5)
    if (question.type === 'slider') {
      return true;
    }
    return answer !== undefined && answer !== '';
  };

  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Floating shapes */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-32 right-8 w-20 h-20 rounded-full bg-[var(--soft-mint)]/10 -z-10 pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-48 left-8 w-24 h-24 rounded-full bg-[var(--soft-pink)]/10 -z-10 pointer-events-none"
      />

      <div className="max-w-md mx-auto px-6 pt-6 relative z-10">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center text-foreground hover:border-[var(--lavender)] transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center -ml-10 pointer-events-none">
            <h1 className="text-xl text-foreground">Daily Check-In</h1>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-[var(--lavender)]">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]"
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Question text */}
            <div className="mb-8" key={`question-text-${currentQuestion}`}>
              <h2 className="text-2xl text-foreground mb-2">
                {typedQuestion}
                {!questionComplete && <span className="animate-pulse">|</span>}
              </h2>
              {questionComplete && question.hint && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground mt-2"
                >
                  {question.hint}
                </motion.p>
              )}
            </div>

            {/* Answer options */}
            {questionComplete && question && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Mood wheel */}
                {question.type === 'mood-wheel' && (
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {question.options?.map((option) => {
                      const isSelected = answers[question.id] === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAnswer(option.value)}
                          className={`p-4 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)] shadow-lg'
                              : 'bg-card border-[var(--border)]'
                          }`}
                        >
                          <div className="text-4xl mb-2">{option.emoji}</div>
                          <div className="text-xs text-foreground">{option.label}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Single select */}
                {question.type === 'single-select' && (
                  <div className="space-y-3 mb-8">
                    {question.options?.map((option) => {
                      const isSelected = answers[question.id] === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(option.id)}
                          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)] shadow-lg'
                              : 'bg-card border-[var(--border)]'
                          }`}
                        >
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="text-foreground">{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Multi-select chips */}
                {question.type === 'multi-select-chips' && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {question.options?.map((option) => {
                      const selectedArray = Array.isArray(answers[question.id]) ? answers[question.id] : [];
                      const isSelected = selectedArray.includes(option.id);
                      return (
                        <motion.button
                          key={option.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const currentSelections = Array.isArray(answers[question.id]) ? answers[question.id] : [];
                            const newSelections = isSelected
                              ? currentSelections.filter((id: string) => id !== option.id)
                              : [...currentSelections, option.id];
                            handleAnswer(newSelections);
                          }}
                          className={`px-4 py-2.5 rounded-full border-2 transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] border-[var(--lavender)] text-white shadow-lg'
                              : 'bg-card border-[var(--border)] text-foreground'
                          }`}
                        >
                          <span className="text-lg">{option.emoji}</span>
                          <span className="text-sm font-medium">{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Sleep selector */}
                {question.type === 'sleep-selector' && (
                  <div className="space-y-3 mb-8">
                    {question.options?.map((option) => {
                      const isSelected = answers[question.id] === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(option.id)}
                          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)] shadow-lg'
                              : 'bg-card border-[var(--border)]'
                          }`}
                        >
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="text-foreground">{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Text input */}
                {question.type === 'text' && (
                  <div className="mb-8">
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder={question.placeholder}
                      className="w-full p-4 rounded-2xl bg-card border-2 border-[var(--border)] focus:border-[var(--lavender)] focus:outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground"
                      rows={5}
                    />
                  </div>
                )}

                {/* Slider */}
                {question.type === 'slider' && (
                  <div className="mb-8">
                    <div className="bg-card rounded-3xl p-6 border-2 border-[var(--border)]">
                      <div className="text-center mb-4">
                        <div className="text-6xl font-medium text-[var(--lavender)] mb-2">
                          {answers[question.id] !== undefined ? answers[question.id] : 5}
                        </div>
                        <div className="text-sm text-muted-foreground">out of 10</div>
                      </div>
                      <input
                        type="range"
                        min={question.min}
                        max={question.max}
                        value={answers[question.id] !== undefined ? answers[question.id] : 5}
                        onChange={(e) => handleAnswer(parseInt(e.target.value))}
                        className="w-full h-3 bg-[var(--muted)] rounded-full appearance-none cursor-pointer slider-thumb"
                        style={{
                          background: `linear-gradient(to right, var(--lavender) 0%, var(--lavender) ${((answers[question.id] !== undefined ? answers[question.id] : 5) / question.max) * 100}%, var(--muted) ${((answers[question.id] !== undefined ? answers[question.id] : 5) / question.max) * 100}%, var(--muted) 100%)`
                        }}
                      />
                      {question.labels && (
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>{question.labels[0]}</span>
                          <span>{question.labels[1]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        {questionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3 mt-8"
          >
            {currentQuestion > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-4 rounded-2xl bg-[var(--muted)] text-foreground hover:bg-[var(--muted)]/70 transition-colors text-sm font-medium"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={`${currentQuestion === 0 ? 'w-full' : 'flex-1'} py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm font-medium shadow-lg disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isLastQuestion ? 'Complete Check-In' : 'Next'}
              {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
