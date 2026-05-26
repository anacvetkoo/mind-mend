import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Users, FileText, Star, Calendar, Clock, MessageCircle, Phone, Video, MapPin, AlertCircle, X, Bell } from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../../types/appointments';
import { getAuth } from 'firebase/auth';
import { cancelAppointment, getAppointmentsForTherapist, updateAppointmentStatus } from '../../services/appointments';

interface TherapistDashboardProps {
  therapistName?: string;
  onViewNotifications?: () => void;
  onStartSession?: (appointment: Appointment) => void;
}

export function TherapistDashboard({ therapistName = 'Dr. Sarah', onViewNotifications, onStartSession }: TherapistDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'requests' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  const loadAppointments = async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) { setIsLoadingAppointments(false); return; }
    try {
      setIsLoadingAppointments(true);
      const data = await getAppointmentsForTherapist(currentUser.uid);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  const isPast = (apt: Appointment) => new Date(`${apt.date}T${apt.endTime}`) < new Date();

  // Upcoming: samo CONFIRMED ki niso pretekli
  const upcomingAppointments = appointments.filter(apt =>
    (apt.status === 'CONFIRMED' || apt.status === 'IN_SESSION') && !isPast(apt)
  );

  // Requests: samo REQUESTED (čaka na terapevtov odgovor)
  // PENDING_PAYMENT NE sodi sem — terapevt je že sprejel, čaka na plačilo
  const appointmentRequests = appointments.filter(apt => apt.status === 'REQUESTED' && !isPast(apt));

  const pastAppointments = appointments.filter(apt => apt.status === 'COMPLETED');

  const handleAcceptRequest = async (id: string) => {
    await updateAppointmentStatus(id, 'PENDING_PAYMENT');
    await loadAppointments();
  };

  const handleDeclineRequest = async (id: string) => {
    await cancelAppointment(id, true);
    await loadAppointments();
  };

  const handleCancelAppointment = async (id: string) => {
    await cancelAppointment(id, true);
    await loadAppointments();
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'CANCELLED': case 'CANCELLED_BY_THERAPIST': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'REQUESTED': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-[var(--muted)] text-muted-foreground';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmed';
      case 'REQUESTED': return 'New request';
      case 'PENDING_PAYMENT': return 'Waiting for payment';
      case 'PAYMENT_FAILED': return 'Payment failed';
      case 'CANCELLED': return 'Canceled by client';
      case 'CANCELLED_BY_THERAPIST': return 'Canceled by you';
      case 'COMPLETED': return 'Completed';
      default: return status;
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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const stats = [
    { label: 'Total Sessions', value: '1,250', icon: Calendar, color: 'var(--lavender)' },
    { label: 'Active Clients', value: '48', icon: Users, color: 'var(--soft-mint)' },
    { label: 'Content Published', value: '24', icon: FileText, color: 'var(--muted-blue)' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'var(--soft-pink)' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl text-foreground">Welcome, {therapistName}!</h1>
            {onViewNotifications && (
              <button onClick={onViewNotifications} className="relative w-10 h-10 rounded-full bg-card flex items-center justify-center">
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground">Here's your practice today</p>
            <OtterMascot size="sm" emotion="happy" />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card rounded-2xl p-4 shadow-md">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${stat.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl text-foreground mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* My Appointments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
          <h3 className="text-xl text-foreground">My Appointments</h3>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex gap-2 mb-6" data-tutorial="appointments-card">
          {[
            { id: 'upcoming', label: 'Upcoming', badge: upcomingAppointments.length },
            { id: 'requests', label: 'Requests', badge: appointmentRequests.length },
            { id: 'past', label: 'Past' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 px-4 py-3 rounded-xl transition-all relative ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                  : 'bg-card border-2 border-[var(--border)] text-foreground'
              }`}
            >
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{tab.badge}</span>
              )}
            </button>
          ))}
        </motion.div>

        {isLoadingAppointments && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50 animate-pulse" />
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        )}

        {/* Upcoming */}
        {!isLoadingAppointments && selectedTab === 'upcoming' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            ) : upcomingAppointments.map((apt, idx) => {
              const TypeIcon = getTypeIcon(apt.appointmentType);
              return (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }} className="bg-card rounded-2xl p-5 shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg text-foreground mb-1">{apt.userName || 'Client'}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-[var(--lavender)]" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>{formatDate(apt.date)}</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>{apt.startTime} - {apt.endTime}</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><TypeIcon className="w-4 h-4" /><span>{apt.appointmentType}</span></div>
                    {apt.appointmentType === 'In Person' && apt.inPersonAddress && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /><span>{apt.inPersonAddress}</span></div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => onStartSession?.(apt)} className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm font-medium shadow-sm">Start Session</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCancelAppointment(apt.id)} className="px-4 py-2.5 rounded-2xl border-2 border-[var(--lavender)] text-[var(--lavender)] bg-card text-sm font-medium">Cancel</motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Requests — samo REQUESTED */}
        {!isLoadingAppointments && selectedTab === 'requests' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {appointmentRequests.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : appointmentRequests.map((apt, idx) => {
              const TypeIcon = getTypeIcon(apt.appointmentType);
              return (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }} className="bg-card rounded-2xl p-5 shadow-md border-2 border-blue-200 dark:border-blue-900/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg text-foreground mb-1">{apt.userName || 'Client'}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>{formatDate(apt.date)}</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>{apt.startTime} - {apt.endTime}</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><TypeIcon className="w-4 h-4" /><span>{apt.appointmentType}</span></div>
                    {apt.appointmentType === 'In Person' && apt.inPersonAddress && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /><span>{apt.inPersonAddress}</span></div>
                    )}
                    {apt.notes && <div className="bg-[var(--muted)] rounded-xl p-3 mt-2"><p className="text-sm text-muted-foreground">{apt.notes}</p></div>}
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAcceptRequest(apt.id)} className="flex-1 px-4 py-2.5 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-900/50 text-sm font-medium flex items-center justify-center gap-1.5">Accept</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleDeclineRequest(apt.id)} className="flex-1 px-4 py-2.5 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-900/50 text-sm font-medium flex items-center justify-center gap-1.5"><X className="w-4 h-4" />Decline</motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Past */}
        {!isLoadingAppointments && selectedTab === 'past' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {pastAppointments.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No past appointments</p>
              </div>
            ) : pastAppointments.map((apt, idx) => {
              const TypeIcon = getTypeIcon(apt.appointmentType);
              return (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }} className="bg-card rounded-2xl p-5 shadow-md opacity-80">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg text-foreground mb-1">{apt.userName || 'Client'}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-[var(--lavender)]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>{formatDate(apt.date)}</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>{apt.startTime} - {apt.endTime}</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><TypeIcon className="w-4 h-4" /><span>{apt.appointmentType}</span></div>
                    {apt.appointmentType === 'In Person' && apt.inPersonAddress && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /><span>{apt.inPersonAddress}</span></div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}