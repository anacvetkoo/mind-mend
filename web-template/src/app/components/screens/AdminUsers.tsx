import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Users, Activity } from 'lucide-react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Card } from '../ui/Card';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  status: 'active' | 'suspended';
}

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  const users: User[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      avatar: '🧑‍💼',
      joinDate: 'Mar 15, 2026',
      status: 'active'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'mchen@email.com',
      avatar: '👨‍💻',
      joinDate: 'Feb 8, 2026',
      status: 'active'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      email: 'emma.r@email.com',
      avatar: '👩‍🔬',
      joinDate: 'Apr 22, 2026',
      status: 'suspended'
    },
    {
      id: 4,
      name: 'James Wilson',
      email: 'jwilson@email.com',
      avatar: '👨‍🎨',
      joinDate: 'Jan 10, 2026',
      status: 'active'
    },
    {
      id: 5,
      name: 'Olivia Taylor',
      email: 'olivia.t@email.com',
      avatar: '👩‍🏫',
      joinDate: 'May 5, 2026',
      status: 'active'
    },
    {
      id: 6,
      name: 'David Martinez',
      email: 'dmartinez@email.com',
      avatar: '👨‍⚕️',
      joinDate: 'Dec 18, 2025',
      status: 'active'
    }
  ];

  const filteredUsers = searchQuery
    ? users.filter(
        user =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const totalUsers = users.length;
  const activeToday = users.filter(u => u.status === 'active').length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl text-foreground mb-1">Users</h1>
          <p className="text-muted-foreground">Manage platform users</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all shadow-md"
            />
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl text-foreground">{totalUsers}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--soft-mint)] to-[var(--muted-blue)] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl text-foreground">{activeToday}</div>
              <div className="text-xs text-muted-foreground">Active Today</div>
            </div>
          </Card>
        </motion.div>

        {/* User List */}
        {filteredUsers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            {filteredUsers.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
              >
                <Card
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center text-2xl flex-shrink-0">
                      {user.avatar}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-foreground truncate">{user.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Joined {user.joinDate}</p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </div>

                  {/* Expanded Actions */}
                  <AnimatePresence>
                    {expandedUserId === user.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-[var(--border)] flex gap-3">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle suspend action
                            }}
                            className="flex-1 px-4 py-2 rounded-xl border-2 border-red-400 text-red-400 text-sm"
                          >
                            {user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle view details action
                            }}
                            className="flex-1 px-4 py-2 rounded-xl border-2 border-[var(--lavender)] text-[var(--lavender)] text-sm"
                          >
                            View Details
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
          >
            <OtterMascot size="lg" emotion="sad" />
            <h3 className="text-xl text-foreground mt-6 mb-2">No users found</h3>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
