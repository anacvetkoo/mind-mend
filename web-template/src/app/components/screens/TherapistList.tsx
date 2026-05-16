import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Star } from 'lucide-react';

interface TherapistListProps {
  onSelectTherapist: (therapistId: number) => void;
}

export function TherapistList({ onSelectTherapist }: TherapistListProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'depression', label: 'Depression' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'burnout', label: 'Burnout' }
  ];

  const therapists = [
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      avatar: 'https://images.unsplash.com/photo-1594744803145-a7bf00e71852?w=100&h=100&fit=crop',
      specialization: 'Anxiety & Stress Management',
      rating: 4.9,
      reviews: 342,
      available: true,
      tags: ['CBT', 'Mindfulness', 'EMDR']
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1594743794994-8f1e30bfa1d5?w=100&h=100&fit=crop',
      specialization: 'Depression & Burnout',
      rating: 4.8,
      reviews: 289,
      available: false,
      tags: ['CBT', 'ACT', 'Psychotherapy']
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1621255612554-440c5e7b21b3?w=100&h=100&fit=crop',
      specialization: 'Relationships & Family',
      rating: 5.0,
      reviews: 421,
      available: true,
      tags: ['Couples Therapy', 'Family Therapy']
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl text-foreground">Find a Therapist</h1>
          <p className="text-muted-foreground mt-1">Connect with licensed professionals</p>
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
              placeholder="Search by name or specialization..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all shadow-md"
            />
          </div>
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap transition-all text-sm ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-lg'
                    : 'border-2 border-[var(--border)] text-foreground bg-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Therapist Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {therapists.map((therapist, idx) => (
            <motion.div
              key={therapist.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all"
            >
              <div className="flex gap-4">
                <img
                  src={therapist.avatar}
                  alt={therapist.name}
                  className="w-20 h-20 rounded-full object-cover shadow-md"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-foreground mb-1">{therapist.name}</h3>
                      <p className="text-sm text-muted-foreground">{therapist.specialization}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        therapist.available
                          ? 'bg-[var(--soft-mint)]/20 text-[var(--soft-mint)]'
                          : 'bg-[var(--muted)] text-muted-foreground'
                      }`}
                    >
                      {therapist.available ? 'Available Now' : 'Busy'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">{therapist.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({therapist.reviews} reviews)</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {therapist.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-full bg-[var(--soft-purple)]/10 text-[var(--lavender)] text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectTherapist(therapist.id)}
                      className="flex-1 py-2 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm shadow-sm"
                    >
                      View Profile
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2 rounded-2xl border-2 border-[var(--lavender)] text-[var(--lavender)] text-sm"
                    >
                      Message
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
