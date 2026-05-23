import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/screens/SplashScreen';
import { WelcomeOnboarding } from './components/screens/WelcomeOnboarding';
import { EnhancedQuestionnaire } from './components/screens/EnhancedQuestionnaire';
import { TherapistProfileSetup, type TherapistProfileData } from './components/screens/TherapistProfileSetup';
import { TherapistProfileEdit } from './components/screens/TherapistProfileEdit';
import { AuthScreen, type UserRole } from './components/screens/AuthScreen';
import { HomeDashboard } from './components/screens/HomeDashboard';
import { DailyCheckIn } from './components/screens/DailyCheckIn';
import { CheckInDetail } from './components/screens/CheckInDetail';
import { JournalHistory } from './components/screens/JournalHistory';
import { ContentLibrary } from './components/screens/ContentLibrary';
import { ContentDetail } from './components/screens/ContentDetail';
import { TherapistMyContent } from './components/screens/TherapistMyContent';
import { TherapistList } from './components/screens/TherapistList';
import { TherapistProfile } from './components/screens/TherapistProfile';
import { ChatConversation } from './components/screens/ChatConversation';
import { CallScreen } from './components/screens/CallScreen';
import { VideoCallScreen } from './components/screens/VideoCallScreen';
import { TherapistDashboard } from './components/screens/TherapistDashboard';
import { ChatScreen } from './components/screens/ChatScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { BottomNav } from './components/navigation/BottomNav';
import { TherapistAvailabilityScreen } from './components/screens/TherapistAvailabilityScreen';
import { TherapistAppointmentsScreen } from './components/screens/TherapistAppointmentsScreen';
import { UserAppointmentsScreen } from './components/screens/UserAppointmentsScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { BookAppointmentFlow } from './components/screens/BookAppointmentFlow';
import { CustomAppointmentRequest } from './components/screens/CustomAppointmentRequest';
import { PaymentCheckout } from './components/screens/PaymentCheckout';
import { CustomRequestConfirmation } from './components/screens/CustomRequestConfirmation';
import { AppTutorial } from './components/tutorial/AppTutorial';
import { TherapistTutorial } from './components/tutorial/TherapistTutorial';
import { LikedContentScreen } from './components/screens/LikedContentScreen';
import { SavedContentScreen } from './components/screens/SavedContentScreen';
import { CompletedContentScreen } from './components/screens/CompletedContentScreen';
import type { TherapistAvailability } from './types/appointments';
import { saveCheckIn } from './utils/checkInUtils';
import { onAuthChange, logout } from './services/auth';
import { getUserDocument, updateUserDisplayName, updateTherapistProfile, updateTherapistAvailability, getTherapistAvailability, getUserDarkMode, updateUserDarkMode, getUserNotificationsEnabled, updateUserNotificationsEnabled, getUserBiometricAuthEnabled, updateUserBiometricAuthEnabled } from './services/users';
import { completeUserOnboarding } from './services/onboarding';
import { getAuth } from 'firebase/auth';
import { createAppointment, updateAppointmentStatus } from './services/appointments';
import { PrivacyPolicyPage } from './components/screens/PrivacyPolicy.js';
import { TermsConditionsPage } from './components/screens/TermsAndConditions.js';
import { AiInsightsScreen } from './components/screens/AiInsightsScreen.js';
import { ClientFilesScreen } from './components/screens/ClientFilesScreen';
import { ClientFileDetails } from './components/screens/ClientFileDetails';

type AppState = 'splash' | 'welcome' | 'auth' | 'questionnaire' | 'therapist-profile-setup' | 'app';
type ContentReturnScreen = 'likedContent' | 'savedContent' | 'completedContent' | null;

