import React, { useState } from 'react';
import { motion } from 'motion/react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Button } from '../ui/Button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (role: 'user' | 'therapist') => void;
  onSignUpClick: () => void;
}

export function LoginScreen({ onLoginSuccess, onSignUpClick }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app would validate credentials
    onLoginSuccess('user');
  };

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

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-[var(--lavender)] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full h-14 bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white">
              Log in
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

          <Button variant="outline" className="w-full h-12 mb-6">
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
  );
}