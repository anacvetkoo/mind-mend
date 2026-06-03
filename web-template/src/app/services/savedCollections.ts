import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { getLibraryContent, type LibraryContentItem } from './content';

export interface SavedContentCollection {
  id: string;
  name: string;
  contentIds: string[];
  isDefault?: true;
  createdAt?: any;
  updatedAt?: any;
}

export interface SavedContentCollectionGroup extends SavedContentCollection {
  content: LibraryContentItem[];
}

const getCurrentUserId = (): string => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('User is not authenticated.');
  }

  return currentUser.uid;
};

const getSavedCollectionsRef = (userId: string) => {
  return collection(db, 'users', userId, 'savedCollections');
};

const syncSavedContentIds = async (
  contentId: string,
  shouldSaveToLibrary?: boolean
): Promise<void> => {
  const userId = getCurrentUserId();
  const collectionsSnapshot = await getDocs(getSavedCollectionsRef(userId));

  const isSavedInCollection = collectionsSnapshot.docs.some((collectionDocument) => {
    const data = collectionDocument.data() as SavedContentCollection;
    return (data.contentIds || []).includes(contentId);
  });

  const isSaved = shouldSaveToLibrary ?? isSavedInCollection;

  await setDoc(
    doc(db, 'users', userId),
    {
      savedContentIds: isSaved ? arrayUnion(contentId) : arrayRemove(contentId),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
};

export const getSavedContentCollections = async (): Promise<SavedContentCollection[]> => {
  const userId = getCurrentUserId();
  const collectionsSnapshot = await getDocs(getSavedCollectionsRef(userId));

  return collectionsSnapshot.docs
    .map((collectionDocument) => ({
      id: collectionDocument.id,
      ...collectionDocument.data(),
      contentIds: collectionDocument.data().contentIds || []
    })) as SavedContentCollection[];
};

export const createSavedContentCollection = async (
  name: string,
  contentId?: string
): Promise<string> => {
  const userId = getCurrentUserId();
  const collectionName = name.trim();

  if (!collectionName) {
    throw new Error('Collection name is required.');
  }

  const collectionDocument = await addDoc(getSavedCollectionsRef(userId), {
    name: collectionName,
    contentIds: contentId ? [contentId] : [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  if (contentId) {
    await syncSavedContentIds(contentId);
  }

  return collectionDocument.id;
};

export const updateContentSavedCollections = async (
  contentId: string,
  selectedCollectionIds: string[],
  shouldSaveToLibrary = selectedCollectionIds.length > 0
): Promise<void> => {
  const userId = getCurrentUserId();
  const collections = await getSavedContentCollections();

  await Promise.all(
    collections.map((savedCollection) => {
      const collectionRef = doc(db, 'users', userId, 'savedCollections', savedCollection.id);
      const isSelected = selectedCollectionIds.includes(savedCollection.id);
      const alreadyContainsContent = savedCollection.contentIds.includes(contentId);

      if (isSelected && !alreadyContainsContent) {
        return updateDoc(collectionRef, {
          contentIds: arrayUnion(contentId),
          updatedAt: serverTimestamp()
        });
      }

      if (!isSelected && alreadyContainsContent) {
        return updateDoc(collectionRef, {
          contentIds: arrayRemove(contentId),
          updatedAt: serverTimestamp()
        });
      }

      return Promise.resolve();
    })
  );

  await syncSavedContentIds(contentId, shouldSaveToLibrary);
};

export const getSavedContentWithoutCollection = async (): Promise<LibraryContentItem[]> => {
  const userId = getCurrentUserId();
  const userDocument = await getDoc(doc(db, 'users', userId));
  const savedContentIds = userDocument.data()?.savedContentIds || [];
  const collections = await getSavedContentCollections();
  const libraryContent = await getLibraryContent();

  const collectionContentIds = collections.flatMap((savedCollection) => savedCollection.contentIds);

  return savedContentIds
    .filter((contentId: string) => !collectionContentIds.includes(contentId))
    .map((contentId: string) => libraryContent.find((content) => content.id === contentId))
    .filter(Boolean) as LibraryContentItem[];
};

export const getSavedContentCollectionGroups = async (): Promise<SavedContentCollectionGroup[]> => {
  const collections = await getSavedContentCollections();
  const libraryContent = await getLibraryContent();

  return collections.map((savedCollection) => ({
    ...savedCollection,
    content: savedCollection.contentIds
      .map((contentId) => libraryContent.find((content) => content.id === contentId))
      .filter(Boolean) as LibraryContentItem[]
  }));
};