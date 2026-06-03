import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bookmark, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import {
  getSavedContentCollectionGroups,
  getSavedContentWithoutCollection,
  updateContentSavedCollections,
  type SavedContentCollectionGroup
} from '../../services/savedCollections';

interface SavedContentScreenProps {
  onBack: () => void;
  onSelectContent?: (content: any) => void;
}

export function SavedContentScreen({ onBack, onSelectContent }: SavedContentScreenProps) {
  const [collections, setCollections] = useState<SavedContentCollectionGroup[]>([]);
  const [savedWithoutCollection, setSavedWithoutCollection] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavedExpanded, setIsSavedExpanded] = useState(true);
const [expandedCollectionIds, setExpandedCollectionIds] = useState<string[]>([]);

  const savedContentCount =
  savedWithoutCollection.length +
  collections.reduce(
    (total, savedCollection) => total + savedCollection.content.length,
    0
  );

  useEffect(() => {
    let isMounted = true;

    const loadSavedContent = async () => {
const [savedCollections, savedLibraryContent] = await Promise.all([
  getSavedContentCollectionGroups(),
  getSavedContentWithoutCollection()
]);
      if (!isMounted) return;

      setCollections(savedCollections);
      setSavedWithoutCollection(savedLibraryContent);
      setExpandedCollectionIds(
  savedCollections
    .filter((savedCollection) => savedCollection.content.length > 0)
    .map((savedCollection) => savedCollection.id)
);
      setIsLoading(false);
    };

    loadSavedContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleCollection = (collectionId: string) => {
  setExpandedCollectionIds((previousIds) =>
    previousIds.includes(collectionId)
      ? previousIds.filter((id) => id !== collectionId)
      : [...previousIds, collectionId]
  );
};

  const handleRemoveFromCollection = async (
    collectionId: string,
    contentId: string
  ) => {
    const targetCollection = collections.find((collection) => collection.id === collectionId);

    if (!targetCollection) return;

    const updatedContentIds = targetCollection.contentIds.filter((id) => id !== contentId);

    await updateContentSavedCollections(
      contentId,
      collections
        .filter((collection) => collection.id !== collectionId)
        .filter((collection) => collection.contentIds.includes(contentId))
        .map((collection) => collection.id)
    );

    setCollections((previousCollections) =>
      previousCollections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              contentIds: updatedContentIds,
              content: collection.content.filter((content) => content.id !== contentId)
            }
          : collection
      )
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-card border-2 border-[var(--border)] flex items-center justify-center hover:border-[var(--lavender)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div>
            <h1 className="text-2xl text-foreground">Saved Content</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${savedContentCount} items`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-card rounded-2xl p-4 shadow-md animate-pulse">
                <div className="w-28 h-4 bg-muted rounded-full mb-4" />
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex-shrink-0" />
                  <div className="flex-1">
                    <div className="w-20 h-4 bg-muted rounded-full mb-3" />
                    <div className="w-full h-4 bg-muted rounded-full mb-2" />
                    <div className="w-24 h-3 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : savedContentCount === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Bookmark className="w-16 h-16 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h3 className="text-lg text-foreground mb-2">No saved content yet</h3>
            <p className="text-sm text-muted-foreground">
              Bookmark content to save it for later
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
  {savedWithoutCollection.length > 0 && (
    <div>
      <button
  onClick={() => setIsSavedExpanded((previousValue) => !previousValue)}
  className="w-full flex items-center justify-between mb-3"
>
  <div className="flex items-center gap-2">
    <Bookmark className="w-5 h-5 text-[var(--lavender)] fill-[var(--lavender)]" />
    <div className="text-left">
      <h2 className="text-lg text-foreground">Saved</h2>
      <p className="text-xs text-muted-foreground">
        {savedWithoutCollection.length} items
      </p>
    </div>
  </div>

  {isSavedExpanded ? (
    <ChevronDown className="w-5 h-5 text-muted-foreground" />
  ) : (
    <ChevronRight className="w-5 h-5 text-muted-foreground" />
  )}
</button>

    {isSavedExpanded && (
      <div className="space-y-4">
        {savedWithoutCollection.map((item, idx) => (
          <motion.div
            key={`saved-${item.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * idx }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectContent?.(item)}
            className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="flex gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={
                  item.thumbnailImage
                    ? {
                        backgroundImage: `url(${item.thumbnailImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }
                    : { background: item.thumbnailGradient }
                }
              />

              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)] text-xs mb-2">
                  {item.categoryLabel}
                </span>

                <h3 className="text-foreground mb-1 line-clamp-2">{item.title}</h3>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{item.duration}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
            </div>
    )}
  </div>
)}

  {collections
              .filter((savedCollection) => savedCollection.content.length > 0)
              .map((savedCollection) => (
                <div key={savedCollection.id}>
                  <button
  onClick={() => handleToggleCollection(savedCollection.id)}
  className="w-full flex items-center justify-between mb-3"
>
  <div className="flex items-center gap-2">
    <Folder className="w-5 h-5 text-[var(--lavender)]" />
    <div className="text-left">
      <h2 className="text-lg text-foreground">{savedCollection.name}</h2>
      <p className="text-xs text-muted-foreground">
        {savedCollection.content.length} items
      </p>
    </div>
  </div>

  {expandedCollectionIds.includes(savedCollection.id) ? (
    <ChevronDown className="w-5 h-5 text-muted-foreground" />
  ) : (
    <ChevronRight className="w-5 h-5 text-muted-foreground" />
  )}
</button>

                  {expandedCollectionIds.includes(savedCollection.id) && (
  <div className="space-y-4">
    {savedCollection.content.map((item, idx) => (
                      <motion.div
                        key={`${savedCollection.id}-${item.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectContent?.(item)}
                        className="bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer"
                      >
                        <div className="flex gap-4">
                          <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                            style={
                              item.thumbnailImage
                                ? {
                                    backgroundImage: `url(${item.thumbnailImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  }
                                : { background: item.thumbnailGradient }
                            }
                          />

                          <div className="flex-1 min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--soft-purple)]/20 text-[var(--lavender)] text-xs mb-2">
                              {item.categoryLabel}
                            </span>

                            <h3 className="text-foreground mb-1 line-clamp-2">{item.title}</h3>

                            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                              <span>{item.duration}</span>

                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRemoveFromCollection(savedCollection.id, item.id);
                                }}
                                className="text-[var(--lavender)]"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                                        ))}
                  </div>
                )}

                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}