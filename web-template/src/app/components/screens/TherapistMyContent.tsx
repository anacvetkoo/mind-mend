import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Eye, Heart, Edit2, Trash2, Bookmark } from 'lucide-react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Button } from '../ui/Button';
import { TherapistContentEditor } from './TherapistContentEditor';
import { getBookmarkedContentIds, getLikeCount } from '../../utils/contentInteractions';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface ContentItem {
  id: number;
  title: string;
  category: string;
  duration: string;
  gradient: string;
  views: number;
  likes: number;
  isDraft?: boolean;
  description?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  thumbnailType?: 'color' | 'image';
  thumbnailImage?: string | null;
  contentType?: 'video' | 'steps' | 'audio';
  steps?: Step[];
  audioFileName?: string;
  videoFileName?: string;
}

export function TherapistMyContent() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | undefined>(undefined);
  const [drafts, setDrafts] = useState<ContentItem[]>([]);

  // Helper function to count how many users saved a content item
  const getSavedCount = (contentId: number): number => {
    const bookmarkedIds = getBookmarkedContentIds();
    return bookmarkedIds.includes(contentId) ? 1 : 0; // In real app, this would count all users who saved
  };

  const [publishedContent, setPublishedContent] = useState<ContentItem[]>([
    {
      id: 1,
      title: 'Ocean Waves Meditation',
      category: 'Sound Therapy',
      duration: '15 min',
      gradient: 'from-[var(--muted-blue)] to-[var(--soft-purple)]',
      views: 1247,
      likes: 342
    },
    {
      id: 2,
      title: 'Deep Breathing Exercise',
      category: 'Breathing',
      duration: '8 min',
      gradient: 'from-[var(--soft-mint)] to-[var(--muted-blue)]',
      views: 892,
      likes: 215
    },
    {
      id: 3,
      title: 'Progressive Muscle Relaxation',
      category: 'Relaxation',
      duration: '20 min',
      gradient: 'from-[var(--lavender)] to-[var(--soft-pink)]',
      views: 2104,
      likes: 567
    },
    {
      id: 4,
      title: 'Morning Calm Session',
      category: 'Relaxation',
      duration: '12 min',
      gradient: 'from-[var(--soft-pink)] to-[var(--lavender)]',
      views: 1653,
      likes: 421
    }
  ]);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'relaxation', label: 'Relaxation' },
    { id: 'breathing', label: 'Breathing' },
    { id: 'sound', label: 'Sound Therapy' }
  ];

  const filteredContent = selectedFilter === 'drafts'
    ? drafts
    : selectedFilter === 'all'
    ? publishedContent
    : publishedContent.filter(item => item.category.toLowerCase().includes(selectedFilter));

  const isEmpty = filteredContent.length === 0;

  const handleAddNew = () => {
    setEditingContent(undefined);
    setShowEditor(true);
  };

  const handleEdit = (content: ContentItem) => {
    setEditingContent(content);
    setShowEditor(true);
  };

  const handleSave = (content: ContentItem, isDraft: boolean) => {
    // In a real app, this would save to a database
    console.log('Saving content:', content, 'isDraft:', isDraft);

    if (editingContent) {
      // Editing existing content
      if (editingContent.isDraft) {
        // Was a draft
        if (isDraft) {
          // Keep as draft - update the draft
          setDrafts(drafts.map(d => d.id === content.id ? { ...content, isDraft: true } : d));
        } else {
          // Publish the draft - remove from drafts, add to published
          setDrafts(drafts.filter(d => d.id !== content.id));
          const publishedItem = {
            ...content,
            views: 0,
            likes: 0,
            isDraft: false
          };
          setPublishedContent([...publishedContent, publishedItem]);
        }
      } else {
        // Editing published content - update it
        setPublishedContent(publishedContent.map(p =>
          p.id === content.id ? { ...content, views: p.views, likes: p.likes } : p
        ));
      }
    } else {
      // Creating new content
      if (isDraft) {
        const newDraft = {
          ...content,
          id: Date.now(), // Use timestamp as ID
          views: 0,
          likes: 0,
          isDraft: true
        };
        setDrafts([...drafts, newDraft]);
      } else {
        const newPublished = {
          ...content,
          id: Date.now(), // Use timestamp as ID
          views: 0,
          likes: 0,
          isDraft: false
        };
        setPublishedContent([...publishedContent, newPublished]);
      }
    }

    setShowEditor(false);
    setEditingContent(undefined);
  };

  const handleClose = () => {
    setShowEditor(false);
    setEditingContent(undefined);
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

        {/* Content Grid */}
        {!isEmpty ? (
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
                className="bg-card rounded-2xl shadow-md overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${item.gradient} flex-shrink-0`} />

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground mb-1 truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)] text-xs">
                        {item.category}
                      </span>
                      {item.duration && (
                        <span className="text-xs text-muted-foreground">{item.duration}</span>
                      )}
                      {item.isDraft && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs">
                          Draft
                        </span>
                      )}
                    </div>

                    {/* Stats - only for published content */}
                    {!item.isDraft && (
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span>{item.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="w-4 h-4" />
                          <span>{getLikeCount(item.id)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Bookmark className="w-4 h-4" />
                          <span>{getSavedCount(item.id)}</span>
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
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
          >
            <OtterMascot size="lg" emotion="sad" />
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
