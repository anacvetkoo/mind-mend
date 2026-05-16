import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { Button } from '../ui/Button';
import {
  Bell,
  Moon,
  Fingerprint,
  ChevronRight,
  LogOut,
  User,
  Clock,
  Calendar,
  MessageCircle,
  Phone,
  Video,
  MapPin,
  Edit2,
  Plus,
  Camera,
  Mic,
  Heart,
  Bookmark
} from 'lucide-react';
import type { TherapistAvailability } from '../../types/appointments';
import { TherapistAvailabilitySetup } from './TherapistAvailabilitySetup';
import { BlockedTimeManagement } from './BlockedTimeManagement';

interface ProfileScreenProps {
  onLogout: () => void;
  userName?: string;
  userRole?: string;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onNavigateToLikedContent?: () => void;
  onNavigateToSavedContent?: () => void;
  onEditProfile?: () => void;
  onUpdateName?: (name: string) => void;
}

export function ProfileScreen({ onLogout, userName = 'Alex', userRole = 'User', darkMode = false, onToggleDarkMode, onNavigateToLikedContent, onNavigateToSavedContent, onEditProfile, onUpdateName }: ProfileScreenProps) {
  const [availability, setAvailability] = useState<TherapistAvailability | null>(null);
  const [showAvailabilitySetup, setShowAvailabilitySetup] = useState(false);
  const [showBlockedTimeManagement, setShowBlockedTimeManagement] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [editedName, setEditedName] = useState(userName);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('notificationsEnabled') !== 'false');
  const [cameraPermission, setCameraPermission] = useState(() => localStorage.getItem('cameraPermission') === 'true');
  const [microphonePermission, setMicrophonePermission] = useState(() => localStorage.getItem('microphonePermission') === 'true');
  const [biometricAuth, setBiometricAuth] = useState(() => localStorage.getItem('biometricAuth') === 'true');
  const isTherapist = userRole === 'Therapist';

  // Load therapist profile if exists
  const therapistProfile = isTherapist ? (() => {
    const saved = localStorage.getItem('therapistProfile');
    return saved ? JSON.parse(saved) : null;
  })() : null;

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', String(newValue));
  };

  const handleCameraToggle = () => {
    const newValue = !cameraPermission;
    setCameraPermission(newValue);
    localStorage.setItem('cameraPermission', String(newValue));
  };

  const handleMicrophoneToggle = () => {
    const newValue = !microphonePermission;
    setMicrophonePermission(newValue);
    localStorage.setItem('microphonePermission', String(newValue));
  };

  const handleBiometricToggle = () => {
    const newValue = !biometricAuth;
    setBiometricAuth(newValue);
    localStorage.setItem('biometricAuth', String(newValue));
  };

  useEffect(() => {
    if (isTherapist) {
      const saved = localStorage.getItem('therapistAvailability');
      if (saved) {
        setAvailability(JSON.parse(saved));
      }
    }
  }, [isTherapist]);

  const handleSaveAvailability = (newAvailability: TherapistAvailability) => {
    setAvailability(newAvailability);
    localStorage.setItem('therapistAvailability', JSON.stringify(newAvailability));
    setShowAvailabilitySetup(false);
  };

  const handleSaveName = () => {
    if (editedName && editedName.trim() && onUpdateName) {
      onUpdateName(editedName.trim());
      setShowNameEditor(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Chat': return MessageCircle;
      case 'Voice Call': return Phone;
      case 'Video Call': return Video;
      case 'In Person': return MapPin;
      default: return MessageCircle;
    }
  };

  if (showAvailabilitySetup) {
    return (
      <TherapistAvailabilitySetup
        onClose={() => setShowAvailabilitySetup(false)}
        existingAvailability={availability || undefined}
        onSave={handleSaveAvailability}
      />
    );
  }

  if (showBlockedTimeManagement) {
    return (
      <BlockedTimeManagement
        therapistId="therapist-1"
        onClose={() => setShowBlockedTimeManagement(false)}
      />
    );
  }

  // Name editor modal
  if (showNameEditor) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl"
        >
          <h2 className="text-xl text-foreground mb-4">Edit Name</h2>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full p-4 rounded-2xl bg-background border-2 border-[var(--border)] focus:border-[var(--lavender)] focus:outline-none transition-all text-foreground"
            placeholder="Enter your name"
            autoFocus
          />
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setEditedName(userName);
                setShowNameEditor(false);
              }}
              className="flex-1 py-3 rounded-2xl bg-[var(--muted)] text-foreground hover:bg-[var(--muted)]/70 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveName}
              disabled={!editedName || !editedName.trim()}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
            {isTherapist && therapistProfile?.profileImage ? (
              <img src={therapistProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl text-foreground">
              {isTherapist && therapistProfile?.name ? therapistProfile.name : userName}
            </h1>
            {!isTherapist && onUpdateName && (
              <button
                onClick={() => setShowNameEditor(true)}
                className="w-8 h-8 rounded-full bg-[var(--muted)] hover:bg-[var(--lavender)]/20 flex items-center justify-center transition-colors"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          {isTherapist && therapistProfile?.title && (
            <p className="text-muted-foreground mt-1">{therapistProfile.title}</p>
          )}
          {!isTherapist && <p className="text-muted-foreground mt-1">alex@mindmend.com</p>}
          <div className="mt-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)] text-xs">
              {userRole}
            </span>
          </div>
          {isTherapist && onEditProfile && (
            <button
              onClick={onEditProfile}
              className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm hover:opacity-90 transition-opacity"
            >
              <Edit2 className="w-4 h-4 inline mr-2" />
              Edit Profile
            </button>
          )}
        </motion.div>

        {/* Content Collections */}
        {!isTherapist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <button
              onClick={onNavigateToLikedContent}
              className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-[var(--lavender)]"
            >
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="text-sm text-foreground mb-1">Liked Content</div>
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-auto" />
            </button>
            <button
              onClick={onNavigateToSavedContent}
              className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-[var(--lavender)]"
            >
              <Bookmark className="w-6 h-6 text-[var(--lavender)] mx-auto mb-2" />
              <div className="text-sm text-foreground mb-1">Saved Content</div>
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-auto" />
            </button>
          </motion.div>
        )}

        {/* Therapist Availability Section */}
        {isTherapist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-foreground">My Availability</h3>
              {availability && (
                <button
                  onClick={() => setShowAvailabilitySetup(true)}
                  className="flex items-center gap-2 text-sm text-[var(--lavender)]"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            {!availability ? (
              <Card className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">Set up your availability to start accepting appointments</p>
                <Button
                  variant="primary"
                  onClick={() => setShowAvailabilitySetup(true)}
                  className="mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Set Up Availability
                </Button>
              </Card>
            ) : (
              <Card>
                {/* Working Days */}
                <div className="mb-4">
                  <h4 className="text-sm text-muted-foreground mb-2">Working Days</h4>
                  <div className="flex flex-wrap gap-2">
                    {availability.workingHours.filter(wh => wh.enabled).map(wh => (
                      <span key={wh.day} className="px-3 py-1 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)] text-xs">
                        {wh.day.slice(0, 3)}: {wh.startTime} - {wh.endTime}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Session Settings */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-1">Appointment Duration</h4>
                    <p className="text-foreground">{availability.appointmentDuration} minutes</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-1">Break Duration</h4>
                    <p className="text-foreground">{availability.breakDuration} minutes</p>
                  </div>
                </div>

                {/* Appointment Types */}
                <div className="mb-4">
                  <h4 className="text-sm text-muted-foreground mb-2">Appointment Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {availability.enabledTypes.map(type => {
                      const Icon = getTypeIcon(type);
                      return (
                        <span key={type} className="flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--muted)] text-foreground text-xs">
                          <Icon className="w-3 h-3" />
                          {type}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Manage Time Off Button */}
                <button
                  onClick={() => setShowBlockedTimeManagement(true)}
                  className="w-full py-3 rounded-xl bg-[var(--muted)] text-foreground hover:bg-[var(--muted)]/70 transition-colors"
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Manage Time Off
                </button>
              </Card>
            )}
          </motion.div>
        )}

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-xl text-foreground mb-4">Settings</h3>
          <Card className="divide-y divide-[var(--border)]">
            <button
              onClick={handleNotificationsToggle}
              className="flex items-center justify-between w-full py-4 hover:bg-[var(--muted)] transition-colors px-2 -mx-2 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span>Notifications</span>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out ${
                notificationsEnabled ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]' : 'bg-[var(--muted)]'
              }`}>
                <div className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow-sm transition-all duration-300 ease-in-out ${
                  notificationsEnabled ? 'right-1' : 'left-1'
                }`} />
              </div>
            </button>
            <button
              onClick={onToggleDarkMode}
              className="flex items-center justify-between w-full py-4 hover:bg-[var(--muted)] transition-colors px-2 -mx-2 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <span>Dark Mode</span>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out ${
                darkMode ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]' : 'bg-[var(--muted)]'
              }`}>
                <div className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow-sm transition-all duration-300 ease-in-out ${
                  darkMode ? 'right-1' : 'left-1'
                }`} />
              </div>
            </button>
            <button
              onClick={handleBiometricToggle}
              className="flex items-center justify-between w-full py-4 hover:bg-[var(--muted)] transition-colors px-2 -mx-2 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-muted-foreground" />
                <span>Biometric Auth</span>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out ${
                biometricAuth ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]' : 'bg-[var(--muted)]'
              }`}>
                <div className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow-sm transition-all duration-300 ease-in-out ${
                  biometricAuth ? 'right-1' : 'left-1'
                }`} />
              </div>
            </button>
            <button
              onClick={handleCameraToggle}
              className="flex items-center justify-between w-full py-4 hover:bg-[var(--muted)] transition-colors px-2 -mx-2 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-col items-start">
                  <span>Camera Access</span>
                  <span className="text-xs text-muted-foreground">For video calls and appointments</span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out ${
                cameraPermission ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]' : 'bg-[var(--muted)]'
              }`}>
                <div className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow-sm transition-all duration-300 ease-in-out ${
                  cameraPermission ? 'right-1' : 'left-1'
                }`} />
              </div>
            </button>
            <button
              onClick={handleMicrophoneToggle}
              className="flex items-center justify-between w-full py-4 hover:bg-[var(--muted)] transition-colors px-2 -mx-2 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-col items-start">
                  <span>Microphone Access</span>
                  <span className="text-xs text-muted-foreground">For voice and video calls</span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out ${
                microphonePermission ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]' : 'bg-[var(--muted)]'
              }`}>
                <div className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow-sm transition-all duration-300 ease-in-out ${
                  microphonePermission ? 'right-1' : 'left-1'
                }`} />
              </div>
            </button>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            className="w-full text-[var(--destructive)] border-[var(--destructive)]"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
