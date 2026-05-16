import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Award, Users, Calendar, MessageCircle, Phone, Video } from 'lucide-react';

interface TherapistProfileProps {
  therapistId: number;
  onClose: () => void;
  onMessage: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onBookAppointment?: () => void;
}

export function TherapistProfile({ therapistId, onClose, onMessage, onVoiceCall, onVideoCall, onBookAppointment }: TherapistProfileProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const therapist = {
    name: 'Dr. Sarah Mitchell',
    avatar: 'https://images.unsplash.com/photo-1594744803145-a7bf00e71852?w=200&h=200&fit=crop',
    title: 'Licensed Clinical Psychologist',
    specialization: 'Anxiety & Stress Management',
    rating: 4.9,
    reviews: 342,
    bio: 'Dr. Mitchell specializes in evidence-based treatments for anxiety disorders, stress management, and trauma recovery. With over 10 years of clinical experience, she combines CBT, EMDR, and mindfulness techniques to help clients achieve lasting change.',
    tags: ['CBT', 'Mindfulness', 'EMDR', 'Stress Management'],
    yearsExperience: 10,
    sessionsCompleted: 1250,
    content: [
      { id: 1, title: 'Progressive Muscle Relaxation', category: 'Relaxation', duration: '12 min' },
      { id: 2, title: '4-7-8 Breathing', category: 'Breathing', duration: '10 min' }
    ]
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-[390px] mx-auto min-h-screen pb-24">
        {/* Gradient Header */}
        <div className="relative h-[280px] bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex flex-col items-center justify-center px-6 pt-12">
          <button
            onClick={onClose}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <img
            src={therapist.avatar}
            alt={therapist.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white/50 shadow-2xl mb-4"
          />
          <h1 className="text-2xl text-white mb-1">{therapist.name}</h1>
          <p className="text-white/90 text-sm mb-2">{therapist.title}</p>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-white text-sm">{therapist.rating}</span>
            <span className="text-white/80 text-xs">({therapist.reviews} reviews)</span>
          </div>
        </div>

        <div className="px-4 mt-4 relative z-0">
          {/* Bio Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-lg mb-4"
          >
            <h3 className="text-lg mb-3 text-foreground">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{therapist.bio}</p>
            <div className="flex flex-wrap gap-2">
              {therapist.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-[var(--soft-purple)]/10 text-[var(--lavender)] text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-4"
          >
            <div className="bg-card rounded-2xl p-4 shadow-md text-center">
              <Award className="w-5 h-5 text-[var(--lavender)] mx-auto mb-2" />
              <p className="text-2xl text-foreground mb-1">{therapist.yearsExperience}</p>
              <p className="text-xs text-muted-foreground">Years</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-md text-center">
              <Users className="w-5 h-5 text-[var(--lavender)] mx-auto mb-2" />
              <p className="text-2xl text-foreground mb-1">{therapist.sessionsCompleted}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-md text-center">
              <Star className="w-5 h-5 text-[var(--lavender)] mx-auto mb-2" />
              <p className="text-2xl text-foreground mb-1">{therapist.rating}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </motion.div>

          {/* Their Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <h3 className="text-lg mb-3 text-foreground">Their Content</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {therapist.content.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-[160px] bg-card rounded-2xl p-4 shadow-md">
                  <div className="w-full h-20 bg-gradient-to-br from-[var(--soft-purple)]/20 to-[var(--soft-mint)]/20 rounded-xl mb-3 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-[var(--lavender)]" />
                  </div>
                  <h4 className="text-sm mb-1 text-foreground line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.duration}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {onBookAppointment && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onBookAppointment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onMessage}
              className="w-full py-4 rounded-2xl border-2 border-[var(--lavender)] text-[var(--lavender)] flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Send Message</span>
            </motion.button>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onVoiceCall}
                className="py-3 rounded-2xl border-2 border-[var(--lavender)] text-[var(--lavender)] flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Voice Call</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onVideoCall}
                className="py-3 rounded-2xl border-2 border-[var(--lavender)] text-[var(--lavender)] flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Video Call</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Rating Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 mb-4"
          >
            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg mb-3 text-foreground text-center">Rate this Therapist</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Share your experience to help others
              </p>

              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setUserRating(star);
                      setHasRated(true);
                    }}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || userRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>

              {hasRated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-sm text-[var(--lavender)] mb-3">
                    Thank you for rating {userRating} star{userRating !== 1 ? 's' : ''}!
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white text-sm"
                  >
                    Submit Rating
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}