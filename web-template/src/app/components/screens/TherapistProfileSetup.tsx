import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Camera, ChevronRight, ChevronLeft, User } from 'lucide-react';
import { useTypingAnimation } from '../../hooks/useTypingAnimation';

interface TherapistProfileSetupProps {
  onComplete: (profileData: TherapistProfileData) => void;
  onSkip?: () => void;
}

export interface TherapistProfileData {
  name: string;
  profileImage?: string;
  title: string;
  specializations: string[];
  fieldOfWork: string;
  bio: string;
  yearsOfExperience: string;
  education: string;
  licenseNumber: string;
}

const SPECIALIZATIONS = [
  'Anxiety',
  'Depression',
  'Trauma & PTSD',
  'Relationship Issues',
  'Stress Management',
  'Grief & Loss',
  'Self-Esteem',
  'Life Transitions',
  'Addiction',
  'Eating Disorders',
  'Anger Management',
  'Family Conflict'
];

const FIELDS_OF_WORK = [
  'Clinical Psychology',
  'Counseling Psychology',
  'Marriage & Family Therapy',
  'Social Work',
  'Psychiatric Nursing',
  'Life Coaching',
  'Art Therapy',
  'Cognitive Behavioral Therapy',
  'Psychotherapy',
  'Other'
];

