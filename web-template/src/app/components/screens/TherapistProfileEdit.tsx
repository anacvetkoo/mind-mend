import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { X, Camera, User, Save } from 'lucide-react';
import type { TherapistProfileData } from './TherapistProfileSetup';

interface TherapistProfileEditProps {
  onClose: () => void;
  initialData: TherapistProfileData;
  onSave: (data: TherapistProfileData) => void;
}

const SPECIALIZATIONS = [
  'Anxiety',
  'Depression',
  'Trauma & PTSD',
  'Relationship Issues',
  'Stress Management',
  'Grief & Loss',
  'Self-Esteem',
  'Life Transitions',
  'Addiction',
  'Eating Disorders',
  'Anger Management',
  'Family Conflict'
];

const FIELDS_OF_WORK = [
  'Clinical Psychology',
  'Counseling Psychology',
  'Marriage & Family Therapy',
  'Social Work',
  'Psychiatric Nursing',
  'Life Coaching',
  'Art Therapy',
  'Cognitive Behavioral Therapy',
  'Psychotherapy',
  'Other'
];

export function TherapistProfileEdit({ onClose, initialData, onSave }: TherapistProfileEditProps) {
  const [profileData, setProfileData] = useState<TherapistProfileData>(initialData);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(profileData);
  };

  const toggleSpecialization = (spec: string) => {
    const current = profileData.specializations;
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec];
    setProfileData({ ...profileData, specializations: updated });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onClose}
            type="button"
            className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center text-foreground hover:border-[var(--lavender)] transition-colors touch-manipulation pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center -ml-10 pointer-events-none">
            <h1 className="text-xl text-foreground">Edit Profile</h1>
          </div>
        </div>

        {/* Profile Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center overflow-hidden">
              {profileData.profileImage ? (
                <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-white" />
              )}
            </div>
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] flex items-center justify-center cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
            >
              <Camera className="w-5 h-5 text-white" />
            </label>
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-muted-foreground">Click camera to change photo</p>
        </motion.div>

        {/* Form Fields */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Name */}
          <Card>
            <label className="block mb-2 text-sm text-muted-foreground">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full p-3 rounded-xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all text-foreground"
            />
          </Card>

          {/* Title */}
          <Card>
            <label className="block mb-2 text-sm text-muted-foreground">Professional Title</label>
            <input
              type="text"
              value={profileData.title}
              onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
              className="w-full p-3 rounded-xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all text-foreground"
            />
          </Card>

          {/* Field of Work */}
          <Card>
            <label className="block mb-2 text-sm text-muted-foreground">Field of Work</label>
            <select
              value={profileData.fieldOfWork}
              onChange={(e) => setProfileData({ ...profileData, fieldOfWork: e.target.value })}
              className="w-full p-3 rounded-xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all text-foreground"
            >
              <option value="">Select field</option>
              {FIELDS_OF_WORK.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
          </Card>

          {/* Specializations */}
          <Card>
            <label className="block mb-3 text-sm text-muted-foreground">Specializations</label>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALIZATIONS.map((spec) => {
                const isSelected = profileData.specializations.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`p-2 rounded-xl border-2 transition-all text-xs ${
                      isSelected
                        ? 'bg-gradient-to-r from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 border-[var(--lavender)]'
                        : 'bg-[var(--muted)] border-transparent'
                    }`}
                  >
                    <span className="text-foreground">{spec}</span>
                  </button>
                );
              })}
            </div>
            {profileData.specializations.length > 0 && (
              <p className="text-xs text-[var(--lavender)] mt-2">
                {profileData.specializations.length} selected
              </p>
            )}
          </Card>

          {/* Years of Experience */}
          <Card>
            <label className="block mb-2 text-sm text-muted-foreground">Years of Experience</label>
            <input
              type="text"
              value={profileData.yearsOfExperience}
              onChange={(e) => setProfileData({ ...profileData, yearsOfExperience: e.target.value })}
              className="w-full p-3 rounded-xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all text-foreground"
            />
          </Card>

          {/* Education */}
          <Card>
            <label className="block mb-2 text-sm text-muted-foreground">Education</label>
            <textarea
              value={profileData.education}
              onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
              className="w-full p-3 rounded-xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all resize-none text-foreground"
              rows={4}
            />
          </Card>

          {/* License Number */}
          <Card>
            <label className="block mb-2 text-sm text-muted-foreground">License Number</label>
            <input
              type="text"
              value={profileData.licenseNumber}
              onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
              className="w-full p-3 rounded-xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all text-foreground"
            />
          </Card>

          {/* Bio */}
          <Card>
            <label className="block mb-2 text-sm text-muted-foreground">About You</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              className="w-full p-3 rounded-xl bg-[var(--muted)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all resize-none text-foreground"
              rows={6}
              placeholder="Share your approach, values, and what makes you unique..."
            />
          </Card>

          {/* Save Button */}
          <Button
            variant="primary"
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white flex items-center justify-center gap-2 shadow-lg"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
