import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface UserSignUpFormProps {
  onSignUpSuccess: () => void;
  onBack: () => void;
}

export function UserSignUpForm({ onSignUpSuccess, onBack }: UserSignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordsMatch = password === confirmPassword || confirmPassword === '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    onSignUpSuccess();
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
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
            <h1 className="text-3xl text-foreground">Create your account</h1>
            <p className="mt-2 text-muted-foreground">Start your wellness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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
              disabled={!passwordsMatch || !password || !confirmPassword || !agreedToTerms}
              className="w-full h-14 bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-50"
            >
              Create Account
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-12">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
