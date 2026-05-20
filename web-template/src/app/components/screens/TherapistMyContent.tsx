import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Eye, Heart, Edit2, Trash2, Bookmark } from 'lucide-react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Button } from '../ui/Button';
import { TherapistContentEditor } from './TherapistContentEditor';
import {
  createContent,
  deleteContent,
  getTherapistContent,
  updateContent,
  type ContentFiles,
  type ContentItem,
  type LibraryContentItem
} from '../../services/content';
import { ContentDetail } from './ContentDetail';

export function TherapistMyContent() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | undefined>(undefined);
  const [previewContent, setPreviewContent] = useState<ContentItem | undefined>(undefined);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'relaxation', label: 'Relaxation' },
    { id: 'breathing', label: 'Breathing' },
    { id: 'sound', label: 'Sound Therapy' }
  ];

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const therapistContent = await getTherapistContent();
      setContentItems(therapistContent);
    } catch (error) {
      console.error('Error loading therapist content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const filteredContent = contentItems.filter((item) => {
    if (selectedFilter === 'drafts') return item.isDraft;
    if (selectedFilter === 'all') return !item.isDraft;
    if (selectedFilter === 'relaxation') return !item.isDraft && item.category === 'Relaxation';
    if (selectedFilter === 'breathing') return !item.isDraft && item.category === 'Breathing';
    if (selectedFilter === 'sound') return !item.isDraft && item.category === 'Sound Therapy';

    return !item.isDraft;
  });

  const isEmpty = filteredContent.length === 0;

  const handleAddNew = () => {
    setEditingContent(undefined);
    setShowEditor(true);
  };

  const handleEdit = (content: ContentItem) => {
    setEditingContent(content);
    setShowEditor(true);
  };

  const handlePreview = (content: ContentItem) => {
  setPreviewContent(content);
};

  const handleSave = async (content: ContentItem, isDraft: boolean, files: ContentFiles) => {
    try {
      if (editingContent?.id) {
        await updateContent(editingContent.id, content, isDraft, files);
      } else {
        await createContent(content, isDraft, files);
      }

      await fetchContent();
      setShowEditor(false);
      setEditingContent(undefined);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Something went wrong while saving content.');
    }
  };

  const handleDelete = async (contentId?: string) => {
    if (!contentId) return;

    const confirmed = window.confirm('Are you sure you want to delete this content?');

    if (!confirmed) return;

    try {
      await deleteContent(contentId);
      await fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Something went wrong while deleting content.');
    }
  };

  const handleClose = () => {
    setShowEditor(false);
    setEditingContent(undefined);
  };

const mapToContentDetailItem = (item: ContentItem): LibraryContentItem => {
  const categoryData =
    item.category === 'Sound Therapy'
      ? { category: 'sound' as const, categoryLabel: 'Sound Therapy' }
      : item.category === 'Breathing'
        ? { category: 'breathing' as const, categoryLabel: 'Breathing Technique' }
        : { category: 'relaxation' as const, categoryLabel: 'Relaxation Exercise' };

  return {
    id: item.id || '',
    title: item.title,
    category: categoryData.category,
    categoryLabel: categoryData.categoryLabel,
    duration: item.duration,
    description: item.description || '',
    difficulty: item.difficulty || 'Easy',
    therapistId: item.therapistId,
    therapistName: 'You',
    therapistAvatar: '',
    therapistTitle: 'Therapist',
    therapistBio: '',
    therapistRating: 0,
    therapistReviews: 0,
    thumbnailGradient: item.gradient,
    gradient: item.gradient,
    thumbnailType: item.thumbnailType || 'color',
    thumbnailImage: item.thumbnailUrl || item.thumbnailImage || null,
    contentType: item.contentType || 'steps',
    steps: item.steps || [],
    audioUrl: item.audioUrl,
    videoUrl: item.videoUrl,
    createdAt: item.createdAt,
    likes: item.likes || 0,
    views: item.views || 0,
    isDraft: item.isDraft
  };
};

  if (showEditor) {
    return (
      <TherapistContentEditor
        onClose={handleClose}
        onSave={handleSave}
        existingContent={editingContent}
      />
    );
  }
  if (previewContent) {
  return (
    <ContentDetail
      content={mapToContentDetailItem(previewContent)}
      onClose={() => setPreviewContent(undefined)}
    />
  );
}

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl text-foreground">My Content</h1>
            <p className="text-muted-foreground mt-1">Manage your published sessions</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="px-4 py-2 rounded-full border-2 border-[var(--lavender)] text-[var(--lavender)] text-sm flex items-center gap-2"
            data-add-content-trigger
          >
            <Plus className="w-4 h-4" />
            Add New
          </motion.button>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
                    : 'border-2 border-[var(--border)] text-foreground bg-card'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">
            Loading content...
          </div>
        ) : !isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 mb-20"
          >
            {filteredContent.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="relative bg-card rounded-2xl shadow-md overflow-hidden"
              >
                <motion.button
  whileTap={{ scale: 0.9 }}
  onClick={() => handlePreview(item)}
  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-card border border-[var(--border)] flex items-center justify-center shadow-sm z-10"
>
  <Eye className="w-4 h-4 text-[var(--muted-blue)]" />
</motion.button>
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  {item.thumbnailType === 'image' && item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${item.gradient} flex-shrink-0`} />
                  )}

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground mb-1 truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)] text-xs">
                        {item.category}
                      </span>
                      {item.duration && (
                        <span className="text-xs text-muted-foreground">{item.duration} min</span>
                      )}
                      {item.isDraft && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs">
                          Draft
                        </span>
                      )}
                    </div>

                    {!item.isDraft && (
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span>{item.views ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="w-4 h-4" />
                          <span>{item.likes ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Bookmark className="w-4 h-4" />
                          <span>0</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className={`flex gap-2 ${item.isDraft ? 'mt-3' : ''}`}>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-3 py-1.5 rounded-xl border-2 border-[var(--lavender)] text-[var(--lavender)] text-xs flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </motion.button>
                      
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 px-3 py-1.5 rounded-xl border-2 border-red-400 text-red-400 text-xs flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
          >
            <OtterMascot size="lg"  />
            <h3 className="text-xl text-foreground mt-6 mb-2">
              {selectedFilter === 'drafts'
                ? "You don't have any drafts"
                : "You haven't published any content yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {selectedFilter === 'drafts'
                ? "Save work in progress to access it later"
                : "Start creating sessions to help your clients"}
            </p>
            {selectedFilter !== 'drafts' && (
              <Button
                onClick={handleAddNew}
                className="bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white"
              >
                Publish your first session
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}