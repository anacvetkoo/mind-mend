import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Calendar, MessageCircle, Sparkles, ChevronRight } from 'lucide-react';

interface WelcomeOnboardingProps {
  onComplete: () => void;
}

export function WelcomeOnboarding({ onComplete }: WelcomeOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Heart,
      title: 'Welcome to MindMend',
      subtitle: 'Your safe space for mental wellness and emotional growth',
      color: 'var(--soft-pink)',
      gradient: 'from-[var(--soft-pink)]/20 to-[var(--lavender)]/20'
    },
    {
      icon: MessageCircle,
      title: 'AI-Powered Support',
      subtitle: 'Chat with Otto, your compassionate AI companion, anytime you need support',
      color: 'var(--lavender)',
      gradient: 'from-[var(--lavender)]/20 to-[var(--soft-purple)]/20'
    },
    {
      icon: Sparkles,
      title: 'Track Your Journey',
      subtitle: 'Understand your emotions with mood tracking and personalized insights',
      color: 'var(--soft-mint)',
      gradient: 'from-[var(--soft-mint)]/20 to-[var(--muted-blue)]/20'
    },
    {
      icon: Calendar,
      title: 'Connect with Therapists',
      subtitle: 'Book appointments with licensed professionals who care about your wellbeing',
      color: 'var(--muted-blue)',
      gradient: 'from-[var(--muted-blue)]/20 to-[var(--soft-mint)]/20'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-10 w-32 h-32 rounded-full bg-[var(--lavender)]/10"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-40 left-10 w-40 h-40 rounded-full bg-[var(--soft-pink)]/10"
        />
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-[var(--soft-mint)]/10"
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 pt-12 pb-8 min-h-screen flex flex-col">
        {/* Skip button */}
        <div className="flex justify-end mb-8 relative z-20">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              {/* Icon illustration */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className={`w-48 h-48 mx-auto mb-12 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center`}
              >
                {React.createElement(slides[currentSlide].icon, {
                  className: "w-24 h-24",
                  style: { color: slides[currentSlide].color }
                })}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl text-foreground mb-4"
              >
                {slides[currentSlide].title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground px-4 leading-relaxed"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8 relative z-20">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]'
                  : 'w-2 bg-[var(--muted)]'
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          type="button"
          className="relative z-20 w-full py-5 rounded-3xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-lg font-medium flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