export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [userData, setUserData] = useState({ name: localStorage.getItem('userName') || '' });
  const [therapistName, setTherapistName] = useState(localStorage.getItem('therapistName') || '');
  const [therapistProfileData, setTherapistProfileData] = useState<any>(() => {
    const saved = localStorage.getItem('therapistProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [biometricAuthEnabled, setBiometricAuthEnabled] = useState(false);

  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [contentReturnScreen, setContentReturnScreen] = useState<'liked' | 'saved' | 'completed' | null>(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [contentBeforeTherapistProfile, setContentBeforeTherapistProfile] = useState<any>(null);
  const [showChatConversation, setShowChatConversation] = useState(false);
  const [chatTarget, setChatTarget] = useState<{ name: string; avatar: string; isAI: boolean } | null>(null);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [showVideoCallScreen, setShowVideoCallScreen] = useState(false);

  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showCustomRequest, setShowCustomRequest] = useState(false);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);
  const [showCustomRequestConfirmation, setShowCustomRequestConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState(1);
  // UID terapevta za vrnitev na profil po zaključku/prekliću bookinga
  const [bookingTherapistId, setBookingTherapistId] = useState<string | null>(null);
  const [bookingTherapistAvailability, setBookingTherapistAvailability] = useState<TherapistAvailability | null>(null);
  const [bookingTherapistName, setBookingTherapistName] = useState('');

  const [showTutorial, setShowTutorial] = useState(false);
  const [showTherapistTutorial, setShowTherapistTutorial] = useState(false);

  const [showLikedContent, setShowLikedContent] = useState(false);
  const [showSavedContent, setShowSavedContent] = useState(false);
  const [showCompletedContent, setShowCompletedContent] = useState(false);
  const [showTherapistProfileEdit, setShowTherapistProfileEdit] = useState(false);
  const [selectedClientUserId, setSelectedClientUserId] = useState<string | null>(null);

  const getAppointmentPrice = (appointmentType?: string | null) => {
    switch (appointmentType) {
      case 'Chat': return 80;
      case 'Voice Call': return 100;
      case 'Video Call': return 120;
      case 'In Person': return 140;
      default: return 120;
    }
  };

  const getAppointmentEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + durationMinutes, 0, 0);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };


  const sendNativeMessage = (data: any) => {
    if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify(data));
    }
  };

  useEffect(() => {
    let isFirstLoad = true;

    // Preveri Google redirect result
    const checkRedirect = async () => {
      try {
        const { getRedirectResult } = await import('firebase/auth');
        const { auth } = await import('./services/firebaseConfig');
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const userDoc = await getUserDocument(result.user.uid);
          if (!userDoc) {
            const { createUserDocument } = await import('./services/users');
            await createUserDocument(result.user.uid, {
              email: result.user.email ?? '',
              displayName: result.user.displayName ?? '',
            });
          }
        }
      } catch (e) {
        console.log('No redirect result');
      }
    };
    checkRedirect();

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!isFirstLoad) return;
      isFirstLoad = false;

      if (firebaseUser) {
        const userDoc = await getUserDocument(firebaseUser.uid);
        if (userDoc) {
          const role = userDoc.role as UserRole;
          setUserRole(role);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', role);

          // Naloži settings iz Firestorea za tega userja
          const savedDarkMode = await getUserDarkMode(firebaseUser.uid);
          setDarkMode(savedDarkMode);
          const savedNotifications = await getUserNotificationsEnabled(firebaseUser.uid);
          setNotificationsEnabled(savedNotifications);
          const savedBiometric = await getUserBiometricAuthEnabled(firebaseUser.uid);
          setBiometricAuthEnabled(savedBiometric);
          sendNativeMessage({
            type: 'biometricAuthChanged',
            enabled: savedBiometric,
          });

          if (role === 'therapist') {
            const doc = userDoc as any;
            const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
            const displayName = (doc as any).name || fullName;
            setTherapistName(displayName);
            localStorage.setItem('therapistName', displayName);

            const existingProfileRaw = localStorage.getItem('therapistProfile');
            const existingProfile = existingProfileRaw ? JSON.parse(existingProfileRaw) : null;
            const updatedProfile = {
              name: (doc as any).name || existingProfile?.name || fullName,
              profileImage: (doc as any).profileImage || existingProfile?.profileImage || '',
              title: (doc as any).title || existingProfile?.title || '',
              specializations: (doc as any).specializations || existingProfile?.specializations || [],
              fieldOfWork: (doc as any).fieldOfWork || existingProfile?.fieldOfWork || '',
              bio: (doc as any).bio || existingProfile?.bio || '',
              yearsOfExperience: (doc as any).yearsOfExperience || existingProfile?.yearsOfExperience || '',
              education: (doc as any).education || existingProfile?.education || '',
              licenseNumber: (doc as any).licenseNumber || existingProfile?.licenseNumber || '',
            };
            localStorage.setItem('therapistProfile', JSON.stringify(updatedProfile));
            setTherapistProfileData(updatedProfile);
            setCurrentScreen('dashboard');

            // Preberi availability iz Firestorea
            const firestoreAvailability = await getTherapistAvailability(firebaseUser.uid);
            if (firestoreAvailability) {
              localStorage.setItem('therapistAvailability', JSON.stringify(firestoreAvailability));
            }

          } else {
            const displayName = (userDoc as any).displayName || '';
            setUserData({ name: displayName });
            localStorage.setItem('userName', displayName);
            setCurrentScreen('home');
          }

          setAppState('app');
        }
      } else {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        setAppState(hasSeenWelcome ? 'auth' : 'welcome');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [
  currentScreen,
  appState,
  showDailyCheckIn,
  selectedCheckIn,
  selectedContent,
  selectedTherapistId,
  showChatConversation,
  showCallScreen,
  showVideoCallScreen,
  showBookingFlow,
  showCustomRequest,
  showPaymentCheckout,
  showCustomRequestConfirmation,
  showLikedContent,
  showSavedContent,
  showCompletedContent,
  selectedClientUserId
]);

  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    const { auth } = await import('./services/firebaseConfig');
    const currentUser = auth.currentUser;
    if (currentUser) {
      await updateUserDarkMode(currentUser.uid, newValue);
    }
  };

  const handleToggleNotifications = async (newValue: boolean) => {
    setNotificationsEnabled(newValue);
    const { auth } = await import('./services/firebaseConfig');
    const currentUser = auth.currentUser;
    if (currentUser) {
      await updateUserNotificationsEnabled(currentUser.uid, newValue);
    }
  };

  const handleToggleBiometricAuth = async (newValue: boolean) => {
    setBiometricAuthEnabled(newValue);
    const { auth } = await import('./services/firebaseConfig');
    const currentUser = auth.currentUser;
    if (currentUser) {
      await updateUserBiometricAuthEnabled(currentUser.uid, newValue);
      sendNativeMessage({
        type: 'biometricAuthChanged',
        enabled: newValue,
      });
    }
  };

  const handleSplashComplete = () => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setAppState('auth');
    } else {
      setAppState('welcome');
    }
  };

  const handleWelcomeComplete = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setAppState('auth');
  };

