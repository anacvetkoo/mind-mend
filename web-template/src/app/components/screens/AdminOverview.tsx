import React from 'react';
import { motion } from 'motion/react';
import { Users, Briefcase, FileText, Activity } from 'lucide-react';

export function AdminOverview() {
  const stats = [
    { label: 'Total Users', value: '2,453', icon: Users, color: 'var(--lavender)' },
    { label: 'Total Therapists', value: '127', icon: Briefcase, color: 'var(--soft-mint)' },
    { label: 'Total Content', value: '856', icon: FileText, color: 'var(--muted-blue)' },
    { label: 'Active Sessions', value: '48', icon: Activity, color: 'var(--soft-pink)' }
  ];

  const recentActivity = [
    { action: 'New user registered', user: 'alex@email.com', time: '5 min ago' },
    { action: 'Content published', user: 'Dr. Sarah Mitchell', time: '12 min ago' },
    { action: 'Therapist approved', user: 'Dr. Michael Chen', time: '1 hour ago' }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
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

        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-md mb-6"
        >
          <h3 className="text-lg mb-4 text-foreground">Daily Active Users</h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {[65, 80, 70, 90, 85, 95, 88].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.3 + 0.1 * idx }}
                  className="w-full bg-gradient-to-t from-[var(--lavender)] to-[var(--soft-purple)] rounded-t-lg"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl mb-4 text-foreground">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="bg-card rounded-2xl p-4 shadow-md">
                <p className="text-foreground mb-1">{activity.action}</p>
                <p className="text-sm text-muted-foreground mb-1">{activity.user}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
