import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, Star, MapPin, Calendar, MessageCircle, Video } from 'lucide-react';

export function TherapistSection() {
  const [searchQuery, setSearchQuery] = useState('');

  const therapists = [
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      specialization: 'Anxiety & Stress Management',
      rating: 4.9,
      reviews: 127,
      location: 'Remote',
      image: '👩‍⚕️',
      available: true,
      tags: ['CBT', 'Mindfulness', 'Trauma']
    },
    {
      id: 2,
      name: 'Dr. James Chen',
      specialization: 'Depression & Mood Disorders',
      rating: 4.8,
      reviews: 98,
      location: 'Remote',
      image: '👨‍⚕️',
      available: true,
      tags: ['ACT', 'DBT', 'Family Therapy']
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialization: 'Relationships & Self-Esteem',
      rating: 5.0,
      reviews: 156,
      location: 'Remote',
      image: '👩‍⚕️',
      available: false,
      tags: ['Couples', 'LGBTQ+', 'Grief']
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl text-foreground">Find a Therapist</h1>
          <p className="text-muted-foreground mt-1">
            Connect with licensed professionals
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Available Now', 'Highly Rated', 'CBT', 'DBT', 'Trauma'].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all ${
                  filter === 'All'
                    ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-lg'
                    : 'bg-card text-foreground shadow-md hover:shadow-lg'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card variant="glass">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--soft-mint)] to-[var(--muted-blue)] flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-1">Video Sessions Available</h4>
                <p className="text-sm text-muted-foreground">
                  All therapists offer secure, HIPAA-compliant video sessions from the comfort of your home.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Therapist Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {therapists.map((therapist, idx) => (
            <motion.div
              key={therapist.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <Card className="hover:shadow-2xl transition-shadow">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center text-3xl">
                    {therapist.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="mb-1">{therapist.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {therapist.specialization}
                        </p>
                      </div>
                      {therapist.available && (
                        <Badge variant="success">Available</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[var(--soft-mint)] fill-current" />
                        <span>{therapist.rating}</span>
                        <span>({therapist.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{therapist.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {therapist.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 bg-[var(--muted)] rounded-full text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card variant="gradient" className="text-center text-white">
            <h3 className="text-xl mb-2">Need help choosing?</h3>
            <p className="text-sm text-white/90 mb-4">
              Take our 2-minute quiz to get matched with the right therapist for you
            </p>
            <Button variant="secondary">Take Matching Quiz</Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
