import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { signUpTherapist } from '../../services/auth';

interface TherapistSignUpFormProps {
  onSignUpSuccess: () => void;
  onBack: () => void;
}

export function TherapistSignUpForm({ onSignUpSuccess, onBack }: TherapistSignUpFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordsMatch = password === confirmPassword || confirmPassword === '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;

    setError('');
    setIsLoading(true);

    const result = await signUpTherapist(email, password, firstName, lastName);

    setIsLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Sign up failed.');
      return;
    }

    onSignUpSuccess();
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl text-foreground">Join as a Therapist</h1>
            <p className="mt-2 text-muted-foreground">Help others on their wellness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-card border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none shadow-md transition-all"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full h-12 pl-4 pr-4 rounded-2xl bg-card border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none shadow-md transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-card border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none shadow-md transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 pl-12 pr-12 rounded-2xl bg-card border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none shadow-md transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full h-12 pl-12 pr-12 rounded-2xl bg-card border-2 ${!passwordsMatch && confirmPassword ? 'border-red-400' : 'border-transparent'} focus:border-[var(--lavender)] focus:outline-none shadow-md transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {!passwordsMatch && confirmPassword && (
              <p className="text-xs text-red-500 -mt-2">Passwords do not match</p>
            )}

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-2 border-[var(--muted-foreground)]/30 bg-card checked:bg-[var(--lavender)] checked:border-[var(--lavender)] focus:ring-[var(--lavender)] focus:ring-2 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the{' '}
                <button type="button" className="text-sm text-[var(--lavender)] underline">
                  Terms and Conditions
                </button>
                {' '}and{' '}
                <button type="button" className="text-sm text-[var(--lavender)] underline">
                  Privacy Policy
                </button>
              </label>
            </div>

            <Button
              type="submit"
              disabled={!passwordsMatch || !password || !confirmPassword || !firstName || !lastName || !agreedToTerms || isLoading}
              className="w-full h-14 bg-gradient-to-r from-[var(--soft-mint)] to-[var(--muted-blue)] text-white disabled:opacity-50"
            >
              {isLoading ? 'Creating account…' : 'Create Therapist Account'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}