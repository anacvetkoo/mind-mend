import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface BreathingAnimationProps {
  isActive?: boolean;
  pattern?: '478' | 'box' | 'calm';
}

export function BreathingAnimation({ isActive = true, pattern = '478' }: BreathingAnimationProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');

  const patterns = {
    '478': { inhale: 4, hold: 7, exhale: 8, rest: 0 },
    box: { inhale: 4, hold: 4, exhale: 4, rest: 4 },
    calm: { inhale: 4, hold: 2, exhale: 6, rest: 2 }
  };

  const currentPattern = patterns[pattern];

  useEffect(() => {
    if (!isActive) return;

    const cycle = () => {
      const sequence = [
        { phase: 'inhale' as const, duration: currentPattern.inhale * 1000 },
        { phase: 'hold' as const, duration: currentPattern.hold * 1000 },
        { phase: 'exhale' as const, duration: currentPattern.exhale * 1000 },
        { phase: 'rest' as const, duration: currentPattern.rest * 1000 }
      ].filter(step => step.duration > 0);

      let index = 0;

      const runSequence = () => {
        const step = sequence[index];
        setPhase(step.phase);

        setTimeout(() => {
          index = (index + 1) % sequence.length;
          runSequence();
        }, step.duration);
      };

      runSequence();
    };

    cycle();
  }, [isActive, pattern]);

  const phaseConfig = {
    inhale: { text: 'Breathe In', scale: 1.5, color: 'var(--soft-mint)' },
    hold: { text: 'Hold', scale: 1.5, color: 'var(--muted-blue)' },
    exhale: { text: 'Breathe Out', scale: 0.8, color: 'var(--lavender)' },
    rest: { text: 'Rest', scale: 1, color: 'var(--soft-purple)' }
  };

  const config = phaseConfig[phase];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        className="relative w-48 h-48 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${config.color}40, ${config.color}10)`
        }}
        animate={{
          scale: config.scale
        }}
        transition={{
          duration: phase === 'inhale' ? currentPattern.inhale :
                   phase === 'hold' ? currentPattern.hold :
                   phase === 'exhale' ? currentPattern.exhale :
                   currentPattern.rest,
          ease: 'easeInOut'
        }}
      >
        <motion.div
          className="w-32 h-32 rounded-full"
          style={{
            background: `radial-gradient(circle, ${config.color}, ${config.color}80)`
          }}
          animate={{
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>

      <motion.div
        className="mt-8 text-center"
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-2xl text-[var(--foreground)] mb-2">{config.text}</h3>
        <p className="text-[var(--muted-foreground)]">
          {phase === 'inhale' && `For ${currentPattern.inhale} seconds`}
          {phase === 'hold' && `For ${currentPattern.hold} seconds`}
          {phase === 'exhale' && `For ${currentPattern.exhale} seconds`}
          {phase === 'rest' && currentPattern.rest > 0 && `For ${currentPattern.rest} seconds`}
        </p>
      </motion.div>
    </div>
  );
}