const handleQuestionnaireComplete = async (data: any) => {
  const { auth } = await import('./services/firebaseConfig');
  const currentUser = auth.currentUser;

  if (currentUser) {
    await completeUserOnboarding(currentUser.uid, data);
  }

  setUserData({ name: data.name || '' });
  localStorage.setItem('userName', data.name || '');
  localStorage.setItem('hasSeenOnboarding', 'true');
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userRole', 'user');

  setUserRole('user');
  setAppState('app');
  setCurrentScreen('home');

  const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
  if (!hasSeenTutorial) {
    setTimeout(() => setShowTutorial(true), 500);
  }
};

  const handleAuthComplete = async (role: UserRole, skipQuestionnaire: boolean = false) => {
    setUserRole(role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);

    const { auth } = await import('./services/firebaseConfig');
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Naloži settings iz Firestorea za tega userja
      const savedDarkMode = await getUserDarkMode(currentUser.uid);
      setDarkMode(savedDarkMode);
      const savedNotifications = await getUserNotificationsEnabled(currentUser.uid);
      setNotificationsEnabled(savedNotifications);
      const savedBiometric = await getUserBiometricAuthEnabled(currentUser.uid);
      setBiometricAuthEnabled(savedBiometric);
      sendNativeMessage({
        type: 'biometricAuthChanged',
        enabled: savedBiometric,
      });

      const userDoc = await getUserDocument(currentUser.uid);
      if (userDoc) {
        if (role === 'therapist') {
          const doc = userDoc as any;
          const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
          const displayName = (doc as any).name || fullName;
          setTherapistName(displayName);
          localStorage.setItem('therapistName', displayName);

          const existingProfileRaw = localStorage.getItem('therapistProfile');
          const existingProfile = existingProfileRaw ? JSON.parse(existingProfileRaw) : null;
          const updatedProfile = {
            name: (doc as any).name || existingProfile?.name || fullName,
            profileImage: (doc as any).profileImage || existingProfile?.profileImage || '',
            title: (doc as any).title || existingProfile?.title || '',
            specializations: (doc as any).specializations || existingProfile?.specializations || [],
            fieldOfWork: (doc as any).fieldOfWork || existingProfile?.fieldOfWork || '',
            bio: (doc as any).bio || existingProfile?.bio || '',
            yearsOfExperience: (doc as any).yearsOfExperience || existingProfile?.yearsOfExperience || '',
            education: (doc as any).education || existingProfile?.education || '',
            licenseNumber: (doc as any).licenseNumber || existingProfile?.licenseNumber || '',
          };
          localStorage.setItem('therapistProfile', JSON.stringify(updatedProfile));
          setTherapistProfileData(updatedProfile);

          // Preberi availability iz Firestorea
          const firestoreAvailability = await getTherapistAvailability(currentUser.uid);
          if (firestoreAvailability) {
            localStorage.setItem('therapistAvailability', JSON.stringify(firestoreAvailability));
          }

        } else {
          const displayName = (userDoc as any).displayName || '';
          setUserData({ name: displayName });
          localStorage.setItem('userName', displayName);
        }
      }
    }

    if (skipQuestionnaire) {
      setAppState('app');
      if (role === 'therapist') {
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('home');
      }
      return;
    }

    if (role === 'user') {
      localStorage.removeItem('dailyCheckInCompleted');
      localStorage.removeItem('lastDailyCheckInDate');
      localStorage.removeItem('dailyCheckIns');
      localStorage.removeItem('todayCheckIn');
      localStorage.removeItem('hasSeenTutorial'); // ← DODANO
      setAppState('questionnaire');
      return;
    }

    if (role === 'therapist') {
      setAppState('therapist-profile-setup');
      return;
    }
  };

  const handleDailyCheckInComplete = (data: any) => {
    saveCheckIn(data);
    setShowDailyCheckIn(false);
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Uporabnik uspešno odjavljen iz Firebase Auth.");
    } catch (error) {
      console.error("Napaka pri Firebase odjavi:", error);
    }

    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    localStorage.clear();
    if (hasSeenWelcome) localStorage.setItem('hasSeenWelcome', hasSeenWelcome);

    // Resetiraj settings na default — vsak user ima svoje nastavitve v Firestoreu
    setDarkMode(false);
    setNotificationsEnabled(false);
    setBiometricAuthEnabled(false);

    setAppState('auth');
    setUserRole('user');
    setCurrentScreen('home');
    setUserData({ name: '' });
    setTherapistName('');
    setTherapistProfileData(null);

    setShowDailyCheckIn(false);
    setSelectedCheckIn(null);
    setSelectedContent(null);
    setSelectedTherapistId(null);
    setShowChatConversation(false);
    setChatTarget(null);
    setShowCallScreen(false);
    setShowVideoCallScreen(false);
    setShowBookingFlow(false);
    setShowCustomRequest(false);
    setShowPaymentCheckout(false);
    setShowCustomRequestConfirmation(false);
    setShowLikedContent(false);
    setShowSavedContent(false);
    setShowCompletedContent(false);
    setBookingTherapistAvailability(null);
    setBookingTherapistName('');
    setBookingTherapistId(null);
    setBookingStep(1);
    setSelectedClientUserId(null);
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  const handleUpdateName = async (newName: string) => {
    setUserData({ ...userData, name: newName });
    localStorage.setItem('userName', newName);
    const { auth } = await import('./services/firebaseConfig');
    const currentUser = auth.currentUser;
    if (currentUser) {
      await updateUserDisplayName(currentUser.uid, newName);
    }
  };

  const handleTherapistTutorialComplete = () => {
    localStorage.setItem('hasSeenTherapistTutorial', 'true');
    setShowTherapistTutorial(false);
  };

  const handleTherapistTutorialSkip = () => {
    localStorage.setItem('hasSeenTherapistTutorial', 'true');
    setShowTherapistTutorial(false);
  };

  const handleTherapistProfileSetupComplete = async (profileData: TherapistProfileData) => {
    localStorage.setItem('therapistProfile', JSON.stringify(profileData));
    localStorage.setItem('therapistProfileComplete', 'true');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'therapist');
    setTherapistProfileData(profileData);
    if (profileData.name) {
      setTherapistName(profileData.name);
      localStorage.setItem('therapistName', profileData.name);
    }

    const { auth } = await import('./services/firebaseConfig');
    const currentUser = auth.currentUser;
    if (currentUser) {
      await updateTherapistProfile(currentUser.uid, profileData);
    }

    setUserRole('therapist');
    setAppState('app');
    setCurrentScreen('dashboard');
    const hasSeenTherapistTutorial = localStorage.getItem('hasSeenTherapistTutorial');
    if (!hasSeenTherapistTutorial) {
      setTimeout(() => setShowTherapistTutorial(true), 500);
    }
  };

  const handleTherapistProfileEdit = async (profileData: TherapistProfileData) => {
    localStorage.setItem('therapistProfile', JSON.stringify(profileData));
    setTherapistProfileData(profileData);
    if (profileData.name) {
      setTherapistName(profileData.name);
      localStorage.setItem('therapistName', profileData.name);
    }

    const { auth } = await import('./services/firebaseConfig');
    const currentUser = auth.currentUser;
    if (currentUser) {
      await updateTherapistProfile(currentUser.uid, profileData);
    }

    setShowTherapistProfileEdit(false);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'aichat') {
      setChatTarget({
        name: 'Otto — AI Companion',
        avatar: '/src/imports/vidra.png',
        isAI: true
      });
      setShowChatConversation(true);
    } else if (tab === 'addcontent') {
      setCurrentScreen('mycontent');
      setTimeout(() => {
        const addButton = document.querySelector('[data-add-content-trigger]') as HTMLButtonElement;
        if (addButton) addButton.click();
      }, 100);
    } else {
      if (currentScreen === tab) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setCurrentScreen(tab);
    }
  };

  if (appState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (appState === 'welcome') {
    return <WelcomeOnboarding onComplete={handleWelcomeComplete} />;
  }

  if (appState === 'auth') {
    return <AuthScreen onComplete={handleAuthComplete} />;
  }

  if (appState === 'questionnaire') {
    return <EnhancedQuestionnaire onComplete={handleQuestionnaireComplete} />;
  }

  if (appState === 'therapist-profile-setup') {
    return (
      <TherapistProfileSetup
        onComplete={handleTherapistProfileSetupComplete}
        onSkip={() => {
          localStorage.setItem('therapistProfileComplete', 'true');
          setAppState('app');
          setCurrentScreen('dashboard');
          const hasSeenTherapistTutorial = localStorage.getItem('hasSeenTherapistTutorial');
          if (!hasSeenTherapistTutorial) {
            setTimeout(() => setShowTherapistTutorial(true), 500);
          }
        }}
      />
    );
  }

  if (showDailyCheckIn) {
    return (
      <DailyCheckIn
        onComplete={handleDailyCheckInComplete}
        onClose={() => setShowDailyCheckIn(false)}
      />
    );
  }

  if (selectedCheckIn) {
    return (
      <CheckInDetail
        checkIn={selectedCheckIn}
        onClose={() => setSelectedCheckIn(null)}
        onTabChange={(tab) => {
          setSelectedCheckIn(null);
          setCurrentScreen(tab);
        }}
        userRole={userRole}
        activeTab={currentScreen}
      />
    );
  }

  if (selectedContent) {
  return (
    <ContentDetail
      content={selectedContent}
      onClose={() => {
  const returnScreen = contentReturnScreen;

  setSelectedContent(null);
  setContentReturnScreen(null);

  if (returnScreen === 'liked') {
    setShowLikedContent(true);
    return;
  }

  if (returnScreen === 'saved') {
    setShowSavedContent(true);
    return;
  }

  if (returnScreen === 'completed') {
    setShowCompletedContent(true);
  }
}}
      onViewTherapist={(therapistId) => {
        setContentBeforeTherapistProfile(selectedContent);
        setSelectedContent(null);
        setSelectedTherapistId(therapistId);
      }}
    />
  );
}

  if (showLikedContent) {
    return (
      <LikedContentScreen
        onBack={() => setShowLikedContent(false)}
        onSelectContent={(content) => {
  setContentReturnScreen('liked');
  setShowLikedContent(false);
  setSelectedContent(content);
}}
      />
    );
  }

  if (showSavedContent) {
    return (
      <SavedContentScreen
        onBack={() => setShowSavedContent(false)}
        onSelectContent={(content) => {
  setContentReturnScreen('saved');
  setShowSavedContent(false);
  setSelectedContent(content);
}}
      />
    );
  }
  if (showCompletedContent) {
  return (
    <CompletedContentScreen
      onBack={() => setShowCompletedContent(false)}
      onSelectContent={(content) => {
  setContentReturnScreen('completed');
  setShowCompletedContent(false);
  setSelectedContent(content);
}}
    />
  );
}

  if (selectedClientUserId) {
    return (
      <ClientFileDetails
        therapistId={getAuth().currentUser?.uid || ''}
        userId={selectedClientUserId}
        onBack={() => setSelectedClientUserId(null)}
      />
    );
  }

  if (showTherapistProfileEdit) {
    return (
      <TherapistProfileEdit
        onClose={() => setShowTherapistProfileEdit(false)}
        initialData={therapistProfileData || {
          name: '',
          profileImage: '',
          title: '',
          specializations: [],
          fieldOfWork: '',
          bio: '',
          yearsOfExperience: '',
          education: '',
          licenseNumber: ''
        }}
        onSave={handleTherapistProfileEdit}
      />
    );
  }

  if (selectedTherapistId) {
    return (
      <TherapistProfile
        therapistId={selectedTherapistId}
        onClose={() => {
  setSelectedTherapistId(null);

  if (contentBeforeTherapistProfile) {
    setSelectedContent(contentBeforeTherapistProfile);
    setContentBeforeTherapistProfile(null);
  }
}}
        onMessage={() => {
          setChatTarget({
            name: 'Dr. Sarah Mitchell',
            avatar: 'https://images.unsplash.com/photo-1594744803145-a7bf00e71852?w=100&h=100&fit=crop',
            isAI: false
          });
          setShowChatConversation(true);
          setSelectedTherapistId(null);
        }}
        onVoiceCall={() => {
          setShowCallScreen(true);
          setSelectedTherapistId(null);
        }}
        onVideoCall={() => {
          setShowVideoCallScreen(true);
          setSelectedTherapistId(null);
        }}
        onBookAppointment={(tName, availability) => {
          if (!availability || !availability.isSetupComplete) return;
          // Shrani therapistId za vrnitev na profil
          setBookingTherapistId(selectedTherapistId);
          setBookingTherapistName(tName);
          setBookingTherapistAvailability(availability);
          setSelectedTherapistId(null);
          setBookingStep(1);
          setBookingData(null);
          setShowBookingFlow(true);
        }}
        onSelectContent={(content) => {
  setSelectedTherapistId(null);
  setSelectedContent(content);
}}
      />
    );
  }

  if (showChatConversation && chatTarget) {
    return (
      <ChatConversation
        therapistName={chatTarget.name}
        therapistAvatar={chatTarget.avatar}
        isAI={chatTarget.isAI}
        onClose={() => {
          setShowChatConversation(false);
          setChatTarget(null);
        }}
      />
    );
  }

  if (showCallScreen) {
    return (
      <CallScreen
        therapistName="Dr. Sarah Mitchell"
        therapistAvatar="https://images.unsplash.com/photo-1594744803145-a7bf00e71852?w=200&h=200&fit=crop"
        onEndCall={() => setShowCallScreen(false)}
      />
    );
  }

  if (showVideoCallScreen) {
    return (
      <VideoCallScreen
        therapistName="Dr. Sarah Mitchell"
        therapistAvatar="https://images.unsplash.com/photo-1594744803145-a7bf00e71852?w=200&h=200&fit=crop"
        onEndCall={() => setShowVideoCallScreen(false)}
      />
    );
  }

  // ─── Booking flow ─────────────────────────────────────────────────────────────

  if (showBookingFlow && bookingTherapistAvailability) {
    return (
      <BookAppointmentFlow
        therapistId={bookingTherapistAvailability.therapistId}
        therapistName={bookingTherapistName || 'Your Therapist'}
        therapistAvailability={bookingTherapistAvailability}
        initialStep={bookingStep}
        initialDate={bookingData?.date ?? ''}
        initialType={bookingData?.appointmentType ?? null}
        onClose={() => {
          // Puščica nazaj na Step 1 → vrni na TherapistProfile
          setShowBookingFlow(false);
          setBookingStep(1);
          setSelectedTherapistId(bookingTherapistId);
        }}
        onRequestCustomTime={(data) => {
          setBookingData({
            therapistId: bookingTherapistAvailability?.therapistId ?? '',
            therapistName: bookingTherapistName,
            appointmentType: data.appointmentType,
            date: data.date,
          });
          setBookingStep(3);
          setShowBookingFlow(false);
          setShowCustomRequest(true);
        }}
        onProceedToPayment={async (data) => {
          const currentUser = getAuth().currentUser;

          if (!currentUser) {
            alert('Please sign in before booking an appointment.');
            return;
          }

          const price = getAppointmentPrice(data.appointmentType);
          // Appointment se ustvari šele po uspešnem plačilu — tukaj samo shranimo podatke
          setBookingData({
            ...data,
            userId: currentUser.uid,
            userName: userData.name || currentUser.displayName || 'MindMend User',
            price,
          });
          setShowBookingFlow(false);
          setShowPaymentCheckout(true);
        }}
      />
    );
  }

  if (showCustomRequest) {
    return (
      <CustomAppointmentRequest
        therapistId={bookingTherapistAvailability?.therapistId ?? ''}
        therapistName={bookingTherapistName || 'Your Therapist'}
        selectedType={bookingData?.appointmentType}
        selectedDate={bookingData?.date}
        onClose={() => {
          // Puščica nazaj → vrni na Step 3 (Select Time)
          setShowCustomRequest(false);
          setShowBookingFlow(true);
        }}
        onSubmit={async (data) => {
          const currentUser = getAuth().currentUser;

          if (!currentUser) {
            alert('Please sign in before sending a request.');
            return;
          }

          try {
            const appointmentType = data.appointmentType || bookingData?.appointmentType || 'Video Call';
            const date = data.proposedDate || bookingData?.date;
            const startTime = data.proposedTime;
            const endTime = getAppointmentEndTime(
              startTime,
              bookingTherapistAvailability?.appointmentDuration || 50
            );

            await createAppointment({
              therapistId: data.therapistId,
              therapistName: bookingTherapistName || 'Your Therapist',
              userId: currentUser.uid,
              userName: userData.name || currentUser.displayName || 'MindMend User',
              appointmentType,
              date,
              startTime,
              endTime,
              status: 'REQUESTED',
              notes: data.message || '',
              price: getAppointmentPrice(appointmentType),
            });

            setShowCustomRequest(false);
            setShowCustomRequestConfirmation(true);
          } catch (error) {
            console.error('Error submitting custom request:', error);
            alert('Request could not be sent. Please try again.');
          }
        }}
      />
    );
  }

  if (showCustomRequestConfirmation) {
    return (
      <CustomRequestConfirmation
        onClose={() => {
          setShowCustomRequestConfirmation(false);
          setCurrentScreen('home');
        }}
      />
    );
  }

  if (showPaymentCheckout && bookingData) {
    return (
      <PaymentCheckout
        appointmentData={bookingData}
        price={bookingData.price || 120}
        onClose={() => {
          setShowPaymentCheckout(false);
          setBookingStep(3);
          setShowBookingFlow(true);
        }}
        onPaymentSuccess={async (paymentId) => {
          const currentUser = getAuth().currentUser;
          try {
            if (bookingData.id) {
              // Obstoječi appointment (terapevt je sprejel request) — samo posodobimo status
              await updateAppointmentStatus(bookingData.id, 'CONFIRMED', paymentId || 'simulated');
            } else {
              // Nov appointment (normal booking) — ustvarimo direktno kot CONFIRMED
              await createAppointment({
                therapistId: bookingData.therapistId,
                therapistName: bookingData.therapistName,
                userId: bookingData.userId || currentUser?.uid || '',
                userName: bookingData.userName || userData.name || 'MindMend User',
                appointmentType: bookingData.appointmentType,
                date: bookingData.date,
                startTime: bookingData.startTime,
                endTime: bookingData.endTime,
                status: 'CONFIRMED',
                notes: bookingData.notes || '',
                price: bookingData.price || 120,
                paymentId: paymentId || 'simulated',
              });
            }
          } catch (error) {
            console.error('Error saving appointment:', error);
          }

          setShowPaymentCheckout(false);
          setBookingData(null);
          setBookingStep(1);
          setBookingTherapistId(null);
          setCurrentScreen('appointments');
          alert('Appointment confirmed! Check your appointments to view details.');
        }}
        onPaymentFailed={async () => {
          // Payment failed — appointment ni bil ustvarjen, user lahko poskusi znova
        }}
      />
    );
  }

  return (
    <div className="relative">
      {userRole === 'user' && (
        <>
          {currentScreen === 'home' && (
            <HomeDashboard
              userId={getAuth().currentUser?.uid || ""}
              userName={userData.name}
              onCheckIn={() => setShowDailyCheckIn(true)}
              onViewAiInsights={() => setCurrentScreen('ai-insights')}
              onFindTherapist={() => setCurrentScreen('therapists')}
              onViewAppointments={() => setCurrentScreen('appointments')}
              onViewNotifications={() => setCurrentScreen('notifications')}
              onViewPrivacy={() => setCurrentScreen('privacy-policy')}
              onViewTerms={() => setCurrentScreen('terms-conditions')}
            />
          )}
          {currentScreen === 'journal' && (
            <JournalHistory onSelectCheckIn={(checkIn) => setSelectedCheckIn(checkIn)} />
          )}
          {currentScreen === 'explore' && (
            <ContentLibrary
  onSelectContent={(content) => setSelectedContent(content)}
  onViewTherapist={(therapistId) => {
    setSelectedTherapistId(therapistId);
    setCurrentScreen('therapistProfile');
  }}
/>
          )}
          {currentScreen === 'therapists' && (
          <TherapistList
            onSelectTherapist={(id) => setSelectedTherapistId(id)}
            onBookTherapist={async (id, name) => {
              const availability = await getTherapistAvailability(id);

              if (!availability || !availability.isSetupComplete) {
                return;
              }
              
              setBookingTherapistId(id);
              setBookingTherapistName(name);
              setBookingTherapistAvailability({ ...availability, therapistId: id });
              setSelectedTherapistId(null);
              setBookingStep(1);
              setBookingData(null);
              setShowBookingFlow(true);
            }}
          />
          )}
          {currentScreen === 'chat' && (
            <ChatScreen
              userRole="user"
              onOpenChat={(target) => {
                setChatTarget(target);
                setShowChatConversation(true);
              }}
            />
          )}
          {currentScreen === 'appointments' && (
            <UserAppointmentsScreen
              onCompletePayment={(appointment) => {
                setBookingData({
                  id: appointment.id,
                  therapistId: appointment.therapistId,
                  therapistName: appointment.therapistName,
                  appointmentType: appointment.appointmentType,
                  date: appointment.date,
                  startTime: appointment.startTime,
                  endTime: appointment.endTime,
                  notes: appointment.notes,
                  price: appointment.price
                });
                setShowPaymentCheckout(true);
              }}
            />
          )}
          {currentScreen === 'notifications' && <NotificationsScreen onClose={() => setCurrentScreen('home')} />}
          {currentScreen === 'ai-insights' && (
            <AiInsightsScreen 
              userId={getAuth().currentUser?.uid || ""}
              onBack={() => setCurrentScreen('home')}
              onCheckIn={() => {
                setCurrentScreen('home');
                setShowDailyCheckIn(true);
              }}
            />
          )}
          {currentScreen === 'privacy-policy' && (
            <PrivacyPolicyPage onBack={() => setCurrentScreen('home')} />
          )}
          {currentScreen === 'terms-conditions' && (
            <TermsConditionsPage onBack={() => setCurrentScreen('home')} />
          )}
          {currentScreen === 'profile' && (
            <ProfileScreen
              onLogout={handleLogout}
              userName={userData.name}
              userRole="User"
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={handleToggleNotifications}
              biometricAuthEnabled={biometricAuthEnabled}
              onToggleBiometricAuth={handleToggleBiometricAuth}
              onNavigateToLikedContent={() => setShowLikedContent(true)}
              onNavigateToSavedContent={() => setShowSavedContent(true)}
              onUpdateName={handleUpdateName}
              onNavigateToCompletedContent={() => setShowCompletedContent(true)}
            />
          )}
        </>
      )}

      {userRole === 'therapist' && (
        <>
          {currentScreen === 'dashboard' && (
            <TherapistDashboard
              therapistName={therapistName || 'Therapist'}
              onViewNotifications={() => setCurrentScreen('notifications')}
            />
          )}
          {currentScreen === 'mycontent' && <TherapistMyContent />}
          {currentScreen === 'availability' && <TherapistAvailabilityScreen />}
          {currentScreen === 'appointments' && <TherapistAppointmentsScreen />}
          {currentScreen === 'clients' && (
            <ClientFilesScreen
              therapistId={getAuth().currentUser?.uid || ''}
              onOpenClientFile={(userId) => setSelectedClientUserId(userId)}
            />
          )}
          {currentScreen === 'notifications' && <NotificationsScreen onClose={() => setCurrentScreen('dashboard')} />}
          {currentScreen === 'profile' && (
            <ProfileScreen
              onLogout={handleLogout}
              userName={therapistName || 'Therapist'}
              userRole="Therapist"
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={handleToggleNotifications}
              biometricAuthEnabled={biometricAuthEnabled}
              onToggleBiometricAuth={handleToggleBiometricAuth}
              onNavigateToLikedContent={() => setShowLikedContent(true)}
              onNavigateToSavedContent={() => setShowSavedContent(true)}
              onNavigateToCompletedContent={() => setShowCompletedContent(true)}
              onEditProfile={() => setShowTherapistProfileEdit(true)}
              therapistProfileProp={therapistProfileData}
            />
          )}
        </>
      )}

      <BottomNav activeTab={currentScreen} onTabChange={handleTabChange} role={userRole} />

      {showTutorial && (
        <AppTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}

      {showTherapistTutorial && (
        <TherapistTutorial
          onComplete={handleTherapistTutorialComplete}
          onSkip={handleTherapistTutorialSkip}
        />
      )}
    </div>
  );
}