import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Users, FileText, Star, Calendar, Clock, MessageCircle, Phone, Video, MapPin, AlertCircle, X, Bell, RefreshCw } from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../../types/appointments';
import { getAuth } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { cancelAppointment, updateAppointmentStatus } from '../../services/appointments';
import { getPublishedContentCountForTherapist } from '../../services/content';
import { getTherapistClientFiles } from '../../services/clientFiles';

interface TherapistDashboardProps {
  therapistName?: string;
  onViewNotifications?: () => void;
  onStartSession?: (appointment: Appointment) => void;
  // ─── NOVO: callback za dokončanje profila iz opozorila ────────────────────────
  onCompleteProfile?: () => void;
}

export function TherapistDashboard({ therapistName = 'Dr. Sarah', onViewNotifications, onStartSession, onCompleteProfile }: TherapistDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'requests' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [publishedContentCount, setPublishedContentCount] = useState<number | null>(null);
  const [activeClientsCount, setActiveClientsCount] = useState<number | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [therapistRating, setTherapistRating] = useState<string>('—');
  // ─── NOVO: ali je profil terapevta nepopoln ───────────────────────────────────
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  // ─── NOVO: število neprebranih notifikacij ────────────────────────────────────
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const refreshNow = () => {
    setNow(new Date());
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const loadStats = async (uid: string) => {
    try {
      const clientFiles = await getTherapistClientFiles(uid);
      setActiveClientsCount(clientFiles.length);
      const contentCount = await getPublishedContentCountForTherapist(uid);
      setPublishedContentCount(contentCount);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  //nalaganje ocene iz firebase
  const loadRating = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().rating !== undefined) {
        const ratingValue = Number(docSnap.data().rating);
        setTherapistRating(ratingValue.toFixed(1));//zaokrožanje
      } else {
        setTherapistRating('5.0'); //privzeto
      }
    } catch (error) {
      console.error('Error loading therapist rating:', error);
      setTherapistRating('—');
    }
  };

  // ─── NOVO: preveri ali je profil terapevta nepopoln ──────────────────────────
  const checkProfileComplete = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      // Profil je nepopoln če manjka bio ALI title ALI profilna slika
      const incomplete = !data.bio || !data.title || !data.profileImage;
      setIsProfileIncomplete(incomplete);
    } catch (error) {
      console.error('Error checking profile completeness:', error);
    }
  };

  // ─── NOVO: naloži število neprebranih notifikacij ─────────────────────────────
  const loadUnreadNotificationsCount = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', uid),
        where('isRead', '==', false)
      );
      const snapshot = await getDocs(q);
      setUnreadNotificationsCount(snapshot.size);
    } catch (error) {
      console.error('Error loading unread notifications count:', error);
    }
  };

  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) { setIsLoadingAppointments(false); return; }

    const q = query(
      collection(db, 'appointments'),
      where('therapistId', '==', currentUser.uid),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
      setAppointments(data);
      setIsLoadingAppointments(false);
    }, (error) => {
      console.error('Error listening to therapist appointments:', error);
      setIsLoadingAppointments(false);
    });

    loadStats(currentUser.uid);
    loadRating(currentUser.uid);
    checkProfileComplete(currentUser.uid);
    loadUnreadNotificationsCount(currentUser.uid);

    return () => unsubscribe();
  }, []);

  const isPast = (apt: Appointment) => new Date(`${apt.date}T${apt.endTime}`) < now;

  // Upcoming: samo CONFIRMED ki niso pretekli
  const upcomingAppointments = appointments.filter(apt =>
    (apt.status === 'CONFIRMED' || apt.status === 'IN_SESSION') && !isPast(apt)
  );

  // Requests: samo REQUESTED (čaka na terapevtov odgovor)
  // PENDING_PAYMENT NE sodi sem — terapevt je že sprejel, čaka na plačilo
  const appointmentRequests = appointments.filter(apt => apt.status === 'REQUESTED' && new Date(`${apt.date}T${apt.startTime}`) >= now);

  const pastAppointments = appointments.filter((apt) =>
  apt.status === 'COMPLETED'
);

  const handleAcceptRequest = async (id: string) => {
    await updateAppointmentStatus(id, 'PENDING_PAYMENT');
  };

  const handleDeclineRequest = async (id: string) => {
    await cancelAppointment(id, true);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    await cancelAppointment(appointmentToCancel, true);
    setAppointmentToCancel(null);
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

  const completedAppointments = appointments.filter((apt) => apt.status === 'COMPLETED');

const activeClientIds = new Set(
  appointments
    .filter((apt) => apt.status === 'CONFIRMED' || apt.status === 'IN_SESSION')
    .map((apt) => apt.userId)
);

const stats = [
  { label: 'Total Sessions', value: completedAppointments.length.toString(), icon: Calendar, color: 'var(--lavender)' },
  { label: 'Active Clients', value: activeClientsCount === null ? '—' : activeClientsCount.toString(), icon: Users, color: 'var(--soft-mint)' },
  { label: 'Content Published', value: publishedContentCount === null ? '—' : publishedContentCount.toString(), icon: FileText, color: 'var(--muted-blue)' },
  { label: 'Rating', value: therapistRating, icon: Star, color: 'var(--soft-pink)' },
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
                {/* ─── NOVO: dinamična številka ───────────────────────────────── */}
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground">Here's your practice today</p>
            <OtterMascot size="sm" emotion="happy" />
          </div>
        </motion.div>

        {/* ─── NOVO: Opozorilo o nepopolnem profilu ─────────────────────────────── */}
        {isProfileIncomplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700/50 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                  Your profile is incomplete
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                  Add your bio, specializations and photo so clients can find and recognise you.
                </p>
                {onCompleteProfile && (
                  <button
                    onClick={onCompleteProfile}
                    className="text-xs font-medium px-4 py-2 rounded-xl bg-amber-500 text-white"
                  >
                    Complete profile →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

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
          <div className="flex items-center justify-between">
            <h3 className="text-xl text-foreground">My Appointments</h3>
            <button onClick={refreshNow} className="w-10 h-10 rounded-full bg-card border border-[var(--border)] flex items-center justify-center">
              <RefreshCw className={`w-4 h-4 text-muted-foreground transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
              // Preverimo ali je čas termina že nastopil
              const canStart = now >= new Date(`${apt.date}T${apt.startTime}`);
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
                    {apt.status === 'IN_SESSION' ? (
                      <>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onStartSession?.(apt)} className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm font-medium shadow-sm">Rejoin Session</motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={async () => { const { endSession } = await import('../../services/appointments'); await endSession(apt.id, apt.therapistId); }} className="px-4 py-2.5 rounded-2xl bg-red-500 text-white text-sm font-medium">End</motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileTap={{ scale: canStart ? 0.95 : 1 }}
                          onClick={() => canStart && onStartSession?.(apt)}
                          className={`flex-1 px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm transition-all ${
                            canStart
                              ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                              : 'bg-[var(--muted)] text-muted-foreground cursor-not-allowed'
                          }`}
                        >
                          Start Session
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setAppointmentToCancel(apt.id)} className="px-4 py-2.5 rounded-2xl border-2 border-[var(--lavender)] text-[var(--lavender)] bg-card text-sm font-medium">Cancel</motion.button>
                      </>
                    )}
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
      {appointmentToCancel && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-xl"
    >
      <h3 className="text-xl text-foreground mb-3">Cancel appointment?</h3>
      <p className="text-sm text-muted-foreground mb-6">
        The client will receive a full refund if you cancel this appointment.
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