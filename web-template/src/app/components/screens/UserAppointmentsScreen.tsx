import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MessageCircle, Phone, Video, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import type { Appointment, AppointmentRequest, AppointmentStatus } from '../../types/appointments';

interface UserAppointmentsScreenProps {
  onCompletePayment?: (appointment: Appointment) => void;
}

export function UserAppointmentsScreen({ onCompletePayment }: UserAppointmentsScreenProps = {}) {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'pending' | 'past'>('upcoming');

  // Mock data
  // NOTE: Pending tab shows appointments where user requested custom time,
  // therapist accepted, but payment is not yet complete (status: PENDING_PAYMENT)
  // After payment success, these move to Upcoming with status: CONFIRMED

  const upcomingAppointments: Appointment[] = [
    {
      id: '1',
      therapistId: 'therapist-1',
      therapistName: 'Dr. Sarah Mitchell',
      userId: 'user-1',
      userName: 'Current User',
      appointmentType: 'Video Call',
      date: '2026-05-20',
      startTime: '14:00',
      endTime: '14:50',
      status: 'CONFIRMED',
      price: 120,
      createdAt: '2026-05-14T10:00:00Z',
      updatedAt: '2026-05-14T10:00:00Z'
    }
  ];

  const pendingPayments: Appointment[] = [
    {
      id: '2',
      therapistId: 'therapist-1',
      therapistName: 'Dr. Sarah Mitchell',
      userId: 'user-1',
      userName: 'Current User',
      appointmentType: 'Chat',
      date: '2026-05-22',
      startTime: '10:00',
      endTime: '10:50',
      status: 'PENDING_PAYMENT',
      price: 80,
      createdAt: '2026-05-14T09:00:00Z',
      updatedAt: '2026-05-14T09:00:00Z'
    }
  ];

  const customRequests: AppointmentRequest[] = [];

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
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
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
          <h1 className="text-3xl text-foreground">My Appointments</h1>
          <p className="text-muted-foreground mt-1">View and manage your sessions</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {[
            { id: 'upcoming', label: 'Upcoming', badge: upcomingAppointments.length },
            { id: 'pending', label: 'Pending', badge: pendingPayments.length + customRequests.length },
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
                <p className="text-muted-foreground mb-2">No upcoming appointments</p>
                <p className="text-sm text-muted-foreground">Book a session with a therapist to get started</p>
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
                    className="bg-card rounded-2xl p-5 shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg text-foreground mb-1">{apt.therapistName}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                          {apt.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center">
                        <TypeIcon className="w-6 h-6 text-[var(--lavender)]" />
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
                        <MessageCircle className="w-4 h-4" />
                        <span>{apt.appointmentType}</span>
                      </div>
                    </div>

                    {apt.notes && (
                      <div className="bg-[var(--muted)] rounded-xl p-3 mb-4">
                        <p className="text-sm text-muted-foreground">{apt.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm"
                      >
                        Join Session
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-xl border-2 border-[var(--border)] text-foreground text-sm"
                      >
                        Reschedule
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Pending Payments & Requests */}
        {selectedTab === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Pending Payments */}
            {pendingPayments.map((apt, idx) => {
              const TypeIcon = getTypeIcon(apt.appointmentType);
              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="bg-card rounded-2xl p-5 shadow-md border-2 border-yellow-200 dark:border-yellow-900/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg text-foreground mb-1">{apt.therapistName}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                        Payment Required
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-yellow-700 dark:text-yellow-400" />
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
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-foreground" />
                      <span className="text-foreground font-medium">${apt.price}</span>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCompletePayment?.(apt)}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white"
                  >
                    Complete Payment
                  </motion.button>
                </motion.div>
              );
            })}

            {/* Custom Requests */}
            {customRequests.length === 0 && pendingPayments.length === 0 && (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No pending items</p>
              </div>
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
