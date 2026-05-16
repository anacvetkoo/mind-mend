import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MessageCircle, Phone, Video, MapPin, X, Check, AlertCircle } from 'lucide-react';
import type { Appointment, AppointmentRequest, AppointmentStatus } from '../../types/appointments';

export function TherapistAppointmentsScreen() {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'requests' | 'past'>('upcoming');

  // Mock data
  const upcomingAppointments: Appointment[] = [
    {
      id: '1',
      therapistId: 'therapist-1',
      therapistName: 'Dr. Sarah Mitchell',
      userId: 'user-1',
      userName: 'Alex Johnson',
      appointmentType: 'Video Call',
      date: '2026-05-20',
      startTime: '14:00',
      endTime: '14:50',
      status: 'CONFIRMED',
      price: 120,
      createdAt: '2026-05-14T10:00:00Z',
      updatedAt: '2026-05-14T10:00:00Z'
    },
    {
      id: '2',
      therapistId: 'therapist-1',
      therapistName: 'Dr. Sarah Mitchell',
      userId: 'user-2',
      userName: 'Emma Rodriguez',
      appointmentType: 'Chat',
      date: '2026-05-21',
      startTime: '10:00',
      endTime: '10:50',
      status: 'CONFIRMED',
      price: 80,
      createdAt: '2026-05-14T09:00:00Z',
      updatedAt: '2026-05-14T09:00:00Z'
    }
  ];

  const appointmentRequests: AppointmentRequest[] = [
    {
      id: 'req-1',
      therapistId: 'therapist-1',
      userId: 'user-3',
      appointmentType: 'Video Call',
      proposedDate: '2026-05-22',
      proposedStartTime: '15:00',
      proposedEndTime: '15:50',
      message: 'Would it be possible to have a session on this date? I have an important matter to discuss.',
      status: 'REQUESTED',
      createdAt: '2026-05-14T08:00:00Z'
    }
  ];

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'CANCELLED': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'REQUESTED': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-[var(--muted)] text-muted-foreground';
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your schedule</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'requests', label: 'Requests', badge: appointmentRequests.length },
            { id: 'past', label: 'Past' }
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
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Upcoming Appointments */}
        {selectedTab === 'upcoming' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            ) : (
              upcomingAppointments.map((apt, idx) => {
                const TypeIcon = getTypeIcon(apt.appointmentType);
                return (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className="bg-card rounded-2xl p-4 shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center flex-shrink-0">
                          <TypeIcon className="w-6 h-6 text-[var(--lavender)]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-foreground mb-1">{apt.userName}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(apt.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{apt.startTime} - {apt.endTime}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                    </div>

                    {apt.notes && (
                      <div className="bg-[var(--muted)] rounded-xl p-3 mb-3">
                        <p className="text-sm text-muted-foreground">{apt.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm"
                      >
                        Start Session
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-xl border-2 border-red-400 text-red-400 text-sm"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Appointment Requests */}
        {selectedTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {appointmentRequests.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              appointmentRequests.map((req, idx) => {
                const TypeIcon = getTypeIcon(req.appointmentType);
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className="bg-card rounded-2xl p-4 shadow-md border-2 border-[var(--lavender)]/30"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-6 h-6 text-[var(--lavender)]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-foreground mb-1">Client Request</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(req.proposedDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{req.proposedStartTime} - {req.proposedEndTime}</span>
                        </div>
                      </div>
                    </div>

                    {req.message && (
                      <div className="bg-[var(--muted)] rounded-xl p-3 mb-3">
                        <p className="text-sm text-foreground">{req.message}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-4 py-2 rounded-xl border-2 border-[var(--border)] text-foreground text-sm flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Past Appointments */}
        {selectedTab === 'past' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No past appointments</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
