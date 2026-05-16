import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import otterImage from '../../../imports/vidra.png';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'center';
  mascotMessage?: string;
  highlightBottom?: boolean;
}

interface TherapistTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MindMend! 🦦',
    description: 'Let me show you around your therapist dashboard',
    position: 'center',
    mascotMessage: "Hi! I'm Otto, and I'll guide you through your new workspace"
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Track your appointments, patient insights, and daily overview here',
    position: 'bottom',
    targetSelector: '[data-tutorial="dashboard-tab"]',
    highlightBottom: true
  },
  {
    id: 'appointments',
    title: 'Manage Appointments',
    description: 'View upcoming sessions, manage your schedule, and handle appointment requests',
    position: 'bottom',
    targetSelector: '[data-tutorial="appointments-card"]'
  },
  {
    id: 'messages',
    title: 'Connect with Clients',
    description: 'Communicate with your clients through secure messaging. Stay connected between sessions',
    position: 'bottom',
    targetSelector: '[data-tutorial="messages-tab"]',
    highlightBottom: true
  },
  {
    id: 'content',
    title: 'Share Your Content',
    description: 'Create and share resources, exercises, and wellness content with the community',
    position: 'bottom',
    targetSelector: '[data-tutorial="content-center"]',
    highlightBottom: true
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Manage your availability, view content collections, and customize your settings',
    position: 'bottom',
    targetSelector: '[data-tutorial="profile-tab"]',
    highlightBottom: true
  }
];

export function TherapistTutorial({ onComplete, onSkip }: TherapistTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  useEffect(() => {
    if (step.targetSelector) {
      const updateTargetPosition = () => {
        const element = document.querySelector(step.targetSelector!);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      };

      // Initial position
      setTimeout(updateTargetPosition, 100);

      // Update on resize or scroll
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition);

      return () => {
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition);
      };
    } else {
      setTargetRect(null);
    }
  }, [currentStep, step.targetSelector]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const getTooltipPosition = () => {
    if (!targetRect || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const padding = 16;
    const tooltipWidth = 450;

    if (step.position === 'bottom' || step.highlightBottom) {
      // Position above the element
      return {
        bottom: `${window.innerHeight - targetRect.top + 16}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: `${tooltipWidth}px`
      };
    } else if (step.position === 'top') {
      // Position below the element
      return {
        top: `${targetRect.bottom + padding}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: `${tooltipWidth}px`
      };
    }

    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Spotlight overlay - dims everything except target */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`overlay-${step.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0"
          style={{
            background: targetRect && step.position !== 'center'
              ? 'transparent'
              : 'rgba(0, 0, 0, 0.6)',
            backdropFilter: step.position === 'center' ? 'blur(4px)' : 'none'
          }}
        />
      </AnimatePresence>

      {/* Spotlight effect with cutout */}
      {targetRect && step.position !== 'center' && (
        <motion.div
          key={`spotlight-${step.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0"
          style={{
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.7)`,
            left: `${targetRect.left - 8}px`,
            top: `${targetRect.top - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
            borderRadius: '1rem',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      )}

      {/* Highlight ring around target */}
      {targetRect && step.position !== 'center' && (
        <motion.div
          key={`highlight-${step.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute border-4 border-[var(--lavender)] rounded-2xl"
          style={{
            left: `${targetRect.left - 8}px`,
            top: `${targetRect.top - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
            boxShadow: '0 0 0 4px rgba(184, 164, 217, 0.2)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      )}

      {/* Tutorial tooltip card */}
      <div
        className="absolute pointer-events-auto px-4"
        style={getTooltipPosition()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.95, y: step.position === 'bottom' ? 10 : step.position === 'top' ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="relative"
          >
            {/* Card */}
            <div className="bg-card rounded-3xl p-6 shadow-2xl border-2 border-[var(--lavender)]/30 w-full">
              {/* Skip button */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-muted-foreground font-medium">
                  {currentStep + 1} of {tutorialSteps.length}
                </span>
                <button
                  onClick={handleSkip}
                  className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Mascot message */}
              {step.mascotMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-[var(--lavender)]/10"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center flex-shrink-0">
                    <img src={otterImage} alt="Otto" className="w-6 h-6 object-contain" />
                  </div>
                  <p className="text-sm text-foreground">{step.mascotMessage}</p>
                </motion.div>
              )}

              {/* Content */}
              <h2 className="text-xl text-foreground mb-2">{step.title}</h2>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-5">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]'
                        : index < currentStep
                        ? 'w-1.5 bg-[var(--lavender)]/50'
                        : 'w-1.5 bg-[var(--muted)]'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 rounded-2xl bg-[var(--muted)] text-foreground hover:bg-[var(--muted)]/70 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Go Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`${currentStep === 0 ? 'w-full' : 'flex-1'} py-3 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm font-medium shadow-lg`}
                >
                  {isLastStep ? 'Get Started' : 'Next'}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
