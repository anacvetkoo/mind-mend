import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Plus, X } from 'lucide-react';
import {
  createSavedContentCollection,
  getSavedContentCollections,
  updateContentSavedCollections,
  type SavedContentCollection
} from '../../services/savedCollections';

interface SaveContentModalProps {
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSavedChange: (isSaved: boolean) => void;
}

export const SaveContentModal = ({
  contentId,
  isOpen,
  onClose,
  onSavedChange
}: SaveContentModalProps) => {
  const [collections, setCollections] = useState<SavedContentCollection[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveWithoutCollection, setSaveWithoutCollection] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadCollections = async () => {
      const savedCollections = await getSavedContentCollections();

      if (!isMounted) return;

      setCollections(savedCollections);
      setSelectedCollectionIds(
        savedCollections
          .filter((collection) => collection.contentIds.includes(contentId))
          .map((collection) => collection.id)
      );
      setSaveWithoutCollection(savedCollections.every(
  (collection) => !collection.contentIds.includes(contentId)
));
    };

    loadCollections();

    return () => {
      isMounted = false;
    };
  }, [contentId, isOpen]);

  if (!isOpen) return null;

  const handleToggleCollection = (collectionId: string) => {
    setSelectedCollectionIds((previousIds) =>
      previousIds.includes(collectionId)
        ? previousIds.filter((id) => id !== collectionId)
        : [...previousIds, collectionId]
    );
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    setIsSaving(true);

    const collectionId = await createSavedContentCollection(newCollectionName, contentId);
    const savedCollections = await getSavedContentCollections();

    setCollections(savedCollections);
    setSelectedCollectionIds((previousIds) => [...previousIds, collectionId]);
    setNewCollectionName('');
    setIsCreatingCollection(false);
    setIsSaving(false);
    onSavedChange(true);
  };

  const handleSave = async () => {
  setIsSaving(true);

  await updateContentSavedCollections(
  contentId,
  selectedCollectionIds,
  saveWithoutCollection || selectedCollectionIds.length > 0
);

  onSavedChange(saveWithoutCollection || selectedCollectionIds.length > 0);
  setIsSaving(false);
  onClose();
};

  const handleRemoveFromAll = async () => {
    setIsSaving(true);

    await updateContentSavedCollections(contentId, []);

    onSavedChange(false);
    setIsSaving(false);
    onClose();
  };

  return (

<div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-6">    <motion.div
        initial={{ y: 280 }}
        animate={{ y: 0 }}
        exit={{ y: 280 }}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-background rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl text-foreground">Save content</h2>
            <p className="text-sm text-muted-foreground">Choose your collections</p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="space-y-3 mb-5">

          <button
  onClick={() => setSaveWithoutCollection((previousValue) => !previousValue)}
  className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-sm mb-3"
>
  <div className="text-left">
    <p className="text-foreground">Save without collection</p>
    <p className="text-xs text-muted-foreground">
      Content will be saved to your saved content.
    </p>
  </div>

  <div
    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
      saveWithoutCollection
        ? 'bg-[var(--lavender)] border-[var(--lavender)]'
        : 'border-[var(--border)]'
    }`}
  >
    {saveWithoutCollection && <Check className="w-4 h-4 text-white" />}
  </div>
</button>
          {collections.map((savedCollection) => {
            const isSelected = selectedCollectionIds.includes(savedCollection.id);

            return (
              <button
                key={savedCollection.id}
                onClick={() => handleToggleCollection(savedCollection.id)}
                className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="text-left">
                  <p className="text-foreground">{savedCollection.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {savedCollection.contentIds.length} items
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'bg-[var(--lavender)] border-[var(--lavender)]'
                      : 'border-[var(--border)]'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {isCreatingCollection ? (
          <div className="flex gap-2 mb-5">
            <input
              value={newCollectionName}
              onChange={(event) => setNewCollectionName(event.target.value)}
              placeholder="Collection name"
              className="flex-1 px-4 py-3 rounded-2xl bg-card border-2 border-[var(--border)] text-foreground outline-none focus:border-[var(--lavender)]"
            />

            <button
              onClick={handleCreateCollection}
              disabled={isSaving}
              className="px-4 rounded-2xl bg-[var(--lavender)] text-white disabled:opacity-60"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreatingCollection(true)}
            className="w-full rounded-2xl border-2 border-dashed border-[var(--lavender)] p-4 text-[var(--lavender)] flex items-center justify-center gap-2 mb-5"
          >
            <Plus className="w-4 h-4" />
            New collection
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRemoveFromAll}
            disabled={isSaving}
            className="py-3 rounded-2xl bg-card border-2 border-[var(--border)] text-foreground disabled:opacity-60"
          >
            Remove
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="py-3 rounded-2xl bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};