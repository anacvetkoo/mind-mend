import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Check, Clock, FileText, HeartPulse, MessageCircle, NotebookPen, Pill, RefreshCw, Save, ShieldCheck, Sparkles, User, VenusAndMars, X } from 'lucide-react';
import type { Appointment } from '../../types/appointments';
import type { AppointmentMessage, ClientFileDetailsData } from '../../types/clientFiles';
import {
  getAppointmentMessages,
  getClientFileDetails,
  updateClientAppointmentNotes,
} from '../../services/clientFiles';

interface ClientFileDetailsProps {
  therapistId: string;
  userId: string;
  onBack: () => void;
}

export function ClientFileDetails({ therapistId, userId, onBack }: ClientFileDetailsProps) {
  const [details, setDetails] = useState<ClientFileDetailsData | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [notesAppointment, setNotesAppointment] = useState<Appointment | null>(null);
  const [therapistNotes, setTherapistNotes] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [messages, setMessages] = useState<AppointmentMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const loadDetails = async () => {
    try {
      setIsLoading(true);
      const data = await getClientFileDetails(therapistId, userId);
      setDetails(data);
      setSelectedAppointment(null);
setNotesAppointment(null);
setTherapistNotes('');
setNextSteps('');
    } catch (error) {
      console.error('Failed to load client file details:', error);
      setDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [therapistId, userId]);

  

  const handleOpenNotes = (appointment: Appointment) => {
  setNotesAppointment(appointment);
  setTherapistNotes((appointment as any).therapistNotes ?? '');
  setNextSteps((appointment as any).nextSteps ?? '');
  setShowSaved(false);
};

const handleOpenChat = async (appointment: Appointment) => {
  setSelectedAppointment(appointment);
  setMessages([]);
  setIsLoadingMessages(true);

  try {
    const data = await getAppointmentMessages(appointment.id, therapistId, userId);
    setMessages(data);
  } catch (error) {
    console.error('Failed to load appointment messages:', error);
    setMessages([]);
  } finally {
    setIsLoadingMessages(false);
  }
};

const handleCloseNotes = () => {
  if (!notesAppointment) return;

  const currentTherapistNotes = ((notesAppointment as any).therapistNotes ?? '').trim();
  const currentNextSteps = ((notesAppointment as any).nextSteps ?? '').trim();

  const hasUnsavedChanges =
    therapistNotes.trim() !== currentTherapistNotes ||
    nextSteps.trim() !== currentNextSteps;

  if (hasUnsavedChanges) {
    setShowDiscardConfirm(true);
    return;
  }

  setNotesAppointment(null);
};

const handleDiscardNotes = () => {
  setShowDiscardConfirm(false);
  setNotesAppointment(null);
  setTherapistNotes('');
  setNextSteps('');
};

  const handleSaveNotes = async () => {
  if (!notesAppointment) return;

  try {
    setIsSaving(true);
    await updateClientAppointmentNotes(notesAppointment.id, therapistNotes, nextSteps);
    setShowSaved(true);
    await loadDetails();
    setShowDiscardConfirm(false);
    setNotesAppointment(null);
  } catch (error) {
    console.error('Failed to save appointment notes:', error);
  } finally {
    setIsSaving(false);
  }
};

  const formatDate = (date?: string) => {
    if (!date) return 'No data';

    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return 'No data';

  return String(value);
};

const formatYesNo = (value?: string) => {
  if (value === 'yes') return 'Yes';
  if (value === 'no' || value === 'ne') return 'No';

  return 'No data';
};

const formatSessionDate = (value?: string | null) => {
  if (!value) return 'No session';

  return formatDate(value);
};

const now = new Date();

const confirmedAppointments = details?.appointments.filter(
  (appointment) => appointment.status === 'CONFIRMED'
) ?? [];

const completedAppointments = confirmedAppointments.filter((appointment) => {
  const appointmentEndDate = new Date(`${appointment.date}T${appointment.endTime}`);

  return appointmentEndDate < now;
});

const upcomingAppointments = confirmedAppointments.filter((appointment) => {
  const appointmentEndDate = new Date(`${appointment.date}T${appointment.endTime}`);

  return appointmentEndDate >= now;
});

const getLastCompletedSessionDate = () => {
  const sortedCompletedAppointments = [...completedAppointments].sort((firstAppointment, secondAppointment) => {
    const firstDate = new Date(`${firstAppointment.date}T${firstAppointment.endTime}`).getTime();
    const secondDate = new Date(`${secondAppointment.date}T${secondAppointment.endTime}`).getTime();

    return secondDate - firstDate;
  });

  const lastCompletedAppointment = sortedCompletedAppointments[0];

  if (!lastCompletedAppointment) return 'No session';

  return formatDate(lastCompletedAppointment.date);
};

const getNextSessionDate = () => {
  const sortedUpcomingAppointments = [...upcomingAppointments].sort((firstAppointment, secondAppointment) => {
    const firstDate = new Date(`${firstAppointment.date}T${firstAppointment.startTime}`).getTime();
    const secondDate = new Date(`${secondAppointment.date}T${secondAppointment.startTime}`).getTime();

    return firstDate - secondDate;
  });

  const nextAppointment = sortedUpcomingAppointments[0];

  if (!nextAppointment) return 'No session';

  return `${formatDate(nextAppointment.date)} at ${nextAppointment.startTime}`;
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto mb-4 animate-spin opacity-60" />
          <p className="text-muted-foreground">Loading client file...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto px-6 py-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center mb-8"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h3 className="text-lg text-foreground mb-2">Client file not found</h3>
            <p className="text-sm text-muted-foreground">You can only view client files connected to your appointments.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center hover:border-[var(--lavender)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl text-foreground truncate">Client File</h1>
            <p className="text-sm text-muted-foreground truncate">{details.clientFile.userName}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 shadow-md mb-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center overflow-hidden">
              {details.clientFile.userPhotoURL ? (
                <img
                  src={details.clientFile.userPhotoURL}
                  alt={details.clientFile.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-[var(--lavender)]" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl text-foreground truncate">{details.clientFile.userName}</h2>
              {details.clientFile.userEmail && (
                <p className="text-sm text-muted-foreground truncate">{details.clientFile.userEmail}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
  <div className="bg-gradient-to-br from-[var(--lavender)]/20 to-[var(--soft-purple)]/10 rounded-2xl p-3 border border-[var(--lavender)]/20">
    <Calendar className="w-4 h-4 text-[var(--soft-purple)] mb-2" />
    <p className="text-xs text-muted-foreground mb-1">Sessions together</p>
    <p className="text-lg text-foreground">{completedAppointments.length}</p>
  </div>

  <div className="bg-gradient-to-br from-[var(--soft-mint)]/25 to-[var(--lavender)]/10 rounded-2xl p-3 border border-[var(--soft-mint)]/20">
    <Calendar className="w-4 h-4 text-green-600 dark:text-green-400 mb-2" />
    <p className="text-xs text-muted-foreground mb-1">Signed up</p>
    <p className="text-sm text-foreground">{formatDate(details.clientProfile.createdAt)}</p>
  </div>

  <div className="bg-card rounded-2xl p-3 border border-[var(--border)]">
    <p className="text-xs text-muted-foreground mb-1">Last session</p>
    <p className="text-sm text-foreground">
      {getLastCompletedSessionDate()}
    </p>
  </div>

  <div className="bg-card rounded-2xl p-3 border border-[var(--border)]">
    <p className="text-xs text-muted-foreground mb-1">Next session</p>
    <p className="text-sm text-foreground">
      {getNextSessionDate()}
    </p>
  </div>
</div>
        </motion.div>

        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.05 }}
  className="bg-card rounded-2xl p-4 shadow-md mb-4"
>
  <div className="flex items-center gap-2 mb-4">
    <Sparkles className="w-5 h-5 text-[var(--lavender)]" />
    <h3 className="text-lg text-foreground">Client profile</h3>
  </div>

  <div className="grid grid-cols-2 gap-3 mb-4">
    <div className="rounded-2xl p-3 bg-[var(--lavender)]/10 border border-[var(--lavender)]/20">
      <VenusAndMars className="w-4 h-4 text-[var(--soft-purple)] mb-2" />
      <p className="text-xs text-muted-foreground mb-1">Gender</p>
      <p className="text-sm text-foreground capitalize">{formatValue(details.clientProfile.gender)}</p>
    </div>

    <div className="rounded-2xl p-3 bg-[var(--soft-mint)]/20 border border-[var(--soft-mint)]/20">
      <User className="w-4 h-4 text-green-600 dark:text-green-400 mb-2" />
      <p className="text-xs text-muted-foreground mb-1">Age</p>
      <p className="text-sm text-foreground">{formatValue(details.clientProfile.age)}</p>
    </div>

    <div className="rounded-2xl p-3 bg-[var(--lavender)]/10 border border-[var(--lavender)]/20">
      <Pill className="w-4 h-4 text-[var(--soft-purple)] mb-2" />
      <p className="text-xs text-muted-foreground mb-1">Medications</p>
      <p className="text-sm text-foreground capitalize">{formatValue(details.clientProfile.medications)}</p>
    </div>

    <div className="rounded-2xl p-3 bg-[var(--soft-mint)]/20 border border-[var(--soft-mint)]/20">
      <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400 mb-2" />
      <p className="text-xs text-muted-foreground mb-1">Professional help before</p>
      <p className="text-sm text-foreground">{formatYesNo(details.clientProfile.professionalHelp)}</p>
    </div>
  </div>

  {details.clientProfile.medicationSpec.length > 0 && (
    <div className="mb-4">
      <p className="text-sm text-foreground mb-2">Medication details</p>
      <div className="flex flex-wrap gap-2">
        {details.clientProfile.medicationSpec.map((medication) => (
          <span
            key={medication}
            className="px-3 py-2 rounded-full bg-[var(--lavender)]/10 text-[var(--soft-purple)] text-sm"
          >
            {medication}
          </span>
        ))}
      </div>
    </div>
  )}

  <div>
    <p className="text-sm text-foreground mb-2">Symptoms when signed up</p>

    {details.clientProfile.symptoms.length === 0 ? (
      <p className="text-sm text-muted-foreground bg-[var(--muted)] rounded-2xl p-3">
        No symptoms added during sign up.
      </p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {details.clientProfile.symptoms.map((symptom) => (
          <span
            key={symptom}
            className="px-3 py-2 rounded-full bg-gradient-to-r from-[var(--lavender)]/15 to-[var(--soft-mint)]/20 text-foreground text-sm border border-[var(--border)]"
          >
            {symptom}
          </span>
        ))}
      </div>
    )}
  </div>
</motion.div>

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="bg-gradient-to-br from-[var(--lavender)]/10 via-card to-[var(--soft-mint)]/10 rounded-2xl p-4 shadow-md mb-4 border border-[var(--border)]"
>
  <div className="flex items-center gap-2 mb-4">
    <HeartPulse className="w-5 h-5 text-[var(--soft-purple)]" />
    <h3 className="text-lg text-foreground">Wellbeing lately</h3>
  </div>

  {!details.latestCheckIn ? (
    <p className="text-sm text-muted-foreground bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
      No check-in data available yet.
    </p>
  ) : (
    <div className="space-y-3">
      <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
        <p className="text-xs text-muted-foreground mb-1">Latest check-in</p>
        <p className="text-sm text-foreground">{formatDate(details.latestCheckIn.date)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-1">Emotional state</p>
          <p className="text-sm text-foreground capitalize">
            {formatValue(details.latestCheckIn.emotionalState)}
          </p>
        </div>

        <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-1">Stress level</p>
          <p className="text-sm text-foreground">
            {details.latestCheckIn.stressLevel ?? 'No data'}
          </p>
        </div>

        <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-1">Sleep quality</p>
          <p className="text-sm text-foreground capitalize">
            {formatValue(details.latestCheckIn.sleepQuality)}
          </p>
        </div>

        <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-1">Social connection</p>
          <p className="text-sm text-foreground">
            {details.latestCheckIn.socialConnection ?? 'No data'}
          </p>
        </div>
      </div>

      {details.latestCheckIn.dominantEmotion.length > 0 && (
        <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-2">Dominant emotions</p>
          <div className="flex flex-wrap gap-2">
            {details.latestCheckIn.dominantEmotion.map((emotion) => (
              <span
                key={emotion}
                className="px-3 py-2 rounded-full bg-[var(--lavender)]/15 text-[var(--soft-purple)] text-sm capitalize"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-1">Thoughts today</p>
          <p className="text-sm text-foreground leading-relaxed break-words">
            {formatValue(details.latestCheckIn.thoughtsToday)}
          </p>
        </div>

        <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-1">Difficulties</p>
          <p className="text-sm text-foreground leading-relaxed break-words">
            {formatValue(details.latestCheckIn.difficulties)}
          </p>
        </div>

        <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-1">Gratitude</p>
          <p className="text-sm text-foreground leading-relaxed break-words">
            {formatValue(details.latestCheckIn.gratitude)}
          </p>
        </div>

        <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-1">What could help tomorrow</p>
          <p className="text-sm text-foreground leading-relaxed break-words">
            {formatValue(details.latestCheckIn.tomorrowHelp)}
          </p>
        </div>

        <div className="bg-background/70 rounded-2xl p-3 border border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-1">Energy source</p>
          <p className="text-sm text-foreground leading-relaxed break-words">
            {formatValue(details.latestCheckIn.energySource)}
          </p>
        </div>
      </div>
    </div>
  )}
</motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <h3 className="text-lg text-foreground mb-3">Sessions</h3>
          <div className="space-y-3">
            {details.appointments.length === 0 ? (
              <div className="bg-card rounded-2xl p-4 shadow-md text-center">
                <Calendar className="w-10 h-10 text-muted-foreground opacity-40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No sessions with this client yet</p>
              </div>
            ) : (
              details.appointments.map((appointment) => (
                <div
  key={appointment.id}
  className="w-full bg-card rounded-2xl p-4 shadow-md border-2 border-transparent"
>
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p className="text-foreground">{appointment.appointmentType}</p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(appointment.date)}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
        <Clock className="w-4 h-4" />
        <span>{appointment.startTime} - {appointment.endTime}</span>
      </div>
    </div>

    <span className="px-3 py-1 rounded-full bg-[var(--muted)] text-muted-foreground text-xs">
      {appointment.status.replaceAll('_', ' ')}
    </span>
  </div>

  <div className="flex gap-2 mt-4">
    <button
      onClick={() => handleOpenNotes(appointment)}
      className="flex-1 px-3 py-2 rounded-xl bg-[var(--lavender)]/10 text-[var(--soft-purple)] text-sm flex items-center justify-center gap-2"
    >
      <NotebookPen className="w-4 h-4" />
      Notes
    </button>

    {appointment.appointmentType === 'Chat' && (
      <button
        onClick={() => handleOpenChat(appointment)}
        className="flex-1 px-3 py-2 rounded-xl bg-[var(--muted)] text-muted-foreground text-sm flex items-center justify-center gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        Chat
      </button>
    )}
  </div>
</div>
              ))
            )}
          </div>
        </motion.div>

    {notesAppointment && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-card rounded-3xl p-5 shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg text-foreground">Session notes</h3>
          <p className="text-sm text-muted-foreground">{formatDate(notesAppointment.date)}</p>
        </div>

        <button
          type="button"
          onClick={handleCloseNotes}
          className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {showSaved && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-4">
          <Check className="w-4 h-4" />
          Saved
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-foreground mb-2">Therapist notes</label>
          <textarea
            value={therapistNotes}
            onChange={(event) => setTherapistNotes(event.target.value)}
            placeholder="Add notes from this session..."
            className="w-full min-h-32 bg-background border-2 border-[var(--border)] rounded-2xl p-3 text-foreground outline-none focus:border-[var(--lavender)] transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-foreground mb-2">Next steps</label>
          <textarea
            value={nextSteps}
            onChange={(event) => setNextSteps(event.target.value)}
            placeholder="Add plan, homework, or focus for next session..."
            className="w-full min-h-28 bg-background border-2 border-[var(--border)] rounded-2xl p-3 text-foreground outline-none focus:border-[var(--lavender)] transition-colors resize-none"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleSaveNotes}
          disabled={isSaving}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save notes'}
        </motion.button>
      </div>
    </motion.div>
    {showDiscardConfirm && (
  <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm bg-card rounded-3xl p-5 shadow-xl"
    >
      <h4 className="text-lg text-foreground mb-2">Discard changes?</h4>
      <p className="text-sm text-muted-foreground mb-5">
        You have unsaved changes. Are you sure you want to close without saving?
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowDiscardConfirm(false)}
          className="flex-1 px-4 py-3 rounded-xl bg-[var(--muted)] text-foreground"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleDiscardNotes}
          className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white"
        >
          Discard
        </button>
      </div>
    </motion.div>
  </div>
)}
  </div>
)}   

{selectedAppointment?.appointmentType === 'Chat' && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-2xl p-4 shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
    >

    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-[var(--lavender)]" />
        <div>
          <h4 className="text-foreground">Archived chat</h4>
          <p className="text-sm text-muted-foreground">{formatDate(selectedAppointment.date)}</p>
        </div>
      </div>

      <button
        onClick={() => setSelectedAppointment(null)}
        className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>

    {isLoadingMessages ? (
  <p className="text-sm text-muted-foreground">Loading archived messages...</p>
) : messages.length === 0 ? (
  <p className="text-sm text-muted-foreground">No archived messages for this session.</p>
) : (
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-2xl p-3 ${
              message.senderRole === 'therapist'
                ? 'bg-[var(--lavender)]/10 ml-8'
                : 'bg-[var(--muted)] mr-8'
            }`}
          >
            <p className="text-xs text-muted-foreground mb-1 capitalize">{message.senderRole}</p>
            <p className="text-sm text-foreground">{message.message}</p>
          </div>
        ))}
      </div>
    )}
      </motion.div>
  </div>
)}
      </div>
    </div>
  );
}
