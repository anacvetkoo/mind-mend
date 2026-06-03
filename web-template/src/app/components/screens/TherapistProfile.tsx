import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Award, Users, Calendar, Clock, MessageCircle, Phone, Video, MapPin, BanIcon, Wind, Volume2, Brain } from 'lucide-react';
import { getTherapistById, getTherapistAvailability, getBlockedTimes, submitTherapistRating, type TherapistPublicProfile, type TherapistContentPreview } from '../../services/users';
import type { TherapistAvailability, BlockedTime } from '../../types/appointments';
import { getAppointmentsForTherapist } from '../../services/appointments';

interface TherapistProfileProps {
  therapistId: string | number;
  onClose: () => void;
  onMessage: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onBookAppointment?: (therapistName: string, availability: TherapistAvailability | null) => void;
  onSelectContent?: (content: TherapistContentPreview) => void;
}

const defaultTherapist: TherapistPublicProfile = {
  id: '',
  name: 'Therapist',
  avatar: '',
  title: 'Mental health professional',
  specialization: '',
  rating: 5,
  reviews: 0,
  bio: '',
  tags: [],
  yearsExperience: 0,
  sessionsCompleted: 0,
  content: [],
  isAvailable: false,
};

const SESSION_TYPE_ICONS: Record<string, typeof MessageCircle> = {
  'Chat': MessageCircle,
  'Voice Call': Phone,
  'Video Call': Video,
  'In Person': MapPin,
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  'Chat': 'Chat',
  'Voice Call': 'Voice',
  'Video Call': 'Video',
  'In Person': 'In Person',
};

const getCategoryIcon = (item: TherapistContentPreview) => {
  const value = `${item.category || ''} ${item.categoryLabel || ''} ${item.contentType || ''}`.toLowerCase();

  if (value.includes('breath')) return Wind;
  if (value.includes('sound') || value.includes('audio')) return Volume2;

  return Brain;
};

