import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTypingAnimation } from '../../hooks/useTypingAnimation';
import { ChevronRight, Heart, Search, ArrowLeft } from 'lucide-react';
import otterImage from '../../../imports/vidra.png';

interface EnhancedQuestionnaireProps {
  onComplete: (data: any) => void;
}

export function EnhancedQuestionnaire({ onComplete }: EnhancedQuestionnaireProps) {
  const [phase, setPhase] = useState<'intro' | 'questions'>('intro');
  const [introStep, setIntroStep] = useState(0);
  const [questionStep, setQuestionStep] = useState(0);
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [medicationSearch, setMedicationSearch] = useState('');
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');

  // Intro messages
  const introMessages = [
    "Hi there! I'm Otto, your friendly mental wellness companion 🦦",
    "I'm here to support you on your journey to better mental health",
    "Let me ask you a few questions to personalize your experience",
    "First, what should I call you?"
  ];

  const currentIntroMessage = introMessages[introStep] || '';
  const { displayedText: typedIntro, isComplete: introComplete } = useTypingAnimation(
    currentIntroMessage,
    15
  );

  // Questions
  const questions = [
    {
      id: 'healthGoal',
      type: 'single-select-cards',
      question: "What's your health goal for today?",
      options: [
        { id: 'reduce-stress', label: 'I wanna reduce stress', emoji: '😌' },
        { id: 'ai-therapy', label: 'I wanna try AI therapy', emoji: '🤖' },
        { id: 'cope-trauma', label: 'I want to cope with trauma', emoji: '💙' },
        { id: 'better-person', label: 'I want to be a better person', emoji: '✨' },
        { id: 'trying-out', label: 'Just trying out the app', emoji: '👋' }
      ]
    },
    {
      id: 'gender',
      type: 'single-select-large',
      question: "What's your official gender?",
      options: [
        { id: 'male', label: 'Male', emoji: '👨' },
        { id: 'female', label: 'Female', emoji: '👩' },
        { id: 'skip', label: 'Prefer to skip', emoji: '🤷' }
      ]
    },
    {
      id: 'age',
      type: 'age-wheel',
      question: "What's your age?",
      min: 13,
      max: 100
    },
    {
      id: 'mood',
      type: 'mood-wheel',
      question: "How would you describe your mood?",
      options: [
        { value: 'very-happy', emoji: '😄', label: 'Very Happy' },
        { value: 'happy', emoji: '🙂', label: 'Happy' },
        { value: 'neutral', emoji: '😐', label: 'Neutral' },
        { value: 'stressed', emoji: '😰', label: 'Stressed' },
        { value: 'sad', emoji: '😢', label: 'Sad' }
      ]
    },
    {
      id: 'professionalHelp',
      type: 'yes-no',
      question: "Have you sought professional help before?",
      options: [
        { id: 'yes', label: 'Yes', emoji: '✅' },
        { id: 'no', label: 'No', emoji: '❌' }
      ]
    },
    {
      id: 'physicalDistress',
      type: 'yes-no',
      question: "Are you experiencing any physical distress?",
      options: [
        { id: 'yes', label: 'Yes, one or multiple', emoji: '😣' },
        { id: 'no', label: 'No physical pain at all', emoji: '😊' }
      ]
    },
    {
      id: 'medications',
      type: 'single-select',
      question: "Are you taking any medications?",
      options: [
        { id: 'prescribed', label: 'Prescribed medications', emoji: '💊' },
        { id: 'supplements', label: 'Over the counter supplements', emoji: '🌿' },
        { id: 'none', label: "I'm not taking any", emoji: '🚫' },
        { id: 'prefer-not', label: 'Prefer not to say', emoji: '🤐' }
      ]
    },
    {
      id: 'medicationSpec',
      type: 'medication-search',
      question: "Which medications are you taking?",
      searchable: true,
      options: [
        { id: 'sertraline', label: 'Sertraline (Zoloft)' },
        { id: 'escitalopram', label: 'Escitalopram (Lexapro)' },
        { id: 'fluoxetine', label: 'Fluoxetine (Prozac)' },
        { id: 'bupropion', label: 'Bupropion (Wellbutrin)' },
        { id: 'venlafaxine', label: 'Venlafaxine (Effexor)' },
        { id: 'duloxetine', label: 'Duloxetine (Cymbalta)' },
        { id: 'alprazolam', label: 'Alprazolam (Xanax)' },
        { id: 'lorazepam', label: 'Lorazepam (Ativan)' },
        { id: 'clonazepam', label: 'Clonazepam (Klonopin)' },
        { id: 'diazepam', label: 'Diazepam (Valium)' },
        { id: 'zolpidem', label: 'Zolpidem (Ambien)' },
        { id: 'trazodone', label: 'Trazodone' },
        { id: 'mirtazapine', label: 'Mirtazapine (Remeron)' },
        { id: 'quetiapine', label: 'Quetiapine (Seroquel)' },
        { id: 'aripiprazole', label: 'Aripiprazole (Abilify)' },
        { id: 'lamotrigine', label: 'Lamotrigine (Lamictal)' },
        { id: 'lithium', label: 'Lithium' },
        { id: 'buspirone', label: 'Buspirone (Buspar)' },
        { id: 'hydroxyzine', label: 'Hydroxyzine (Vistaril)' },
        { id: 'vitamin-d', label: 'Vitamin D' },
        { id: 'omega-3', label: 'Omega-3 Fish Oil' },
        { id: 'magnesium', label: 'Magnesium' },
        { id: 'melatonin', label: 'Melatonin' },
        { id: 'st-johns-wort', label: "St. John's Wort" },
        { id: 'ashwagandha', label: 'Ashwagandha' },
        { id: 'other', label: 'Other (not listed)' }
      ]
    },
    {
      id: 'symptoms',
      type: 'symptom-chips',
      question: "Do you have other mental health symptoms?",
      options: [
        { id: 'social-withdrawal', label: 'Social withdrawal' },
        { id: 'numbness', label: 'Feeling numbness' },
        { id: 'sad', label: 'Feeling sad' },
        { id: 'depressed', label: 'Depressed' },
        { id: 'angry', label: 'Angry' },
        { id: 'burnout', label: 'Burnout' },
        { id: 'anxiety', label: 'Anxiety' },
        { id: 'overthinking', label: 'Overthinking' }
      ]
    },
    {
      id: 'checkInTime',
      type: 'single-select-large',
      question: "When would you prefer to complete your daily check-in?",
      supportiveText: "I'll remind you at the time that feels best for you 💜",
      options: [
        { id: 'morning', label: 'Morning', emoji: '🌅' },
        { id: 'daytime', label: 'During the day', emoji: '☀️' },
        { id: 'evening', label: 'Evening', emoji: '🌙' }
      ]
    }
  ];

  const currentQuestion = questions[questionStep];

  // Personalize the first question with user's name
  const getQuestionText = () => {
    if (!currentQuestion) return '';
    if (currentQuestion.id === 'healthGoal' && name) {
      return `Hi ${name}, nice to meet you. ${currentQuestion.question}`;
    }
    return currentQuestion.question;
  };

  const questionText = phase === 'questions' ? getQuestionText() : '';
  const { displayedText: typedQuestion, isComplete: questionComplete } = useTypingAnimation(
    questionText,
    25
  );

  // Set default age value when age question loads
  useEffect(() => {
    if (phase === 'questions' && currentQuestion?.id === 'age' && answers.age === undefined) {
      setAnswers({ ...answers, age: 25 });
    }
  }, [questionStep, phase]);

  const handleIntroNext = () => {
    if (introStep < introMessages.length - 1) {
      setIntroStep(introStep + 1);
    } else if (name.trim()) {
      setPhase('questions');
    }
  };

  const handleAnswer = (answer: any) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
  };

  const handleQuestionBack = () => {
    if (questionStep > 0) {
      setNavigationDirection('backward');
      let prevStep = questionStep - 1;

      // If going back from symptoms, check if we need to skip medicationSpec
      if (currentQuestion.id === 'symptoms' && questions[prevStep]?.id === 'medicationSpec') {
        const selectedMed = answers.medications;
        const needsSpecification = selectedMed === 'prescribed' || selectedMed === 'supplements';

        if (!needsSpecification) {
          prevStep--; // Skip medicationSpec if it wasn't shown
        }
      }

      // Clear medication search when navigating
      setMedicationSearch('');
      setQuestionStep(prevStep);
    }
  };

  const handleQuestionNext = () => {
    setNavigationDirection('forward');
    let nextStep = questionStep + 1;

    // Skip medication specification if user didn't select prescribed or supplements
    if (currentQuestion.id === 'medications') {
      const selectedMed = answers.medications;
      const needsSpecification = selectedMed === 'prescribed' || selectedMed === 'supplements';

      if (!needsSpecification && questions[nextStep]?.id === 'medicationSpec') {
        nextStep++; // Skip the medicationSpec question
      }
    }

    // Clear medication search when moving to next question
    setMedicationSearch('');

    if (nextStep < questions.length) {
      setQuestionStep(nextStep);
    } else {
      onComplete({ name, ...answers });
    }
  };

  const canProceed = () => {
    if (phase === 'intro') {
      if (introStep < introMessages.length - 1) return true;
      return name.trim() !== '';
    }
    const answer = answers[currentQuestion?.id];
    // Allow proceeding if answer is set (including empty arrays for multi-select)
    if (answer === undefined) return false;
    // For multi-select questions, require at least one selection
    if (Array.isArray(answer) && (currentQuestion?.type === 'multi-select' || currentQuestion?.type === 'symptom-chips' || currentQuestion?.type === 'medication-search')) {
      return answer.length > 0;
    }
    return true;
  };

  // Render intro phase
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Floating shapes */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 right-10 w-24 h-24 rounded-full bg-[var(--lavender)]/10"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-32 left-10 w-32 h-32 rounded-full bg-[var(--soft-pink)]/10"
        />

        <div className="relative z-10 max-w-md mx-auto px-6 pt-20 pb-24 min-h-screen flex flex-col justify-center">
          {/* Otter illustration placeholder */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center"
          >
            <img src={otterImage} alt="Otto" className="w-20 h-20 object-contain" />
          </motion.div>

          {/* Typing message */}
          <motion.div
            key={introStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl p-6 mb-8 shadow-lg"
          >
            <p className="text-lg text-foreground leading-relaxed">
              {typedIntro}
              {!introComplete && <span className="animate-pulse">|</span>}
            </p>
          </motion.div>

          {/* Name input (only on last intro step) */}
          {introStep === introMessages.length - 1 && introComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name..."
                className="w-full px-6 py-4 rounded-2xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground text-lg placeholder:text-muted-foreground focus:border-[var(--lavender)] focus:outline-none transition-colors"
                autoFocus
              />
            </motion.div>
          )}

          {/* Continue button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleIntroNext}
            disabled={!introComplete || !canProceed()}
            className="w-full py-5 rounded-3xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    );
  }

  // Render questions phase
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
        {/* Back button */}
        {questionStep > 0 && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleQuestionBack}
            className="absolute top-4 left-6 w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center text-foreground hover:border-[var(--lavender)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        )}

        {/* Progress */}
        <div className="mb-8 mt-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {questionStep + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-[var(--lavender)]">
              {Math.round(((questionStep + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]"
              animate={{ width: `${((questionStep + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait" custom={navigationDirection}>
          <motion.div
            key={questionStep}
            custom={navigationDirection}
            initial={{ opacity: 0, x: navigationDirection === 'forward' ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: navigationDirection === 'forward' ? -60 : 60 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Question text */}
            <div className="mb-8" key={`question-text-${questionStep}`}>
              <h2 className="text-2xl text-foreground mb-2">
                {typedQuestion}
                {!questionComplete && <span className="animate-pulse">|</span>}
              </h2>
              {questionComplete && currentQuestion && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground mt-2"
                >
                  {currentQuestion.id === 'healthGoal' && "Choose what feels right for you today"}
                  {currentQuestion.id === 'gender' && "This helps us personalize your experience"}
                  {currentQuestion.id === 'mood' && "There's no wrong answer - just be honest"}
                  {currentQuestion.id === 'professionalHelp' && "Your journey is unique to you"}
                  {currentQuestion.id === 'medications' && "Choose the option that best describes your situation"}
                  {currentQuestion.id === 'medicationSpec' && "Search or scroll to find your medications"}
                  {currentQuestion.id === 'symptoms' && "Select all that apply to you"}
                  {currentQuestion.id === 'checkInTime' && (currentQuestion as any).supportiveText}
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
                {/* Single select cards (health goals) */}
                {currentQuestion.type === 'single-select-cards' && (
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {currentQuestion.options?.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAnswer(option.id)}
                          className={`p-5 rounded-3xl border-2 transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-[var(--lavender)]/20 to-[var(--soft-purple)]/20 border-[var(--lavender)] shadow-lg'
                              : 'bg-card border-[var(--border)]'
                          }`}
                        >
                          <div className="text-4xl mb-3">{option.emoji}</div>
                          <div className="text-sm text-foreground text-center leading-snug">{option.label}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Single select large (gender) */}
                {currentQuestion.type === 'single-select-large' && (
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    {currentQuestion.options?.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(option.id)}
                          className={`w-full p-4 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)] shadow-lg'
                              : 'bg-card border-[var(--border)]'
                          }`}
                        >
                          <div className="text-4xl mb-2">{option.emoji}</div>
                          <div className="text-base text-foreground">{option.label}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Age wheel */}
                {currentQuestion.type === 'age-wheel' && (
                  <div className="mb-8">
                    <div className="bg-card rounded-3xl p-6 border-2 border-[var(--border)]">
                      <div className="text-center mb-4">
                        <div className="text-6xl font-medium text-[var(--lavender)] mb-2">
                          {answers[currentQuestion.id] || 25}
                        </div>
                        <div className="text-sm text-muted-foreground">Years old</div>
                      </div>
                      <input
                        type="range"
                        min={currentQuestion.min}
                        max={currentQuestion.max}
                        value={answers[currentQuestion.id] || 25}
                        onChange={(e) => handleAnswer(parseInt(e.target.value))}
                        className="w-full h-3 bg-[var(--muted)] rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--lavender) 0%, var(--soft-purple) ${
                            (((answers[currentQuestion.id] || 25) - currentQuestion.min!) / (currentQuestion.max! - currentQuestion.min!)) * 100
                          }%, var(--muted) ${
                            (((answers[currentQuestion.id] || 25) - currentQuestion.min!) / (currentQuestion.max! - currentQuestion.min!)) * 100
                          }%, var(--muted) 100%)`
                        }}
                      />
                      <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                        <span>{currentQuestion.min}</span>
                        <span>{currentQuestion.max}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mood wheel */}
                {currentQuestion.type === 'mood-wheel' && (
                  <div className="mb-8">
                    <div className="grid grid-cols-3 gap-3">
                      {currentQuestion.options?.map((option) => {
                        const isSelected = answers[currentQuestion.id] === option.value;
                        return (
                          <motion.button
                            key={option.value}
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleAnswer(option.value)}
                            className={`p-5 rounded-3xl border-2 transition-all ${
                              isSelected
                                ? 'bg-gradient-to-br from-[var(--lavender)]/20 to-[var(--soft-purple)]/20 border-[var(--lavender)] shadow-lg'
                                : 'bg-card border-[var(--border)]'
                            }`}
                          >
                            <div className="text-4xl mb-2">{option.emoji}</div>
                            <div className="text-xs text-foreground leading-tight">{option.label}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Yes/No */}
                {currentQuestion.type === 'yes-no' && (
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    {currentQuestion.options?.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(option.id)}
                          className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center gap-4 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)] shadow-lg'
                              : 'bg-card border-[var(--border)]'
                          }`}
                        >
                          <div className="text-4xl">{option.emoji}</div>
                          <div className="text-lg text-foreground flex-1 text-left">{option.label}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Medication search */}
                {currentQuestion.type === 'medication-search' && (
                  <div className="mb-8">
                    {/* Friendly reminder */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[var(--soft-mint)]/10 border-2 border-[var(--soft-mint)]/20 rounded-2xl p-4 mb-4"
                    >
                      <p className="text-sm text-foreground">
                        💙 This information helps us provide better support. Your privacy is important to us.
                      </p>
                    </motion.div>

                    {/* Search input */}
                    <div className="relative mb-4">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={medicationSearch}
                        onChange={(e) => setMedicationSearch(e.target.value)}
                        placeholder="Search medications..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--lavender)] focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Medication list */}
                    <div className="max-h-96 overflow-y-auto space-y-2 scrollbar-hide">
                      {currentQuestion.options
                        ?.filter((option) =>
                          option.label.toLowerCase().includes(medicationSearch.toLowerCase())
                        )
                        .map((option) => {
                          const isSelected = (answers[currentQuestion.id] || []).includes(option.id);
                          return (
                            <motion.button
                              key={option.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const current = answers[currentQuestion.id] || [];
                                const updated = isSelected
                                  ? current.filter((id: string) => id !== option.id)
                                  : [...current, option.id];
                                handleAnswer(updated);
                              }}
                              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)]'
                                  : 'bg-card border-[var(--border)]'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'bg-[var(--lavender)] border-[var(--lavender)]'
                                  : 'border-[var(--border)]'
                              }`}>
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                )}
                              </div>
                              <span className="text-foreground flex-1 text-left">{option.label}</span>
                            </motion.button>
                          );
                        })}
                    </div>

                    {/* Selected count */}
                    {(answers[currentQuestion.id] || []).length > 0 && (
                      <div className="mt-4 text-center text-sm text-muted-foreground">
                        {(answers[currentQuestion.id] || []).length} medication(s) selected
                      </div>
                    )}
                  </div>
                )}

                {/* Symptom chips */}
                {currentQuestion.type === 'symptom-chips' && (
                  <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                      {currentQuestion.options?.map((option) => {
                        const isSelected = (answers[currentQuestion.id] || []).includes(option.id);
                        return (
                          <motion.button
                            key={option.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const current = answers[currentQuestion.id] || [];
                              const updated = isSelected
                                ? current.filter((id: string) => id !== option.id)
                                : [...current, option.id];
                              handleAnswer(updated);
                            }}
                            className={`px-5 py-3 rounded-full border-2 transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] border-[var(--lavender)] text-white'
                                : 'bg-card border-[var(--border)] text-foreground'
                            }`}
                          >
                            <span className="text-sm">{option.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Multi-select */}
                {currentQuestion.type === 'multi-select' && (
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {currentQuestion.options?.map((option) => {
                      const isSelected = (answers[currentQuestion.id] || []).includes(option.id);
                      return (
                        <motion.button
                          key={option.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const current = answers[currentQuestion.id] || [];
                            const updated = isSelected
                              ? current.filter((id: string) => id !== option.id)
                              : [...current, option.id];
                            handleAnswer(updated);
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)]'
                              : 'bg-card border-[var(--border)]'
                          }`}
                        >
                          <div className="text-3xl mb-2">{option.emoji}</div>
                          <div className="text-sm text-foreground">{option.label}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Single select */}
                {currentQuestion.type === 'single-select' && (
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {currentQuestion.options?.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(option.id)}
                          className={`p-4 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)]'
                              : 'bg-card border-[var(--border)]'
                          }`}
                        >
                          <div className="text-3xl mb-2">{option.emoji}</div>
                          <div className="text-sm text-foreground text-center leading-snug">{option.label}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Slider */}
                {currentQuestion.type === 'slider' && (
                  <div className="mb-8">
                    <input
                      type="range"
                      min={currentQuestion.min}
                      max={currentQuestion.max}
                      value={answers[currentQuestion.id] || currentQuestion.min}
                      onChange={(e) => handleAnswer(parseInt(e.target.value))}
                      className="w-full h-3 bg-[var(--muted)] rounded-full appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right, var(--lavender) 0%, var(--soft-purple) ${
                          ((answers[currentQuestion.id] || currentQuestion.min) / currentQuestion.max!) * 100
                        }%, var(--muted) ${
                          ((answers[currentQuestion.id] || currentQuestion.min) / currentQuestion.max!) * 100
                        }%, var(--muted) 100%)`
                      }}
                    />
                    <div className="flex justify-between mt-4">
                      <span className="text-sm text-muted-foreground">{currentQuestion.labels?.[0]}</span>
                      <span className="text-2xl font-medium text-[var(--lavender)]">
                        {answers[currentQuestion.id] || currentQuestion.min}
                      </span>
                      <span className="text-sm text-muted-foreground">{currentQuestion.labels?.[1]}</span>
                    </div>
                  </div>
                )}

                {/* Emoji scale */}
                {currentQuestion.type === 'emoji-scale' && (
                  <div className="flex justify-between gap-2 mb-8">
                    {currentQuestion.options?.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAnswer(option.value)}
                          className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)]'
                              : 'bg-card border-[var(--border)]'
                          }`}
                        >
                          <div className="text-3xl mb-2">{option.emoji}</div>
                          <div className="text-xs text-muted-foreground">{option.label}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Next button */}
                <div className="space-y-3">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleQuestionNext}
                    disabled={!canProceed()}
                    className="w-full py-5 rounded-3xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {questionStep === questions.length - 1 ? (
                      <>
                        <Heart className="w-5 h-5" />
                        Complete Assessment
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>

                  {/* Skip button for optional questions */}
                  {(currentQuestion.id === 'medicationSpec' || currentQuestion.id === 'symptoms') && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        // Clear answer and proceed
                        const newAnswers = { ...answers };
                        delete newAnswers[currentQuestion.id];
                        setAnswers(newAnswers);
                        handleQuestionNext();
                      }}
                      className="w-full py-3 text-sm text-muted-foreground"
                    >
                      Skip this question
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
