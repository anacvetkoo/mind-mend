import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MessageCircle, Phone, Video, MapPin, DollarSign, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import type { Appointment, AppointmentStatus } from '../../types/appointments';
import { cancelAppointment, getAppointmentsForUser } from '../../services/appointments';

interface UserAppointmentsScreenProps {
  onCompletePayment?: (appointment: Appointment) => void;
  onJoinSession?: (appointment: Appointment) => void;
}

export function UserAppointmentsScreen({ onCompletePayment, onJoinSession }: UserAppointmentsScreenProps = {}) {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'pending' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  const loadAppointments = async () => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) { setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const data = await getAppointmentsForUser(userId);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading user appointments:', error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    await cancelAppointment(appointmentToCancel, false);
    setAppointmentToCancel(null);
    await loadAppointments();
  };

  const now = new Date();

  const upcomingAppointments = useMemo(
    () => appointments.filter((apt) => {
      const endDate = new Date(`${apt.date}T${apt.endTime}`);
      return (apt.status === 'CONFIRMED' || apt.status === 'IN_SESSION') && endDate >= now;
    }),
    [appointments]
  );

  const pendingAppointments = useMemo(
    () => appointments.filter((apt) => apt.status === 'PENDING_PAYMENT' || apt.status === 'REQUESTED'),
    [appointments]
  );

  const pastAppointments = useMemo(
    () => appointments.filter((apt) => apt.status === 'COMPLETED'),
    [appointments]
  );

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'CANCELLED':
      case 'CANCELLED_BY_THERAPIST': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'REQUESTED': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-[var(--muted)] text-muted-foreground';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmed';
      case 'REQUESTED': return 'Requested';
      case 'PENDING_PAYMENT': return 'Waiting for payment';
      case 'PAYMENT_FAILED': return 'Payment failed';
      case 'CANCELLED': return 'Canceled by you';
      case 'CANCELLED_BY_THERAPIST': return 'Canceled by therapist';
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
    new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

  const renderAppointmentCard = (apt: Appointment, idx: number, mode: 'upcoming' | 'pending' | 'past') => {
    const TypeIcon = getTypeIcon(apt.appointmentType);
    const needsPayment = apt.status === 'PENDING_PAYMENT';
    const isRequested = apt.status === 'REQUESTED';

    return (
      <motion.div
        key={apt.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * idx }}
        className={`bg-card rounded-2xl p-5 shadow-md ${needsPayment ? 'border-2 border-yellow-200 dark:border-yellow-900/50' : 'border-2 border-[var(--border)]'}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg text-foreground mb-1">{apt.therapistName}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
              {needsPayment ? 'Payment required' : getStatusLabel(apt.status)}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${needsPayment ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-[var(--lavender)]/10'}`}>
            {needsPayment ? (
              <DollarSign className="w-6 h-6 text-yellow-700 dark:text-yellow-400" />
            ) : (
              <TypeIcon className="w-6 h-6 text-[var(--lavender)]" />
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(apt.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{apt.startTime} - {apt.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TypeIcon className="w-4 h-4" />
            <span>{apt.appointmentType}</span>
          </div>
          {apt.appointmentType === 'In Person' && apt.inPersonAddress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{apt.inPersonAddress}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-foreground" />
            <span className="text-foreground font-medium">${apt.price}</span>
          </div>
        </div>

        {apt.notes && (
          <div className="bg-[var(--muted)] rounded-xl p-3 mb-4">
            <p className="text-sm text-muted-foreground">{apt.notes}</p>
          </div>
        )}

        {needsPayment && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onCompletePayment?.(apt)}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white mb-2"
          >
            Complete Payment
          </motion.button>
        )}

        {isRequested && (
          <p className="text-sm text-muted-foreground bg-[var(--muted)] rounded-xl p-3">
            Your therapist still needs to approve this request. Payment will be available after approval.
          </p>
        )}

        {mode === 'upcoming' && (
          <div className="flex gap-2">
            {(() => {
              const now = new Date();
              const aptStart = new Date(`${apt.date}T${apt.startTime}`);
              const isTimeReached = now >= aptStart;
              const isInSession = apt.status === 'IN_SESSION';

              const canJoin = isInSession;
              const buttonText = isInSession
                ? 'Join Session'
                : isTimeReached
                  ? 'Waiting for therapist...'
                  : 'Join Session';

              return (
                <motion.button
                  whileTap={{ scale: canJoin ? 0.95 : 1 }}
                  onClick={() => canJoin && onJoinSession?.(apt)}
                  className={`flex-1 px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm transition-all ${
                    canJoin
                      ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                      : 'bg-[var(--muted)] text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {buttonText}
                </motion.button>
              );
            })()}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setAppointmentToCancel(apt.id)}
              className="px-4 py-2.5 rounded-2xl border-2 border-[var(--lavender)] text-[var(--lavender)] bg-card text-sm font-medium"
            >
              Cancel
            </motion.button>
          </div>
        )}
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading appointments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl text-foreground">My Appointments</h1>
              <p className="text-muted-foreground mt-1">View and manage your sessions</p>
            </div>
            <button
              onClick={loadAppointments}
              className="w-10 h-10 rounded-full bg-card border border-[var(--border)] flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-6">
          {[
            { id: 'upcoming', label: 'Upcoming', badge: upcomingAppointments.length },
            { id: 'pending', label: 'Pending', badge: pendingAppointments.length },
            { id: 'past', label: 'Past', badge: 0 }
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
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {selectedTab === 'upcoming' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-2">No upcoming appointments</p>
                <p className="text-sm text-muted-foreground">Book a session with a therapist to get started</p>
              </div>
            ) : upcomingAppointments.map((apt, idx) => renderAppointmentCard(apt, idx, 'upcoming'))}
          </motion.div>
        )}

        {selectedTab === 'pending' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {pendingAppointments.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No pending items</p>
              </div>
            ) : (
              <>
                {pendingAppointments.filter(a => a.status === 'PENDING_PAYMENT').length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Ready to pay</p>
                    {pendingAppointments.filter(a => a.status === 'PENDING_PAYMENT').map((apt, idx) => renderAppointmentCard(apt, idx, 'pending'))}
                  </>
                )}
                {pendingAppointments.filter(a => a.status === 'REQUESTED').length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Awaiting therapist approval</p>
                    {pendingAppointments.filter(a => a.status === 'REQUESTED').map((apt, idx) => renderAppointmentCard(apt, idx, 'pending'))}
                  </>
                )}
              </>
            )}
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
      </div>

      {appointmentToCancel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-xl"
          >
            <h3 className="text-xl text-foreground mb-3">Cancel appointment?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You receive a full refund only if you cancel at least 72 hours before the session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setAppointmentToCancel(null)}
                className="flex-1 py-3 rounded-xl bg-[var(--muted)] text-foreground"
              >
                Keep
              </button>
              <button
                onClick={handleCancelAppointment}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}