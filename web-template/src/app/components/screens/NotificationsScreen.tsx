import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Calendar, CreditCard, X, Check, Clock, AlertCircle, Heart } from 'lucide-react';
import type { Notification } from '../../types/appointments';
import { isTodayCompleted } from '../../utils/checkInUtils';

interface NotificationsScreenProps {
  onClose?: () => void;
}

export function NotificationsScreen({ onClose }: NotificationsScreenProps = {}) {
  const [todayCompleted, setTodayCompleted] = useState(false);

  useEffect(() => {
    setTodayCompleted(isTodayCompleted());
  }, []);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      userId: 'user-1',
      type: 'booking',
      title: 'Appointment Confirmed',
      message: 'Your appointment with Dr. Sarah Mitchell on May 20 at 2:00 PM has been confirmed.',
      appointmentId: 'apt-1',
      isRead: false,
      createdAt: '2026-05-14T10:00:00Z'
    },
    {
      id: '2',
      userId: 'user-1',
      type: 'reminder',
      title: 'Upcoming Appointment',
      message: 'Reminder: You have an appointment with Dr. Sarah Mitchell tomorrow at 2:00 PM.',
      appointmentId: 'apt-1',
      isRead: false,
      createdAt: '2026-05-14T09:00:00Z'
    },
    {
      id: '3',
      userId: 'user-1',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment of $120 for the appointment has been processed.',
      appointmentId: 'apt-1',
      isRead: true,
      createdAt: '2026-05-13T15:00:00Z'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'payment': return CreditCard;
      case 'reminder': return Clock;
      case 'cancellation': return X;
      case 'request': return AlertCircle;
      case 'checkin': return Heart;
      default: return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'payment': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'reminder': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'cancellation': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'request': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'checkin': return 'bg-[var(--lavender)]/20 text-[var(--lavender)]';
      default: return 'bg-[var(--lavender)]/10 text-[var(--lavender)]';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  // Create dynamic notification list with daily check-in reminder
  const allNotifications = !todayCompleted
    ? [
        {
          id: 'daily-checkin',
          userId: 'current-user',
          type: 'checkin',
          title: 'Daily Check-in Reminder',
          message: 'You still have a daily check-in waiting!',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        ...notifications
      ]
    : notifications;

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl text-foreground">Notifications</h1>
            {onClose && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center text-foreground hover:border-[var(--lavender)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
            )}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-[var(--lavender)] ml-auto"
              >
                Mark all read
              </button>
            )}
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {allNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No notifications</p>
            </div>
          ) : (
            allNotifications.map((notification, idx) => {
              const Icon = getNotificationIcon(notification.type);
              const isDailyCheckIn = notification.id === 'daily-checkin';
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  onClick={() => !notification.isRead && !isDailyCheckIn && markAsRead(notification.id)}
                  className={`bg-card rounded-2xl p-4 shadow-md ${!isDailyCheckIn ? 'cursor-pointer' : ''} transition-all ${
                    !notification.isRead ? 'border-2 border-[var(--lavender)]/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`text-foreground ${!notification.isRead ? 'font-medium' : ''}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <div className="mt-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-[var(--lavender)]" />
                        </div>
                      )}
                    </div>
                    {!isDailyCheckIn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="w-6 h-6 rounded-full hover:bg-[var(--muted)] flex items-center justify-center flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}
