import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Star, User } from 'lucide-react';
import { getTherapists, type TherapistProfileData } from '../../services/users';

// ─── Module-level cache — fetchamo samo enkrat na sejo ────────────────────────
let therapistsCache: TherapistProfileData[] | null = null;
let isFetching = false;
const fetchListeners: Array<(data: TherapistProfileData[]) => void> = [];

interface TherapistListProps {
  onSelectTherapist: (therapistId: string) => void;
}

export function TherapistList({ onSelectTherapist }: TherapistListProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [therapists, setTherapists] = useState<TherapistProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'depression', label: 'Depression' },
    { id: 'trauma', label: 'Trauma & PTSD' },
    { id: 'relationship', label: 'Relationships' },
    { id: 'stress', label: 'Stress' },
    { id: 'grief', label: 'Grief & Loss' },
    { id: 'self-esteem', label: 'Self-Esteem' },
    { id: 'life', label: 'Life Transitions' },
    { id: 'addiction', label: 'Addiction' },
    { id: 'eating', label: 'Eating Disorders' },
    { id: 'anger', label: 'Anger Management' },
    { id: 'family', label: 'Family Conflict' },
  ];

  useEffect(() => {
    // Če imamo cache — takoj prikažemo, brez loading
    if (therapistsCache) {
      setTherapists(therapistsCache);
      setIsLoading(false);
      return;
    }

    // Če fetch že teče — počakamo na rezultat
    if (isFetching) {
      fetchListeners.push((data) => {
        setTherapists(data);
        setIsLoading(false);
      });
      return;
    }

    // Sicer začnemo fetch
    isFetching = true;
    getTherapists()
      .then((data) => {
        therapistsCache = data;
        isFetching = false;
        setTherapists(data);
        setIsLoading(false);
        fetchListeners.forEach(fn => fn(data));
        fetchListeners.length = 0;
      })
      .catch((error) => {
        console.error('Error fetching therapists:', error);
        isFetching = false;
        setIsLoading(false);
      });
  }, []);

  const filteredTherapists = therapists.filter((therapist) => {
    const matchesSearch =
      searchQuery === '' ||
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      selectedFilter === 'all' ||
      therapist.specialization.toLowerCase().includes(selectedFilter) ||
      therapist.tags.some(t => t.toLowerCase().includes(selectedFilter));

    return matchesSearch && matchesFilter;
  });

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-[var(--lavender)] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredTherapists.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground mb-1">No therapists found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Check back soon'}
            </p>
          </motion.div>
        )}

        {/* Therapist Cards */}
        {!isLoading && filteredTherapists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredTherapists.map((therapist, idx) => (
              <motion.div
                key={therapist.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  {therapist.avatar ? (
                    <img
                      src={therapist.avatar}
                      alt={therapist.name}
                      className="w-20 h-20 rounded-full object-cover shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center shadow-md flex-shrink-0">
                      <User className="w-10 h-10 text-[var(--lavender)]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-foreground truncate">{therapist.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {therapist.specialization || therapist.title || 'Licensed Therapist'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 ${
                        therapist.isAvailable
                          ? 'bg-[var(--soft-mint)]/20 text-[var(--soft-mint)]'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-400'
                      }`}>
                        {therapist.isAvailable ? 'Available' : 'Not available'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {therapist.reviews > 0 ? (
                        <>
                          <span className="text-sm text-foreground">{therapist.rating}</span>
                          <span className="text-xs text-muted-foreground">({therapist.reviews} reviews)</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">New</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {therapist.tags.length > 0 ? (
                        therapist.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-[var(--soft-purple)]/10 text-[var(--lavender)] text-xs">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--soft-purple)]/10 text-[var(--lavender)] text-xs">
                          {therapist.specialization || 'Therapy'}
                        </span>
                      )}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectTherapist(therapist.id)}
                      className="w-full py-2 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm shadow-sm"
                    >
                      View Profile
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}