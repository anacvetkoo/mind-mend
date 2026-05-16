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

type AppState = 'splash' | 'welcome' | 'auth' | 'questionnaire' | 'therapist-profile-setup' | 'app';

export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [userData, setUserData] = useState({ name: localStorage.getItem('userName') || 'Alex' });
  const [darkMode, setDarkMode] = useState(false);

  // Modal/Overlay states
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState<number | null>(null);
  const [showChatConversation, setShowChatConversation] = useState(false);
  const [chatTarget, setChatTarget] = useState<{ name: string; avatar: string; isAI: boolean } | null>(null);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [showVideoCallScreen, setShowVideoCallScreen] = useState(false);

  // Appointment booking states
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showCustomRequest, setShowCustomRequest] = useState(false);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);
  const [showCustomRequestConfirmation, setShowCustomRequestConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTherapistTutorial, setShowTherapistTutorial] = useState(false);

  // Content collection states
  const [showLikedContent, setShowLikedContent] = useState(false);
  const [showSavedContent, setShowSavedContent] = useState(false);

  // Therapist profile edit state
  const [showTherapistProfileEdit, setShowTherapistProfileEdit] = useState(false);

  // Mock therapist availability
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
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const savedRole = localStorage.getItem('userRole') as UserRole;
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isAuthenticated) {
      setAppState('app');
      if (savedRole) {
        setUserRole(savedRole);
        if (savedRole === 'therapist') {
          setCurrentScreen('dashboard');
        } else if (savedRole === 'admin') {
          setCurrentScreen('overview');
        }
      }
    }

    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
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

  // Scroll to top on screen/page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentScreen, appState, showDailyCheckIn, selectedCheckIn, selectedContent, selectedTherapistId, showChatConversation, showCallScreen, showVideoCallScreen, showBookingFlow, showCustomRequest, showPaymentCheckout, showCustomRequestConfirmation, showLikedContent, showSavedContent]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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

  const handleQuestionnaireComplete = (data: any) => {
    setUserData({ name: data.name || 'Friend' });
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'user');
    setUserRole('user');
    setAppState('app');
    setCurrentScreen('home');

    // Show tutorial on first app entry
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setTimeout(() => setShowTutorial(true), 500);
    }
  };

  const handleAuthComplete = (role: UserRole, skipQuestionnaire: boolean = false) => {
    setUserRole(role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);

    // If signing up as a user and haven't completed questionnaire, show it
    if (role === 'user' && !skipQuestionnaire && !localStorage.getItem('hasSeenOnboarding')) {
      setAppState('questionnaire');
      return;
    }

    // If signing up as a therapist and haven't completed profile setup, show it
    if (role === 'therapist' && !skipQuestionnaire && !localStorage.getItem('therapistProfileComplete')) {
      setAppState('therapist-profile-setup');
      return;
    }

    setAppState('app');

    // Set initial screen based on role
    if (role === 'therapist') {
      setCurrentScreen('dashboard');

      // Show therapist tutorial on first app entry
      if (!skipQuestionnaire) {
        const hasSeenTherapistTutorial = localStorage.getItem('hasSeenTherapistTutorial');
        if (!hasSeenTherapistTutorial) {
          setTimeout(() => setShowTherapistTutorial(true), 500);
        }
      }
    } else if (role === 'admin') {
      setCurrentScreen('overview');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleDailyCheckInComplete = (data: any) => {
    saveCheckIn(data);
    setShowDailyCheckIn(false);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');

    // Reset app state
    setAppState('auth');
    setUserRole('user');
    setCurrentScreen('home');

    // Clear any modal states
    setShowDailyCheckIn(false);
    setSelectedCheckIn(null);
    setSelectedContent(null);
    setSelectedTherapistId(null);
    setShowChatConversation(false);
    setChatTarget(null);
    setShowCallScreen(false);
    setShowVideoCallScreen(false);
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  const handleUpdateName = (newName: string) => {
    setUserData({ ...userData, name: newName });
    localStorage.setItem('userName', newName);
  };

  const handleTherapistTutorialComplete = () => {
    localStorage.setItem('hasSeenTherapistTutorial', 'true');
    setShowTherapistTutorial(false);
  };

  const handleTherapistTutorialSkip = () => {
    localStorage.setItem('hasSeenTherapistTutorial', 'true');
    setShowTherapistTutorial(false);
  };

  const handleTherapistProfileSetupComplete = (profileData: TherapistProfileData) => {
    localStorage.setItem('therapistProfile', JSON.stringify(profileData));
    localStorage.setItem('therapistProfileComplete', 'true');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'therapist');
    setUserRole('therapist');
    setAppState('app');
    setCurrentScreen('dashboard');

    // Show tutorial after profile setup
    const hasSeenTherapistTutorial = localStorage.getItem('hasSeenTherapistTutorial');
    if (!hasSeenTherapistTutorial) {
      setTimeout(() => setShowTherapistTutorial(true), 500);
    }
  };

  const handleTherapistProfileEdit = (profileData: TherapistProfileData) => {
    localStorage.setItem('therapistProfile', JSON.stringify(profileData));
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
      // Trigger editor open via a brief state change
      setTimeout(() => {
        const addButton = document.querySelector('[data-add-content-trigger]') as HTMLButtonElement;
        if (addButton) {
          addButton.click();
        }
      }, 100);
    } else {
      // If clicking the same tab, scroll to top
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

  // Modals/Overlays (on top of everything)
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
    const savedProfile = localStorage.getItem('therapistProfile');
    const initialData: TherapistProfileData = savedProfile
      ? JSON.parse(savedProfile)
      : {
          name: '',
          profileImage: '',
          title: '',
          specializations: [],
          fieldOfWork: '',
          bio: '',
          yearsOfExperience: '',
          education: '',
          licenseNumber: ''
        };

    return (
      <TherapistProfileEdit
        onClose={() => setShowTherapistProfileEdit(false)}
        initialData={initialData}
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

  // Appointment booking flows
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
        onPaymentFailed={() => {
          // Payment failed state is handled within the component
        }}
      />
    );
  }

  // Main app screens based on role
  return (
    <div className="relative">
      {/* USER SCREENS */}
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

      {/* THERAPIST SCREENS */}
      {userRole === 'therapist' && (
        <>
          {currentScreen === 'dashboard' && (
            <TherapistDashboard
              therapistName="Dr. Sarah"
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
              userName="Dr. Sarah"
              userRole="Therapist"
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              onNavigateToLikedContent={() => setShowLikedContent(true)}
              onNavigateToSavedContent={() => setShowSavedContent(true)}
              onEditProfile={() => setShowTherapistProfileEdit(true)}
            />
          )}
        </>
      )}

      {/* ADMIN SCREENS */}
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

      {/* App Tutorial */}
      {showTutorial && (
        <AppTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}

      {/* Therapist Tutorial */}
      {showTherapistTutorial && (
        <TherapistTutorial
          onComplete={handleTherapistTutorialComplete}
          onSkip={handleTherapistTutorialSkip}
        />
      )}
    </div>
  );
}