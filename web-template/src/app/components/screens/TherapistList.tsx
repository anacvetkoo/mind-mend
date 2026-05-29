import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Star, User, Calendar } from 'lucide-react';
import { getTherapists, type TherapistProfileData } from '../../services/users';

interface TherapistListProps {
  onSelectTherapist: (therapistId: string) => void;
  onBookTherapist: (therapistId: string, therapistName: string) => void;
}

export function TherapistList({ onSelectTherapist, onBookTherapist }: TherapistListProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [therapists, setTherapists] = useState<TherapistProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoAvailabilityModal, setShowNoAvailabilityModal] = useState(false);
  const [selectedUnavailableTherapist, setSelectedUnavailableTherapist] = useState<TherapistProfileData | null>(null);

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

  // 🔥 POPRAVLJENO: Čist useEffect, ki ob vsakem odpiranju strani potegne sveže podatke
  useEffect(() => {
    setIsLoading(true);
    getTherapists()
      .then((data) => {
        setTherapists(data || []);
      })
      .catch((error) => {
        console.error('Error fetching therapists:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // Prazen nabor pomeni, da se sproži ob vsakem "montiranju" komponente

  // Izris zvezdic glede na zaokrožen rating
  const renderStars = (rating: number, reviews: number) => {
    const hasReviews = typeof reviews === 'number' && reviews > 0;
    const roundedRating = hasReviews ? Math.round(rating || 0) : 0;

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= roundedRating;
          return (
            <Star
              key={star}
              className={`w-4 h-4 transition-colors ${
                isFilled 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          );
        })}
      </div>
    );
  };

  const filteredTherapists = React.useMemo(() => {
    const q = searchQuery.toLowerCase();

    const normalize = (s: string) => s.toLowerCase().replace(/[-\s]/g, '');
    const normalizedFilter = normalize(selectedFilter);

    const matchesFilter = (therapist: TherapistProfileData) =>
      selectedFilter === 'all' ||
      normalize(therapist.specialization).includes(normalizedFilter) ||
      therapist.tags.some(t => normalize(t).includes(normalizedFilter));

    if (q === '') {
      return therapists.filter(matchesFilter);
    }

    const scored = therapists
      .filter(matchesFilter)
      .map(therapist => {
        let score = 99;
        if (therapist.name.toLowerCase().includes(q)) score = 0;
        else if (therapist.title.toLowerCase().includes(q)) score = 1;
        else if (therapist.specialization.toLowerCase().includes(q)) score = 2;
        else if (therapist.tags.some(t => t.toLowerCase().includes(q))) score = 3;
        else if (therapist.bio.toLowerCase().includes(q)) score = 4;
        else return null;
        return { therapist, score };
      })
      .filter(Boolean) as { therapist: TherapistProfileData; score: number }[];

    return scored
      .sort((a, b) => a.score - b.score)
      .map(s => s.therapist);
  }, [therapists, searchQuery, selectedFilter]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl text-foreground">Find a Therapist</h1>
          <p className="text-muted-foreground mt-1">Connect with licensed professionals</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground mb-1">No therapists found</p>
            <p className="text-sm text-muted-foreground">{searchQuery ? 'Try a different search term' : 'Check back soon'}</p>
          </motion.div>
        )}

        {/* Therapist Cards */}
        {!isLoading && filteredTherapists.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
            {filteredTherapists.map((therapist, idx) => (
              <motion.div
                key={therapist.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex gap-4">
                  {therapist.avatar ? (
                    <img src={therapist.avatar} alt={therapist.name} className="w-20 h-20 rounded-full object-cover shadow-md flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center shadow-md flex-shrink-0">
                      <User className="w-10 h-10 text-[var(--lavender)]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-foreground truncate">{therapist.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{therapist.specialization || therapist.title || 'Licensed Therapist'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 ${
                        therapist.isAvailable ? 'bg-[var(--soft-mint)]/20 text-[var(--soft-mint)]' : 'bg-red-100 dark:bg-red-900/20 text-red-400'
                      }`}>
                        {therapist.isAvailable ? 'Available' : 'Not available'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-2 text-sm text-muted-foreground">
                      {renderStars(therapist.rating, therapist.reviews)}
                      {therapist.reviews > 0 ? (
                        <span className="text-xs">({therapist.reviews} reviews)</span>
                      ) : (
                        <span className="text-xs italic text-muted-foreground/70">No reviews yet</span>
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

                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectTherapist(therapist.id)}
                        className="py-2 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm shadow-sm"
                      >
                        View Profile
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (!therapist.isAvailable) {
                            setSelectedUnavailableTherapist(therapist);
                            setShowNoAvailabilityModal(true);
                            return;
                          }
                          onBookTherapist(therapist.id, therapist.name);
                        }}
                        className="py-2 rounded-2xl border-2 border-[var(--lavender)] text-[var(--lavender)] bg-card text-sm shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-4 h-4" />
                        Book
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {showNoAvailabilityModal && selectedUnavailableTherapist && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-8"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowNoAvailabilityModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-[var(--soft-purple)]/15 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[var(--lavender)]" />
            </div>
            <h3 className="text-xl text-foreground text-center mb-2">Not available yet</h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
              <span className="text-foreground">{selectedUnavailableTherapist.name}</span> hasn't set up their schedule yet. Check back soon or explore other therapists.
            </p>
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowNoAvailabilityModal(false)} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white">
              Got it
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}