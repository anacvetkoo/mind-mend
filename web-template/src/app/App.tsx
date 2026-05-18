import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/screens/SplashScreen';
import { WelcomeOnboarding } from './components/screens/WelcomeOnboarding';
import { EnhancedQuestionnaire } from './components/screens/EnhancedQuestionnaire';
import { TherapistProfileSetup, type TherapistProfileData } from './components/screens/TherapistProfileSetup';
import { TherapistProfileEdit } from './components/screens/TherapistProfileEdit';
import { OnboardingFlow } from './components/screens/OnboardingFlow';
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
import { AdminOverview } from './components/screens/AdminOverview';
import { AdminUsers } from './components/screens/AdminUsers';
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
import type { TherapistAvailability } from './types/appointments';
import { saveCheckIn } from './utils/checkInUtils';
import { onAuthChange, logout } from './services/auth';
import { getUserDocument, updateUserDisplayName, updateTherapistProfile } from './services/users';

type AppState = 'splash' | 'welcome' | 'auth' | 'questionnaire' | 'therapist-profile-setup' | 'app';

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

  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState<number | null>(null);
  const [showChatConversation, setShowChatConversation] = useState(false);
  const [chatTarget, setChatTarget] = useState<{ name: string; avatar: string; isAI: boolean } | null>(null);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [showVideoCallScreen, setShowVideoCallScreen] = useState(false);

  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showCustomRequest, setShowCustomRequest] = useState(false);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);
  const [showCustomRequestConfirmation, setShowCustomRequestConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const [showTutorial, setShowTutorial] = useState(false);
  const [showTherapistTutorial, setShowTherapistTutorial] = useState(false);

  const [showLikedContent, setShowLikedContent] = useState(false);
  const [showSavedContent, setShowSavedContent] = useState(false);

  const [showTherapistProfileEdit, setShowTherapistProfileEdit] = useState(false);

  const mockTherapistAvailability: TherapistAvailability = {
    therapistId: 'therapist-1',
    workingHours: [
      { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
      { day: 'Sunday', enabled: false, startTime: '09:00', endTime: '17:00' }
    ],
    appointmentDuration: 50,
    breakDuration: 10,
    enabledTypes: ['Chat', 'Voice Call', 'Video Call', 'In Person'],
    inPersonAddress: '123 Wellness Street, Suite 200, San Francisco, CA 94102',
    isSetupComplete: true
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    let isFirstLoad = true;

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
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentScreen, appState, showDailyCheckIn, selectedCheckIn, selectedContent, selectedTherapistId, showChatConversation, showCallScreen, showVideoCallScreen, showBookingFlow, showCustomRequest, showPaymentCheckout, showCustomRequestConfirmation, showLikedContent, showSavedContent]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

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

  const handleQuestionnaireComplete = (data: any) => {
    setUserData({ name: data.name || '' });
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'user');
    setUserRole('user');
    setAppState('app');
    setCurrentScreen('home');

    import('./services/firebaseConfig').then(({ auth }) => {
      const currentUser = auth.currentUser;
      if (currentUser && data.name) {
        updateUserDisplayName(currentUser.uid, data.name);
      }
    });

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
    await logout();

    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasSeenTherapistTutorial');
    localStorage.removeItem('therapistProfileComplete');
    localStorage.removeItem('therapistProfile');
    localStorage.removeItem('userName');
    localStorage.removeItem('therapistName');
    localStorage.removeItem('currentAppState');
    localStorage.removeItem('hasSeenOnboarding');
    localStorage.removeItem('hasSeenTutorial'); // ← DODANO

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
    return <ContentDetail content={selectedContent} onClose={() => setSelectedContent(null)} />;
  }

  if (showLikedContent) {
    return (
      <LikedContentScreen
        onBack={() => setShowLikedContent(false)}
        onSelectContent={(content) => {
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
          setShowSavedContent(false);
          setSelectedContent(content);
        }}
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
        onClose={() => setSelectedTherapistId(null)}
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
        onBookAppointment={() => {
          setSelectedTherapistId(null);
          setShowBookingFlow(true);
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

  if (showBookingFlow) {
    return (
      <BookAppointmentFlow
        therapistId="therapist-1"
        therapistName="Dr. Sarah Mitchell"
        therapistAvailability={mockTherapistAvailability}
        onClose={() => setShowBookingFlow(false)}
        onRequestCustomTime={() => {
          setShowBookingFlow(false);
          setShowCustomRequest(true);
        }}
        onProceedToPayment={(data) => {
          setBookingData(data);
          setShowBookingFlow(false);
          setShowPaymentCheckout(true);
        }}
      />
    );
  }

  if (showCustomRequest) {
    return (
      <CustomAppointmentRequest
        therapistId="therapist-1"
        therapistName="Dr. Sarah Mitchell"
        onClose={() => setShowCustomRequest(false)}
        onSubmit={(data) => {
          console.log('Custom request submitted:', data);
          setShowCustomRequest(false);
          setShowCustomRequestConfirmation(true);
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
        onClose={() => setShowPaymentCheckout(false)}
        onPaymentSuccess={() => {
          setShowPaymentCheckout(false);
          setBookingData(null);
          setCurrentScreen('appointments');
          alert('Appointment confirmed! Check your appointments to view details.');
        }}
        onPaymentFailed={() => {}}
      />
    );
  }

  return (
    <div className="relative">
      {userRole === 'user' && (
        <>
          {currentScreen === 'home' && (
            <HomeDashboard
              userName={userData.name}
              onCheckIn={() => setShowDailyCheckIn(true)}
              onFindTherapist={() => setCurrentScreen('therapists')}
              onViewAppointments={() => setCurrentScreen('appointments')}
              onViewNotifications={() => setCurrentScreen('notifications')}
            />
          )}
          {currentScreen === 'journal' && (
            <JournalHistory onSelectCheckIn={(checkIn) => setSelectedCheckIn(checkIn)} />
          )}
          {currentScreen === 'explore' && (
            <ContentLibrary onSelectContent={(content) => setSelectedContent(content)} />
          )}
          {currentScreen === 'therapists' && (
            <TherapistList onSelectTherapist={(id) => setSelectedTherapistId(id)} />
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
          {currentScreen === 'profile' && (
            <ProfileScreen
              onLogout={handleLogout}
              userName={userData.name}
              userRole="User"
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              onNavigateToLikedContent={() => setShowLikedContent(true)}
              onNavigateToSavedContent={() => setShowSavedContent(true)}
              onUpdateName={handleUpdateName}
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
          {currentScreen === 'messages' && (
            <ChatScreen
              userRole="therapist"
              onOpenChat={(target) => {
                setChatTarget(target);
                setShowChatConversation(true);
              }}
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
              onNavigateToLikedContent={() => setShowLikedContent(true)}
              onNavigateToSavedContent={() => setShowSavedContent(true)}
              onEditProfile={() => setShowTherapistProfileEdit(true)}
              therapistProfileProp={therapistProfileData}
            />
          )}
        </>
      )}

      {userRole === 'admin' && (
        <>
          {currentScreen === 'overview' && <AdminOverview />}
          {currentScreen === 'users' && <AdminUsers />}
          {currentScreen === 'therapists' && <TherapistList onSelectTherapist={(id) => setSelectedTherapistId(id)} />}
          {currentScreen === 'settings' && (
            <ProfileScreen
              onLogout={handleLogout}
              userName="Admin"
              userRole="Administrator"
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              onNavigateToLikedContent={() => setShowLikedContent(true)}
              onNavigateToSavedContent={() => setShowSavedContent(true)}
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