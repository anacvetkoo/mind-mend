import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Award, Users, Calendar, MessageCircle, Phone, Video } from 'lucide-react';
import { getTherapistById, type TherapistProfileData, type TherapistContentPreview } from '../../services/users';

interface TherapistProfileProps {
  therapistId: string | number;
  onClose: () => void;
  onMessage: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onBookAppointment?: () => void;
  onSelectContent?: (content: TherapistContentPreview) => void;
}

const defaultTherapist: TherapistProfileData = {
  id: '',
  name: 'Therapist',
  avatar: '',
  title: 'Mental health professional',
  specialization: '',
  rating: 5,
  reviews: 0,
  bio: 'This therapist creates supportive mental health and wellness content.',
  tags: [],
  yearsExperience: 0,
  sessionsCompleted: 0,
  content: []
};

export function TherapistProfile({
  therapistId,
  onClose,
  onMessage,
  onVoiceCall,
  onVideoCall,
  onBookAppointment,
  onSelectContent
}: TherapistProfileProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [therapist, setTherapist] = useState<TherapistProfileData>(defaultTherapist);

  useEffect(() => {
    let isMounted = true;

    const fetchTherapist = async () => {
      const therapistData = await getTherapistById(String(therapistId));

      if (isMounted && therapistData) {
        setTherapist(therapistData);
      }
    };

    fetchTherapist();

    return () => {
      isMounted = false;
    };
  }, [therapistId]);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-[390px] mx-auto min-h-screen pb-24">
        <div className="relative h-[280px] bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex flex-col items-center justify-center px-6 pt-12">
          <button
            onClick={onClose}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {therapist.avatar ? (
            <img
              src={therapist.avatar}
              alt={therapist.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/50 shadow-2xl mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/30 border-4 border-white/50 shadow-2xl mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-white" />
            </div>
          )}

          <h1 className="text-2xl text-white mb-1">{therapist.name}</h1>
          <p className="text-white/90 text-sm mb-2">{therapist.title}</p>

          <div className="flex items-center gap-2">
  {therapist.reviews > 0 ? (
    <>
      <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
      <span className="text-white text-sm">{therapist.rating}</span>
      <span className="text-white/80 text-xs">
        ({therapist.reviews} reviews)
      </span>
    </>
  ) : (
    <span className="text-white/80 text-xs">
      0 reviews
    </span>
  )}
</div>
        </div>

        <div className="px-4 mt-4 relative z-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-lg mb-4"
          >
            <h3 className="text-lg mb-3 text-foreground">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{therapist.bio}</p>

            <div className="flex flex-wrap gap-2">
              {therapist.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[var(--soft-purple)]/10 text-[var(--lavender)] text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

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

            {/* Messaging and call buttons removed as requested */}
          </motion.div>
<br/>

{therapist.content.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="mb-4"
  >
    <h3 className="text-lg mb-3 text-foreground">Their Content</h3>

    <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
      {therapist.content.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectContent?.(item)}
          className="flex-shrink-0 w-[160px] bg-card rounded-2xl p-4 shadow-md text-left"
        >
          <div className="w-full h-20 bg-gradient-to-br from-[var(--soft-purple)]/20 to-[var(--soft-mint)]/20 rounded-xl mb-3 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-[var(--lavender)]" />
          </div>

          <h4 className="text-sm mb-1 text-foreground line-clamp-1">
            {item.title}
          </h4>

          <p className="text-xs text-muted-foreground">
            {item.duration || item.category || 'Content'}
          </p>
        </button>
      ))}
    </div>
  </motion.div>
)}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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