export function TherapistProfileSetup({ onComplete, onSkip }: TherapistProfileSetupProps) {
  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState<TherapistProfileData>({
    name: '',
    profileImage: '',
    title: '',
    specializations: [],
    fieldOfWork: '',
    bio: '',
    yearsOfExperience: '',
    education: '',
    licenseNumber: ''
  });

  const questions = [
    {
      id: 'name',
      type: 'text',
      question: "What's your full name?",
      hint: 'This will be displayed to potential clients',
      placeholder: 'Dr. Sarah Mitchell'
    },
    {
      id: 'profileImage',
      type: 'image',
      question: 'Add your profile photo',
      hint: 'A professional photo helps clients connect with you'
    },
    {
      id: 'title',
      type: 'text',
      question: 'What is your professional title?',
      hint: 'e.g., Licensed Clinical Psychologist, LMFT, MSW',
      placeholder: 'Licensed Clinical Psychologist'
    },
    {
      id: 'fieldOfWork',
      type: 'select',
      question: 'What is your primary field of work?',
      hint: 'Select the category that best describes your practice',
      options: FIELDS_OF_WORK
    },
    {
      id: 'specializations',
      type: 'multi-select',
      question: 'What are your specializations?',
      hint: 'Select all areas where you have expertise',
      options: SPECIALIZATIONS
    },
    {
      id: 'yearsOfExperience',
      type: 'text',
      question: 'How many years of experience do you have?',
      hint: 'This helps clients understand your expertise',
      placeholder: '5'
    },
    {
      id: 'education',
      type: 'textarea',
      question: 'What is your educational background?',
      hint: 'Include degrees, certifications, and relevant training',
      placeholder: 'Ph.D. in Clinical Psychology, Stanford University\nLicensed Clinical Psychologist (CA)'
    },
    {
      id: 'licenseNumber',
      type: 'text',
      question: 'What is your license number?',
      hint: 'Required for verification purposes',
      placeholder: 'PSY12345'
    },
    {
      id: 'bio',
      type: 'textarea',
      question: 'Tell us about yourself',
      hint: 'Share your approach, values, and what makes you unique',
      placeholder: 'I specialize in helping individuals navigate anxiety and life transitions using evidence-based approaches...'
    }
  ];

  const currentQuestion = questions[step];
  const { displayedText: typedQuestion, isComplete: questionComplete } = useTypingAnimation(
    currentQuestion?.question || '',
    25
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnswer = (field: string, value: any) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(profileData);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    const value = profileData[currentQuestion.id as keyof TherapistProfileData];
    if (currentQuestion.type === 'multi-select') {
      return Array.isArray(value) && value.length > 0;
    }
    if (currentQuestion.id === 'profileImage') {
      return true; // Optional
    }
    return value !== undefined && value !== '';
  };

  const isLastQuestion = step === questions.length - 1;

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Floating shapes */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-32 right-8 w-20 h-20 rounded-full bg-[var(--soft-mint)]/10 -z-10"
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-48 left-8 w-24 h-24 rounded-full bg-[var(--soft-pink)]/10 -z-10"
      />

      <div className="max-w-md mx-auto px-6 pt-12 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl text-foreground">Complete Your Profile</h1>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Skip for now
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-[var(--lavender)]">
              {Math.round(((step + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]"
              animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Question text */}
            <div className="mb-8" key={`question-text-${step}`}>
              <h2 className="text-2xl text-foreground mb-2">
                {typedQuestion}
                {!questionComplete && <span className="animate-pulse">|</span>}
              </h2>
              {questionComplete && currentQuestion.hint && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground mt-2"
                >
                  {currentQuestion.hint}
                </motion.p>
              )}
            </div>

            {/* Answer options */}
            {questionComplete && currentQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Image upload */}
                {currentQuestion.type === 'image' && (
                  <div className="mb-8">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center overflow-hidden">
                          {profileData.profileImage ? (
                            <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-16 h-16 text-white" />
                          )}
                        </div>
                        <label
                          htmlFor="profile-image"
                          className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
                        >
                          <Camera className="w-5 h-5 text-white" />
                        </label>
                        <input
                          type="file"
                          id="profile-image"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">Click the camera icon to upload</p>
                    </div>
                  </div>
                )}

                {/* Text input */}
                {currentQuestion.type === 'text' && (
                  <div className="mb-8">
                    <input
                      type="text"
                      value={profileData[currentQuestion.id as keyof TherapistProfileData] as string || ''}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="w-full p-4 rounded-2xl bg-card border-2 border-[var(--border)] focus:border-[var(--lavender)] focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}

                {/* Textarea */}
                {currentQuestion.type === 'textarea' && (
                  <div className="mb-8">
                    <textarea
                      value={profileData[currentQuestion.id as keyof TherapistProfileData] as string || ''}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="w-full p-4 rounded-2xl bg-card border-2 border-[var(--border)] focus:border-[var(--lavender)] focus:outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground"
                      rows={5}
                    />
                  </div>
                )}

                {/* Select */}
                {currentQuestion.type === 'select' && (
                  <div className="space-y-3 mb-8">
                    {currentQuestion.options?.map((option) => {
                      const isSelected = profileData.fieldOfWork === option;
                      return (
                        <motion.button
                          key={option}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer('fieldOfWork', option)}
                          className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)] shadow-lg'
                              : 'bg-card border-[var(--border)]'
                          }`}
                        >
                          <span className="text-foreground">{option}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Multi-select */}
                {currentQuestion.type === 'multi-select' && (
                  <div className="mb-8">
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options?.map((option) => {
                        const isSelected = profileData.specializations.includes(option);
                        return (
                          <motion.button
                            key={option}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const current = profileData.specializations;
                              const updated = isSelected
                                ? current.filter(s => s !== option)
                                : [...current, option];
                              handleAnswer('specializations', updated);
                            }}
                            className={`p-3 rounded-2xl border-2 transition-all text-sm ${
                              isSelected
                                ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)] shadow-md'
                                : 'bg-card border-[var(--border)]'
                            }`}
                          >
                            <span className="text-foreground">{option}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    {profileData.specializations.length > 0 && (
                      <p className="text-sm text-[var(--lavender)] mt-3">
                        {profileData.specializations.length} selected
                      </p>
                    )}
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
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 py-4 rounded-2xl bg-[var(--muted)] text-foreground hover:bg-[var(--muted)]/70 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`${step === 0 ? 'w-full' : 'flex-1'} py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm font-medium shadow-lg disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isLastQuestion ? 'Complete Profile' : 'Next'}
              {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