export function TherapistProfile({
  therapistId,
  onClose,
  onMessage,
  onVoiceCall,
  onVideoCall,
  onBookAppointment,
  onSelectContent
}: TherapistProfileProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [therapist, setTherapist] = useState<TherapistPublicProfile>(defaultTherapist);
  const [availability, setAvailability] = useState<TherapistAvailability | null>(null);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoAvailabilityModal, setShowNoAvailabilityModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchTherapist = async () => {
      const uid = String(therapistId);
      const [therapistData, avail, blocked, appointments] = await Promise.all([
  getTherapistById(uid),
  getTherapistAvailability(uid),
  getBlockedTimes(uid),
  getAppointmentsForTherapist(uid),
]);

      if (isMounted) {
        if (therapistData) setTherapist(therapistData);
if (avail) setAvailability({ ...avail, therapistId: uid });

setCompletedSessions(
  appointments.filter((appointment) => appointment.status === 'COMPLETED').length
);

setBlockedTimes(blocked);
setIsLoading(false);
      }
    };

    fetchTherapist();
    return () => { isMounted = false; };
  }, [therapistId]);

  const handleSubmitRating = async () => {
    if (userRating === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitTherapistRating(String(therapistId), userRating);
      setIsSubmitted(true);
      
      setTherapist(prev => ({
        ...prev,
        reviews: prev.reviews + 1,
        rating: userRating
      }));
    } catch (error) {
      console.error("Napaka pri shranjevanju ocene terapevta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Availability helpers ────────────────────────────────────────────────────

  const enabledWorkingDays = availability?.workingHours?.filter(wh => wh.enabled) ?? [];

  const formatDayGroups = (days: typeof enabledWorkingDays) => {
    if (days.length === 0) return null;
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayAbbr: Record<string, string> = {
      Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
      Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun'
    };
    const sorted = [...days].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
    const groups: { start: string; end: string; startTime: string; endTime: string }[] = [];
    let groupStart = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
      const curr = sorted[i];
      const prevIdx = dayOrder.indexOf(prev.day);
      const currIdx = curr ? dayOrder.indexOf(curr.day) : -1;
      const sameHours = curr && curr.startTime === groupStart.startTime && curr.endTime === groupStart.endTime;
      const consecutive = currIdx === prevIdx + 1;
      if (!curr || !consecutive || !sameHours) {
        groups.push({ start: groupStart.day, end: prev.day, startTime: groupStart.startTime, endTime: groupStart.endTime });
        if (curr) groupStart = curr;
      }
      prev = curr ?? prev;
    }

    return groups.map(g => ({
      label: g.start === g.end ? dayAbbr[g.start] : `${dayAbbr[g.start]}–${dayAbbr[g.end]}`,
      hours: `${g.startTime} – ${g.endTime}`,
    }));
  };

  const dayGroups = formatDayGroups(enabledWorkingDays);
  const hasAvailability = availability && availability.isSetupComplete;

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--lavender)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-[390px] mx-auto min-h-screen pb-24">

        {/* ─── Gradient Header ─────────────────────────────────────────────── */}
        <div className="relative h-[280px] bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex flex-col items-center justify-center px-6 pt-12">
          <button
            onClick={onClose}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {therapist.avatar ? (
            <img
              src={therapist.avatar}
              alt={therapist.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/50 shadow-2xl mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/30 border-4 border-white/50 shadow-2xl mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-white" />
            </div>
          )}

          <h1 className="text-2xl text-white mb-1">{therapist.name}</h1>
          <p className="text-white/90 text-sm mb-2">{therapist.title}</p>

          <div className="flex items-center gap-2">
            {therapist.reviews > 0 ? (
              <>
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span className="text-white text-sm">{therapist.rating}</span>
                <span className="text-white/80 text-xs">({therapist.reviews} reviews)</span>
              </>
            ) : (
              <span className="text-white/80 text-xs">No reviews yet</span>
            )}
          </div>
        </div>

        <div className="px-4 mt-4 relative z-0">

          {/* ─── About Card ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-lg mb-4"
          >
            <h3 className="text-lg mb-3 text-foreground">About</h3>

            {therapist.bio ? (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{therapist.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">
                This therapist hasn't added a bio yet.
              </p>
            )}

            {therapist.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {therapist.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-[var(--soft-purple)]/10 text-[var(--lavender)] text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* ─── Stats Row ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-4"
          >
            <div className="bg-card rounded-2xl p-4 shadow-md text-center">
              <Award className="w-5 h-5 text-[var(--lavender)] mx-auto mb-2" />
              <p className="text-2xl text-foreground mb-1">
                {therapist.yearsExperience > 0 ? therapist.yearsExperience : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Years</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-md text-center">
              <Users className="w-5 h-5 text-[var(--lavender)] mx-auto mb-2" />
              <p className="text-2xl text-foreground mb-1">
                {completedSessions}
              </p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-md text-center">
              <Star className="w-5 h-5 text-[var(--lavender)] mx-auto mb-2" />
              <p className="text-2xl text-foreground mb-1">
                {therapist.reviews > 0 ? therapist.rating : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </motion.div>

          {/* ─── Availability Card ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl p-5 shadow-lg mb-4"
          >
            <h3 className="text-lg mb-4 text-foreground">Availability</h3>

            {hasAvailability ? (
              <>
                {dayGroups && dayGroups.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {dayGroups.map((group, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[var(--lavender)]" />
                          <span className="text-sm text-foreground">{group.label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{group.hours}</span>
                      </div>
                    ))}
                  </div>
                )}

                {availability!.appointmentDuration && (
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--border)]">
                    <Clock className="w-4 h-4 text-[var(--lavender)]" />
                    <span className="text-sm text-muted-foreground">
                      Session duration:{' '}
                      <span className="text-foreground">{availability!.appointmentDuration} min</span>
                    </span>
                  </div>
                )}

                {availability!.pricePerType && (
                  <div className="mb-4 pb-4 border-b border-[var(--border)]">
                    <p className="text-xs text-muted-foreground mb-3">Session prices</p>
                    <div className="space-y-2">
                      {(Object.entries(availability!.pricePerType) as [string, number][])
                        .filter(([type]) => availability!.enabledTypes.includes(type as any))
                        .map(([type, basePrice]) => {
                          const userPrice = Math.round((basePrice * 1.15) * 100) / 100;
                          return (
                            <div key={type} className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{type}</span>
                              <span className="text-sm text-foreground">€{userPrice}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {availability!.enabledTypes && availability!.enabledTypes.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">Available session types</p>
                    <div className="flex flex-wrap gap-2">
                      {availability!.enabledTypes.map((type) => {
                        const Icon = SESSION_TYPE_ICONS[type] ?? Calendar;
                        const label = SESSION_TYPE_LABELS[type] ?? type;
                        return (
                          <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)]">
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-xs">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Time Off */}
                {blockedTimes.filter(bt => new Date(bt.endDate) >= new Date()).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <p className="text-xs text-muted-foreground mb-3">Upcoming time off</p>
                    <div className="space-y-2">
                      {blockedTimes
                        .filter(bt => new Date(bt.endDate) >= new Date())
                        .sort((a, b) => a.startDate.localeCompare(b.startDate))
                        .map((bt) => {
                          const start = new Date(bt.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          const end = new Date(bt.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          const dateLabel = bt.startDate === bt.endDate ? start : `${start} – ${end}`;
                          return (
                            <div key={bt.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20">
                              <BanIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                              <span className="text-xs text-red-500 dark:text-red-400 font-medium">{dateLabel}</span>
                              <span className="text-xs text-muted-foreground">
                                {bt.isFullDay ? 'All day' : `${bt.startTime}–${bt.endTime}`}
                              </span>
                              {bt.reason ? (
                                <span className="text-xs text-muted-foreground ml-auto truncate max-w-[80px]">{bt.reason}</span>
                              ) : null}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 py-2">
                <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground italic">
                  Availability not set up yet. Contact the therapist directly for scheduling.
                </p>
              </div>
            )}
          </motion.div>

          {/* ─── Book Appointment Button ─────────────────────────────────────── */}
          {onBookAppointment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                if (!availability || !availability.isSetupComplete) {
                  setShowNoAvailabilityModal(true);
                  return;
                }
                onBookAppointment(therapist.name, availability);
              }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
              </motion.button>
            </motion.div>
          )}

          {/* ─── Their Content ───────────────────────────────────────────────── */}
          {therapist.content.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-4"
            >
              <h3 className="text-lg mb-3 text-foreground">Their Content</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
                {therapist.content.map((item) => {
  const Icon = getCategoryIcon(item);
  const thumbnailGradient = item.thumbnailGradient || item.gradient || 'from-[var(--lavender)] to-[var(--soft-purple)]';

  return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectContent?.(item)}
                    className="flex-shrink-0 w-[160px] bg-card rounded-2xl p-4 shadow-md text-left"
                  >
                    <div className="w-full h-20 rounded-xl overflow-hidden mb-3">
  {item.thumbnailType === 'image' && item.thumbnailImage ? (
    <img
      src={item.thumbnailImage}
      alt={item.title}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className={`w-full h-full bg-gradient-to-br ${thumbnailGradient} flex items-center justify-center`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
  )}
</div>
                    <h4 className="text-sm mb-1 text-foreground line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">
  {item.categoryLabel || item.category || item.duration || 'Content'}
</p>
                  </button>
  );
})}
              </div>
            </motion.div>
          )}

          {/* ─── Rating Section ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-2 mb-4"
          >
            <div className="bg-card rounded-2xl p-6 shadow-lg">
              {isSubmitted ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                  <p className="text-sm text-[var(--lavender)] font-medium">
                    Thank you! Your rating has been saved.
                  </p>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-lg mb-3 text-foreground text-center">Rate this Therapist</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Share your experience to help others
                  </p>

                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { if (!isSubmitting) { setUserRating(star); setHasRated(true); } }}
                        onMouseEnter={() => !isSubmitting && setHoveredRating(star)}
                        onMouseLeave={() => !isSubmitting && setHoveredRating(0)}
                        className="focus:outline-none"
                        disabled={isSubmitting}
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            star <= (hoveredRating || userRating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>

                  {hasRated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p className="text-sm text-[var(--lavender)] mb-3">
                        Thank you for rating {userRating} star{userRating !== 1 ? 's' : ''}!
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmitRating} // 🔥 VEZAVA NA TISTO PRAVO REFRESH FUNKCIJO
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm font-medium disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                      </motion.button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      {/* ─── No Availability Modal ───────────────────────────────────────── */}
      {showNoAvailabilityModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-8"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowNoAvailabilityModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-[var(--soft-purple)]/15 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[var(--lavender)]" />
            </div>

            {/* Text */}
            <h3 className="text-xl text-foreground text-center mb-2">
              Not available yet
            </h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
              <span className="text-foreground">{therapist.name}</span> hasn't set up their schedule yet.
              Check back soon or explore other therapists.
            </p>

            {/* Buttons */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNoAvailabilityModal(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white mb-3"
            >
              Got it
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowNoAvailabilityModal(false); onClose(); }}
              className="w-full py-3.5 rounded-2xl border-2 border-[var(--border)] text-muted-foreground text-sm"
            >
              Back to therapists
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}