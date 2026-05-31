import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import type { BlockedTime } from '../../types/appointments';

interface BlockedTimeManagementProps {
  therapistId: string;
  onClose: () => void;
}

const BLOCKED_TIMES_CACHE_KEY = 'therapistBlockedTimes';

export function BlockedTimeManagement({ therapistId, onClose }: BlockedTimeManagementProps) {
  // Takoj naloži iz localStorage da ni bliskanja prazne liste
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>(() => {
    const cached = localStorage.getItem(BLOCKED_TIMES_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    reason: '',
    isFullDay: true
  });

  useEffect(() => {
    const loadBlockedTimes = async () => {
      const { auth } = await import('../../services/firebaseConfig');
      const currentUser = auth.currentUser;
      if (currentUser) {
        const { getBlockedTimes } = await import('../../services/users');
        const times = await getBlockedTimes(currentUser.uid);
        setBlockedTimes(times);
        localStorage.setItem(BLOCKED_TIMES_CACHE_KEY, JSON.stringify(times));
      }
    };
    loadBlockedTimes();
  }, []);

  const saveToFirestore = async (times: BlockedTime[]) => {
    const { auth } = await import('../../services/firebaseConfig');
    const currentUser = auth.currentUser;
    if (currentUser) {
      const { updateBlockedTimes } = await import('../../services/users');
      await updateBlockedTimes(currentUser.uid, times);
      localStorage.setItem(BLOCKED_TIMES_CACHE_KEY, JSON.stringify(times));
    }
  };

  const handleAddBlockedTime = () => {
    const newBlocked: BlockedTime = {
      id: `blocked-${Date.now()}`,
      therapistId,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      startTime: formData.isFullDay ? '' : formData.startTime,
      endTime: formData.isFullDay ? '' : formData.endTime,
      reason: formData.reason,
      isFullDay: formData.isFullDay
    };

    const newTimes = [...blockedTimes, newBlocked];
    setBlockedTimes(newTimes);
    saveToFirestore(newTimes);
    setShowAddForm(false);
    setFormData({
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '17:00',
      reason: '',
      isFullDay: true
    });
  };

  const handleDelete = (id: string) => {
    const newTimes = blockedTimes.filter(bt => bt.id !== id);
    setBlockedTimes(newTimes);
    saveToFirestore(newTimes);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-md mx-auto min-h-screen pb-24">
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--border)] px-4 py-4 flex items-center z-10">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center mr-3 shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl text-foreground flex-1 min-w-0 truncate">Blocked Time & Time Off</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center shrink-0 ml-2"
          >
            <Plus className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        <div className="px-4 pt-6">
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-4 shadow-md mb-6"
            >
              <h3 className="text-lg text-foreground mb-4">Add Blocked Time</h3>

              {/* Full Day toggle */}
              <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-[var(--muted)]">
                <span className="text-sm text-foreground">Full Day</span>
                <button
                  onClick={() => setFormData({ ...formData, isFullDay: !formData.isFullDay })}
                  className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                    formData.isFullDay ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]' : 'bg-[var(--muted)]'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                    formData.isFullDay ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Start Date / End Date */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="min-w-0">
                  <label className="block text-sm text-foreground mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground text-sm appearance-none"
                    style={{ WebkitAppearance: 'none' }}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-sm text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground text-sm appearance-none"
                    style={{ WebkitAppearance: 'none' }}
                  />
                </div>
              </div>

              {/* Start Time / End Time — only shown when not full day */}
              {!formData.isFullDay && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="min-w-0">
                    <label className="block text-sm text-foreground mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground text-sm appearance-none"
                      style={{ WebkitAppearance: 'none' }}
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm text-foreground mb-2">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground text-sm appearance-none"
                      style={{ WebkitAppearance: 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-sm text-foreground mb-2">Reason</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Vacation, Conference, Personal"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 rounded-xl bg-card border-2 border-[var(--border)] text-foreground"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddBlockedTime}
                  disabled={!formData.startDate || !formData.reason}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-50"
                >
                  Add
                </motion.button>
              </div>
            </motion.div>
          )}

          {blockedTimes.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No blocked time entries</p>
              <p className="text-sm text-muted-foreground mt-1">Add time off when you're unavailable</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedTimes.map((blocked, idx) => (
                <motion.div
                  key={blocked.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="bg-card rounded-2xl p-4 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground mb-1 truncate">{blocked.reason}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {formatDate(blocked.startDate)}
                          {blocked.endDate !== blocked.startDate && ` – ${formatDate(blocked.endDate)}`}
                        </span>
                      </div>
                      {!blocked.isFullDay && blocked.startTime && blocked.endTime && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{blocked.startTime} – {blocked.endTime}</span>
                        </div>
                      )}
                      {blocked.isFullDay && (
                        <div className="mt-2">
                          <span className="px-2 py-1 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)] text-xs">
                            Full Day
                          </span>
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(blocked.id)}
                      className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}