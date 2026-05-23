import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Button } from '../ui/Button';
import { Mail, Lock, Eye, EyeOff, X, ArrowLeft } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, sendPasswordReset } from '../../services/auth';
import type { UserRole } from '../../services/auth';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole) => void;
  onSignUpClick: () => void;
}

const ForgotPasswordModal = ({ onClose }: { onClose: () => void }) => {
  const [resetEmail, setResetEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSendReset = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email address.');
      return;
    }
    setResetError('');
    setIsSending(true);
    const result = await sendPasswordReset(resetEmail);
    setIsSending(false);
    if (result.success) {
      setResetSent(true);
    } else {
      setResetError(result.error ?? 'Could not send reset email.');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-md bg-card rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg text-foreground">Reset Password</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {resetSent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center py-4"
            >
              <OtterMascot size="md" emotion="happy" />
              <h3 className="mt-4 text-xl text-foreground">Check your inbox!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                If <span className="text-[var(--lavender)]">{resetEmail}</span> is registered with MindMend, you'll receive a reset link shortly.
              </p>
              <Button
                onClick={onClose}
                className="mt-8 w-full h-12 bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white"
              >
                Got it
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-muted-foreground mb-6">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>

              <div className="relative mb-4">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReset()}
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-background border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none shadow-md transition-all"
                />
              </div>

              {resetError && (
                <p className="text-xs text-red-500 mb-4">{resetError}</p>
              )}

              <Button
                onClick={handleSendReset}
                disabled={isSending}
                className="w-full h-12 bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-50"
              >
                {isSending ? 'Sending…' : 'Send reset link'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export function LoginScreen({ onLoginSuccess, onSignUpClick }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await loginWithEmail(email, password);

    setIsLoading(false);

    if (!result.success || !result.role) {
      setError(result.error ?? 'Login failed.');
      return;
    }

    onLoginSuccess(result.role);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    const result = await loginWithGoogle();

    setIsLoading(false);

    if (!result.success || !result.role) {
      setError(result.error ?? 'Google login failed.');
      return;
    }

    onLoginSuccess(result.role);
  };

  return (
    <>
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
              <h1 className="text-3xl text-foreground">Log in</h1>
              <p className="mt-2 text-muted-foreground">Welcome back to MindMend</p>
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

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[var(--lavender)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-50"
              >
                {isLoading ? 'Logging in…' : 'Log in'}
              </Button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 mb-6 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center">
              <button onClick={onSignUpClick} className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <span className="text-[var(--lavender)] hover:underline">Sign up</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showForgotPassword && (
          <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
        )}
      </AnimatePresence>
    </>
  );
}