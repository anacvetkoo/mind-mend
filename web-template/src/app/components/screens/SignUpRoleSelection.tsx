import React from 'react';
import { motion } from 'motion/react';
import { OtterMascot } from '../mascot/OtterMascot';
import { User, Briefcase } from 'lucide-react';

interface SignUpRoleSelectionProps {
  onSelectRole: (role: 'user' | 'therapist') => void;
  onBackToLogin: () => void;
}

export function SignUpRoleSelection({ onSelectRole, onBackToLogin }: SignUpRoleSelectionProps) {
  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <OtterMascot size="lg" emotion="happy" />
            </div>
            <h1 className="text-3xl text-foreground">Sign up</h1>
            <p className="mt-2 text-muted-foreground">Choose how you'd like to join</p>
          </div>

          <div className="space-y-4 mb-8">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectRole('user')}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-lg flex items-center justify-center gap-3 text-lg"
            >
              <User className="w-6 h-6" />
              <span>Continue as User</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectRole('therapist')}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-[var(--soft-mint)] to-[var(--muted-blue)] text-white shadow-lg flex items-center justify-center gap-3 text-lg"
            >
              <Briefcase className="w-6 h-6" />
              <span>Continue as Therapist</span>
            </motion.button>
          </div>

          <div className="text-center">
            <button onClick={onBackToLogin} className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <span className="text-[var(--lavender)] hover:underline">Log in</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
