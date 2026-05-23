import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Check, Clock, FileText, MessageCircle, RefreshCw, Save, User } from 'lucide-react';
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
  const [therapistNotes, setTherapistNotes] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [messages, setMessages] = useState<AppointmentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const loadDetails = async () => {
    try {
      setIsLoading(true);
      const data = await getClientFileDetails(therapistId, userId);
      setDetails(data);
      const firstAppointment = data?.appointments[0] ?? null;
      setSelectedAppointment(firstAppointment);
      setTherapistNotes((firstAppointment as any)?.therapistNotes ?? '');
      setNextSteps((firstAppointment as any)?.nextSteps ?? '');
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

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedAppointment || selectedAppointment.appointmentType !== 'Chat') {
        setMessages([]);
        return;
      }

      try {
        const data = await getAppointmentMessages(selectedAppointment.id, therapistId, userId);
        setMessages(data);
      } catch (error) {
        console.error('Failed to load appointment messages:', error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [selectedAppointment, therapistId, userId]);

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setTherapistNotes((appointment as any).therapistNotes ?? '');
    setNextSteps((appointment as any).nextSteps ?? '');
    setShowSaved(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    try {
      setIsSaving(true);
      await updateClientAppointmentNotes(selectedAppointment.id, therapistNotes, nextSteps);
      setShowSaved(true);
      await loadDetails();
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
            <div className="bg-[var(--muted)] rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Sessions together</p>
              <p className="text-lg text-foreground">{details.appointments.length}</p>
            </div>
            <div className="bg-[var(--muted)] rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Check-ins 30 days</p>
              <p className="text-lg text-foreground">{details.wellbeingSummary.recentCheckIns}</p>
            </div>
            <div className="bg-[var(--muted)] rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Avg. stress</p>
              <p className="text-lg text-foreground">{details.wellbeingSummary.averageStressLevel ?? '—'}</p>
            </div>
            <div className="bg-[var(--muted)] rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Common mood</p>
              <p className="text-lg text-foreground capitalize truncate">{details.wellbeingSummary.dominantEmotion}</p>
            </div>
          </div>
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
                <button
                  key={appointment.id}
                  onClick={() => handleSelectAppointment(appointment)}
                  className={`w-full rounded-2xl p-4 shadow-md text-left transition-all ${
                    selectedAppointment?.id === appointment.id
                      ? 'bg-[var(--lavender)]/10 border-2 border-[var(--lavender)]/40'
                      : 'bg-card border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
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
                </button>
              ))
            )}
          </div>
        </motion.div>

        {selectedAppointment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-4 shadow-md"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg text-foreground">Session notes</h3>
                <p className="text-sm text-muted-foreground">{formatDate(selectedAppointment.date)}</p>
              </div>
              {showSaved && (
                <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <Check className="w-4 h-4" />
                  Saved
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-2">Therapist notes</label>
                <textarea
                  value={therapistNotes}
                  onChange={(event) => setTherapistNotes(event.target.value)}
                  placeholder="Add notes from this session..."
                  className="w-full min-h-28 bg-background border-2 border-[var(--border)] rounded-2xl p-3 text-foreground outline-none focus:border-[var(--lavender)] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Next steps</label>
                <textarea
                  value={nextSteps}
                  onChange={(event) => setNextSteps(event.target.value)}
                  placeholder="Add plan, homework, or focus for next session..."
                  className="w-full min-h-24 bg-background border-2 border-[var(--border)] rounded-2xl p-3 text-foreground outline-none focus:border-[var(--lavender)] transition-colors resize-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save notes'}
              </motion.button>
            </div>

            {selectedAppointment.appointmentType === 'Chat' && (
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-[var(--lavender)]" />
                  <h4 className="text-foreground">Archived chat</h4>
                </div>

                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No archived messages for this session.</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
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
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
