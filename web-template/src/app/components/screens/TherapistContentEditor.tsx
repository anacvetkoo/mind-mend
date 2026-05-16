import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Upload, Plus } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface ContentItem {
  id?: number;
  title: string;
  category: string;
  duration: string;
  gradient: string;
  description?: string;
  isDraft?: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  thumbnailType?: 'color' | 'image';
  thumbnailImage?: string | null;
  contentType?: 'video' | 'steps' | 'audio';
  steps?: Step[];
  audioFileName?: string;
  videoFileName?: string;
}

interface TherapistContentEditorProps {
  onClose: () => void;
  onSave: (content: ContentItem, isDraft: boolean) => void;
  existingContent?: ContentItem;
}

export function TherapistContentEditor({ onClose, onSave, existingContent }: TherapistContentEditorProps) {
  const [title, setTitle] = useState(existingContent?.title || '');
  const [category, setCategory] = useState(existingContent?.category || 'Relaxation');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(existingContent?.difficulty || 'Easy');
  const [duration, setDuration] = useState(existingContent?.duration || '');
  const [description, setDescription] = useState(existingContent?.description || '');
  const [selectedGradient, setSelectedGradient] = useState(existingContent?.gradient || 'from-[var(--muted-blue)] to-[var(--soft-purple)]');
  const [thumbnailType, setThumbnailType] = useState<'color' | 'image'>(existingContent?.thumbnailType || 'color');
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(existingContent?.thumbnailImage || null);
  const [contentType, setContentType] = useState<'video' | 'steps' | 'audio'>(
    existingContent?.contentType || (existingContent?.category === 'Sound Therapy' ? 'audio' : 'steps')
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<Step[]>(existingContent?.steps || [{ id: 1, title: '', description: '' }]);

  const categories = ['Relaxation', 'Breathing', 'Sound Therapy'];

  const gradientOptions = [
    { id: 1, gradient: 'from-[var(--muted-blue)] to-[var(--soft-purple)]', name: 'Ocean' },
    { id: 2, gradient: 'from-[var(--soft-mint)] to-[var(--muted-blue)]', name: 'Mint' },
    { id: 3, gradient: 'from-[var(--lavender)] to-[var(--soft-pink)]', name: 'Lavender' },
    { id: 4, gradient: 'from-[var(--soft-pink)] to-[var(--lavender)]', name: 'Rose' },
    { id: 5, gradient: 'from-[var(--soft-purple)] to-[var(--soft-mint)]', name: 'Dream' }
  ];

  const handleThumbnailImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Simulate duration calculation
      setDuration('15 min');
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      // Simulate duration calculation
      setDuration('12 min');
    }
  };

  const addStep = () => {
    const newStep: Step = {
      id: steps.length + 1,
      title: '',
      description: ''
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (id: number, field: 'title' | 'description', value: string) => {
    setSteps(steps.map(step =>
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const handleSave = (isDraft: boolean = false) => {
    if (!title) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isDraft && contentType === 'steps' && !duration) {
      alert('Please enter a duration for step-by-step content');
      return;
    }

    onSave({
      id: existingContent?.id,
      title,
      category,
      duration,
      gradient: selectedGradient,
      description,
      difficulty,
      thumbnailType,
      thumbnailImage,
      contentType,
      steps,
      audioFileName: audioFile?.name,
      videoFileName: videoFile?.name
    }, isDraft);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-md mx-auto min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--border)] px-6 py-4 flex items-center z-10">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center mr-4"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl text-foreground">
            {existingContent ? 'Edit Content' : 'Add New Content'}
          </h1>
        </div>

        <div className="px-6 pt-6">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm text-foreground mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Ocean Waves Meditation"
              className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--lavender)] outline-none transition-colors"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm text-foreground mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    if (cat === 'Sound Therapy') {
                      setContentType('audio');
                    } else {
                      setContentType('steps');
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    category === cat
                      ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                      : 'bg-card border-2 border-[var(--border)] text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block text-sm text-foreground mb-2">
              Difficulty <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 px-4 py-2 rounded-full text-sm transition-all ${
                    difficulty === level
                      ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                      : 'bg-card border-2 border-[var(--border)] text-foreground'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Content Based on Category */}
          {category === 'Sound Therapy' ? (
            <div className="mb-6">
              <label className="block text-sm text-foreground mb-2">
                Audio File <span className="text-red-400">*</span>
              </label>
              <label className="w-full px-4 py-8 rounded-xl bg-[var(--input-background)] border-2 border-dashed border-[var(--border)] text-center cursor-pointer hover:border-[var(--lavender)] transition-colors flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-foreground">
                  {audioFile ? audioFile.name : existingContent?.audioFileName || 'Upload Audio File'}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  MP3, WAV, or M4A
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </label>
              {(audioFile || existingContent?.audioFileName) && (
                <p className="text-xs text-[var(--lavender)] mt-2">
                  Duration: {duration} (auto-calculated)
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Content Type Selection for Relaxation/Breathing */}
              <div className="mb-6">
                <label className="block text-sm text-foreground mb-2">
                  Content Type <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setContentType('video')}
                    className={`flex-1 px-4 py-2 rounded-full text-sm transition-all ${
                      contentType === 'video'
                        ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                        : 'bg-card border-2 border-[var(--border)] text-foreground'
                    }`}
                  >
                    Upload Video
                  </button>
                  <button
                    onClick={() => setContentType('steps')}
                    className={`flex-1 px-4 py-2 rounded-full text-sm transition-all ${
                      contentType === 'steps'
                        ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                        : 'bg-card border-2 border-[var(--border)] text-foreground'
                    }`}
                  >
                    Add Steps
                  </button>
                </div>
              </div>

              {contentType === 'video' ? (
                <div className="mb-6">
                  <label className="block text-sm text-foreground mb-2">
                    Video File <span className="text-red-400">*</span>
                  </label>
                  <label className="w-full px-4 py-8 rounded-xl bg-[var(--input-background)] border-2 border-dashed border-[var(--border)] text-center cursor-pointer hover:border-[var(--lavender)] transition-colors flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-foreground">
                      {videoFile ? videoFile.name : existingContent?.videoFileName || 'Upload Video File'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      MP4, MOV, or AVI
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                  {(videoFile || existingContent?.videoFileName) && (
                    <p className="text-xs text-[var(--lavender)] mt-2">
                      Duration: {duration} (auto-calculated)
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm text-foreground mb-2">
                      Duration <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 15 min"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--lavender)] outline-none transition-colors"
                    />
                  </div>

                  {/* Steps Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm text-foreground">
                        Steps
                      </label>
                      <button
                        onClick={addStep}
                        className="flex items-center gap-1 text-[var(--lavender)] text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Step
                      </button>
                    </div>

                    <div className="space-y-4">
                      {steps.map((step, index) => (
                        <div
                          key={step.id}
                          className="bg-[var(--input-background)] rounded-2xl p-4 space-y-3"
                        >
                          <h4 className="text-sm text-muted-foreground">Step {index + 1}</h4>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                            placeholder="Step title"
                            className="w-full px-4 py-3 rounded-xl bg-card border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--lavender)] outline-none transition-colors"
                          />
                          <input
                            type="text"
                            value={step.description}
                            onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full px-4 py-3 rounded-xl bg-card border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--lavender)] outline-none transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm text-foreground mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this session includes..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[var(--input-background)] border-2 border-[var(--border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--lavender)] outline-none transition-colors resize-none"
            />
          </div>

          {/* Thumbnail */}
          <div className="mb-6">
            <label className="block text-sm text-foreground mb-2">
              Thumbnail <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setThumbnailType('color')}
                className={`flex-1 px-4 py-2 rounded-full text-sm transition-all ${
                  thumbnailType === 'color'
                    ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                    : 'bg-card border-2 border-[var(--border)] text-foreground'
                }`}
              >
                Select Color
              </button>
              <button
                onClick={() => setThumbnailType('image')}
                className={`flex-1 px-4 py-2 rounded-full text-sm transition-all ${
                  thumbnailType === 'image'
                    ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white'
                    : 'bg-card border-2 border-[var(--border)] text-foreground'
                }`}
              >
                Upload Image
              </button>
            </div>

            {thumbnailType === 'color' ? (
              <div className="grid grid-cols-5 gap-3">
                {gradientOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedGradient(option.gradient)}
                    className={`aspect-square rounded-xl bg-gradient-to-br ${option.gradient} transition-all ${
                      selectedGradient === option.gradient
                        ? 'ring-4 ring-[var(--lavender)] scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <label className="w-full px-4 py-8 rounded-xl bg-[var(--input-background)] border-2 border-dashed border-[var(--border)] text-center cursor-pointer hover:border-[var(--lavender)] transition-colors flex flex-col items-center justify-center">
                {thumbnailImage ? (
                  <img src={thumbnailImage} alt="Thumbnail" className="w-24 h-24 rounded-xl object-cover" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-foreground">Upload Thumbnail Image</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, or WebP
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Preview */}
          <div className="mb-6">
            <label className="block text-sm text-foreground mb-2">Preview</label>
            <div className="bg-card rounded-2xl shadow-md overflow-hidden p-4">
              <div className="flex gap-4">
                {thumbnailType === 'image' && thumbnailImage ? (
                  <img
                    src={thumbnailImage}
                    alt="Thumbnail"
                    className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${selectedGradient} flex-shrink-0`} />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground mb-1 truncate">
                    {title || 'Session Title'}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)] text-xs">
                      {category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--soft-mint)]/10 text-[var(--soft-mint)] text-xs">
                      {difficulty}
                    </span>
                    {duration && (
                      <span className="text-xs text-muted-foreground">
                        {duration}
                      </span>
                    )}
                  </div>
                  {description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button(s) */}
          {existingContent && !existingContent.isDraft ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSave(false)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-lg flex items-center justify-center gap-2 mb-6"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </motion.button>
          ) : (
            <div className="flex gap-3 mb-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSave(false)}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-lg flex items-center justify-center gap-2"
              >
                <span>Publish Session</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSave(true)}
                className="flex-1 py-4 rounded-2xl bg-card border-2 border-[var(--border)] text-foreground flex items-center justify-center gap-2"
              >
                <span>Save Draft</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
