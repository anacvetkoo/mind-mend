import React, { useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { SignUpRoleSelection } from './SignUpRoleSelection';
import { UserSignUpForm } from './UserSignUpForm';
import { TherapistSignUpForm } from './TherapistSignUpForm';

type UserRole = 'user' | 'therapist' | 'admin';
type AuthFlow = 'login' | 'signupRole' | 'signupUser' | 'signupTherapist';

interface AuthScreenProps {
  onComplete: (role: UserRole, skipQuestionnaire?: boolean) => void;
}

export function AuthScreen({ onComplete }: AuthScreenProps) {
  const [flow, setFlow] = useState<AuthFlow>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  const handleLoginSuccess = (role: UserRole) => {
    // Login = skip questionnaire
    onComplete(role, true);
  };

  const handleRoleSelection = (role: 'user' | 'therapist') => {
    setSelectedRole(role);
    if (role === 'user') {
      setFlow('signupUser');
    } else {
      setFlow('signupTherapist');
    }
  };

  const handleSignUpSuccess = () => {
    // Sign up = don't skip questionnaire (for users)
    onComplete(selectedRole, false);
  };

  if (flow === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onSignUpClick={() => setFlow('signupRole')}
      />
    );
  }

  if (flow === 'signupRole') {
    return (
      <SignUpRoleSelection
        onSelectRole={handleRoleSelection}
        onBackToLogin={() => setFlow('login')}
      />
    );
  }

  if (flow === 'signupUser') {
    return (
      <UserSignUpForm
        onSignUpSuccess={handleSignUpSuccess}
        onBack={() => setFlow('signupRole')}
      />
    );
  }

  if (flow === 'signupTherapist') {
    return (
      <TherapistSignUpForm
        onSignUpSuccess={handleSignUpSuccess}
        onBack={() => setFlow('signupRole')}
      />
    );
  }

  return null;
}

export type { UserRole };