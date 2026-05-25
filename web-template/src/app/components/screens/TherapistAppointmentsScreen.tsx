import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MessageCircle, Phone, Video, MapPin, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import type { Appointment, AppointmentStatus } from '../../types/appointments';
import {
  cancelAppointment,
  getAppointmentsForTherapist,
  updateAppointmentStatus,
} from '../../services/appointments';

export function TherapistAppointmentsScreen() {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'requests' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) { setAppointments([]); setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const data = await getAppointmentsForTherapist(currentUser.uid);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load therapist appointments:', error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  const now = new Date();

  const upcomingAppointments = useMemo(() => appointments.filter((apt) => {
    const endDate = new Date(`${apt.date}T${apt.endTime}`);
    return apt.status === 'CONFIRMED' && endDate >= now;
  }), [appointments]);

  const appointmentRequests = useMemo(() => appointments.filter((apt) =>
    apt.status === 'REQUESTED'
  ), [appointments]);

  const pastAppointments = useMemo(() => appointments.filter((apt) => {
    const endDate = new Date(`${apt.date}T${apt.endTime}`);
    return apt.status === 'COMPLETED' || endDate < now || apt.status === 'CANCELLED' || apt.status === 'CANCELLED_BY_THERAPIST';
  }), [appointments]);

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
      case 'REQUESTED': return 'Pending Review';
      case 'PENDING_PAYMENT': return 'Waiting for payment';
      case 'CANCELLED': return 'Canceled by client';
      case 'CANCELLED_BY_THERAPIST': return 'Canceled by you';
      case 'COMPLETED': return 'Completed';
      default: return status.replaceAll('_', ' ');
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
    new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const renderAppointmentCard = (apt: Appointment, idx: number, mode: 'upcoming' | 'requests' | 'past') => {
    const TypeIcon = getTypeIcon(apt.appointmentType);
    const isRequest = mode === 'requests';

    return (
      <motion.div
        key={apt.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * idx }}
        className={`bg-card rounded-2xl p-5 shadow-md ${isRequest ? 'border-2 border-blue-200 dark:border-blue-900/50' : ''} ${mode === 'past' ? 'opacity-80' : ''}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg text-foreground mb-1">{apt.userName || 'Client'}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
              {getStatusLabel(apt.status)}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isRequest ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-[var(--lavender)]/10'}`}>
            <TypeIcon className={`w-6 h-6 ${isRequest ? 'text-blue-700 dark:text-blue-400' : 'text-[var(--lavender)]'}`} />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" /><span>{formatDate(apt.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" /><span>{apt.startTime} - {apt.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TypeIcon className="w-4 h-4" /><span>{apt.appointmentType}</span>
          </div>
          {apt.notes && (
            <div className="bg-[var(--muted)] rounded-xl p-3 mt-1">
              <p className="text-sm text-muted-foreground">{apt.notes}</p>
            </div>
          )}
        </div>

        {/* Upcoming buttons */}
        {mode === 'upcoming' && (
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm font-medium shadow-sm"
            >
              Start Session
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCancelAppointment(apt.id)}
              className="px-4 py-2.5 rounded-2xl border-2 border-[var(--lavender)] text-[var(--lavender)] bg-card text-sm font-medium"
            >
              Cancel
            </motion.button>
          </div>
        )}

        {/* Request buttons */}
        {mode === 'requests' && apt.status === 'REQUESTED' && (
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAcceptRequest(apt.id)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-900/50 text-sm font-medium flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Accept
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDeclineRequest(apt.id)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-900/50 text-sm font-medium flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Decline
            </motion.button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl text-foreground">Appointments</h1>
              <p className="text-muted-foreground mt-1">Manage your schedule</p>
            </div>
            <button onClick={loadAppointments} className="w-10 h-10 rounded-full bg-card border border-[var(--border)] flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-6">
          {[
            { id: 'upcoming', label: 'Upcoming', badge: upcomingAppointments.length },
            { id: 'requests', label: 'Requests', badge: appointmentRequests.length },
            { id: 'past', label: 'Past', badge: pastAppointments.length },
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
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{tab.badge}</span>
              )}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto mb-4 animate-spin opacity-60" />
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        ) : (
          <>
            {selectedTab === 'upcoming' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                  </div>
                ) : upcomingAppointments.map((apt, idx) => renderAppointmentCard(apt, idx, 'upcoming'))}
              </motion.div>
            )}
            {selectedTab === 'requests' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {appointmentRequests.length === 0 ? (
                  <div className="text-center py-16">
                    <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No pending requests</p>
                  </div>
                ) : appointmentRequests.map((apt, idx) => renderAppointmentCard(apt, idx, 'requests'))}
              </motion.div>
            )}
            {selectedTab === 'past' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {pastAppointments.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No past appointments</p>
                  </div>
                ) : pastAppointments.map((apt, idx) => renderAppointmentCard(apt, idx, 'past'))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}